"""
FastAPI prediction service.

This is what the autoscaler actually talks to. It exposes:
  GET  /health              -> liveness check
  GET  /predict              -> forecast RPS `horizon` steps ahead, using the
                                 most recent window of data it has been fed
  POST /ingest                -> push the latest metrics snapshot in (called
                                 by the collector/autoscaler each polling tick)
  GET  /metrics               -> Prometheus metrics about the ML service itself

The service keeps a small in-memory ring buffer of the most recent
observations (enough for the lag/rolling-window features train.py used) so
it doesn't need direct DB/Prometheus access itself -- callers just POST
their latest reading to /ingest and GET /predict.

Run:
    uvicorn api:app --host 0.0.0.0 --port 8000
"""
import os
import time
from collections import deque
from datetime import datetime, timezone

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from prometheus_client import Counter, Gauge, generate_latest, CONTENT_TYPE_LATEST
from pydantic import BaseModel
from starlette.responses import Response

from train import FEATURE_COLUMNS, LAGS, ROLLING_WINDOWS

MODEL_PATH = os.environ.get(
    "MODEL_PATH", os.path.join(os.path.dirname(__file__), "models", "workload_forecaster.joblib")
)
BUFFER_SIZE = max(LAGS + ROLLING_WINDOWS) + 5

app = FastAPI(title="Predictive Autoscaling - ML Forecast API")

_state = {"model_bundle": None, "buffer": deque(maxlen=BUFFER_SIZE)}

predictions_served = Counter("ml_predictions_served_total", "Total predictions served")
last_prediction_gauge = Gauge("ml_last_predicted_rps", "Most recent predicted RPS")
model_loaded_gauge = Gauge("ml_model_loaded", "1 if a trained model is loaded, else 0")


class IngestPayload(BaseModel):
    requests_per_second: float
    active_requests: float = 0
    timestamp: str | None = None


def _load_model():
    if os.path.exists(MODEL_PATH):
        _state["model_bundle"] = joblib.load(MODEL_PATH)
        model_loaded_gauge.set(1)
    else:
        _state["model_bundle"] = None
        model_loaded_gauge.set(0)


@app.on_event("startup")
def startup():
    _load_model()


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": _state["model_bundle"] is not None, "buffer_len": len(_state["buffer"])}


@app.get("/metrics")
def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.post("/ingest")
def ingest(payload: IngestPayload):
    now = datetime.now(timezone.utc)
    ts = pd.to_datetime(payload.timestamp) if payload.timestamp else now
    _state["buffer"].append(
        {
            "timestamp": ts,
            "hour": ts.hour,
            "day_of_week": ts.weekday(),
            "requests_per_second": payload.requests_per_second,
            "active_requests": payload.active_requests,
        }
    )
    return {"buffered": len(_state["buffer"])}


@app.post("/reload-model")
def reload_model():
    _load_model()
    return {"model_loaded": _state["model_bundle"] is not None}


@app.get("/predict")
def predict():
    bundle = _state["model_bundle"]
    if bundle is None:
        raise HTTPException(503, "Model not trained yet. Run train.py first.")
    if len(_state["buffer"]) < BUFFER_SIZE:
        # Not enough history yet for lag/rolling features -- fall back to
        # "predicted = latest observed" rather than erroring out, so the
        # autoscaler always has *something* to act on during warm-up.
        if _state["buffer"]:
            latest = _state["buffer"][-1]["requests_per_second"]
        else:
            latest = 0.0
        return {"predicted_rps": latest, "warmed_up": False, "horizon_steps": bundle["horizon"]}

    df = pd.DataFrame(list(_state["buffer"]))
    df["hour_sin"] = np.sin(2 * np.pi * df["hour"] / 24)
    df["hour_cos"] = np.cos(2 * np.pi * df["hour"] / 24)
    df["dow_sin"] = np.sin(2 * np.pi * df["day_of_week"] / 7)
    df["dow_cos"] = np.cos(2 * np.pi * df["day_of_week"] / 7)
    for lag in LAGS:
        df[f"rps_lag_{lag}"] = df["requests_per_second"].shift(lag)
    for w in ROLLING_WINDOWS:
        df[f"rps_rollmean_{w}"] = df["requests_per_second"].rolling(w).mean()
        df[f"rps_rollstd_{w}"] = df["requests_per_second"].rolling(w).std()
    df = df.dropna()

    if df.empty:
        latest = _state["buffer"][-1]["requests_per_second"]
        return {"predicted_rps": latest, "warmed_up": False, "horizon_steps": bundle["horizon"]}

    X = df.iloc[[-1]][bundle["features"]]
    pred = float(bundle["model"].predict(X)[0])
    pred = max(0.0, pred)

    predictions_served.inc()
    last_prediction_gauge.set(pred)

    return {
        "predicted_rps": round(pred, 3),
        "current_rps": float(df.iloc[-1]["requests_per_second"]),
        "horizon_steps": bundle["horizon"],
        "warmed_up": True,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
