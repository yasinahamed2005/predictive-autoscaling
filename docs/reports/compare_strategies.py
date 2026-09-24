"""
Offline comparison of reactive vs predictive scaling, replayed against the
historical dataset. This is the artifact that answers requirement #13
("comparison between reactive scaling and predictive scaling") without
needing a live cluster running for hours -- it replays real recorded load
through both scaling policies and reports how each would have behaved.

Reactive:   replicas(t) = f(actual_rps(t))              -- always one step behind
Predictive: replicas(t) = f(forecast_rps(t + horizon))   -- pre-provisions ahead

Metric of interest: "under-provisioned seconds" -- time steps where the
chosen replica count would not have had enough capacity for the *actual*
load that arrived. Predictive scaling should have fewer of these because
it reacts to the forecast before the load lands.

Usage:
    cd ml-service && python ../docs/reports/compare_strategies.py
"""
import json
import math
import os
import sys

import joblib
import pandas as pd

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "ml-service"))
from train import build_features, FEATURE_COLUMNS  # noqa: E402

RPS_PER_REPLICA = 15
SAFETY_MARGIN = 1.2
MIN_REPLICAS, MAX_REPLICAS = 1, 10


def replicas_for(rps):
    raw = math.ceil((rps * SAFETY_MARGIN) / RPS_PER_REPLICA)
    return max(MIN_REPLICAS, min(MAX_REPLICAS, raw))


def main():
    root = os.path.join(os.path.dirname(__file__), "..", "..")
    data_path = os.path.join(root, "datasets", "historical_workload.csv")
    model_path = os.path.join(root, "ml-service", "models", "workload_forecaster.joblib")

    raw = pd.read_csv(data_path)
    bundle = joblib.load(model_path)
    feat = build_features(raw, horizon=bundle["horizon"])

    feat["predicted_rps"] = bundle["model"].predict(feat[FEATURE_COLUMNS]).clip(min=0)
    feat["actual_future_rps"] = feat["target"]  # the real RPS that showed up at t+horizon

    feat["reactive_replicas"] = feat["requests_per_second"].apply(replicas_for)
    feat["predictive_replicas"] = feat[["requests_per_second", "predicted_rps"]].max(axis=1).apply(replicas_for)

    feat["reactive_capacity"] = feat["reactive_replicas"] * RPS_PER_REPLICA
    feat["predictive_capacity"] = feat["predictive_replicas"] * RPS_PER_REPLICA

    feat["reactive_underprovisioned"] = feat["actual_future_rps"] > feat["reactive_capacity"]
    feat["predictive_underprovisioned"] = feat["actual_future_rps"] > feat["predictive_capacity"]

    report = {
        "rows_evaluated": len(feat),
        "reactive": {
            "avg_replicas": round(float(feat["reactive_replicas"].mean()), 2),
            "underprovisioned_steps": int(feat["reactive_underprovisioned"].sum()),
            "underprovisioned_pct": round(float(feat["reactive_underprovisioned"].mean() * 100), 2),
        },
        "predictive": {
            "avg_replicas": round(float(feat["predictive_replicas"].mean()), 2),
            "underprovisioned_steps": int(feat["predictive_underprovisioned"].sum()),
            "underprovisioned_pct": round(float(feat["predictive_underprovisioned"].mean() * 100), 2),
        },
    }
    report["predictive_reduces_underprovisioning_by_pct"] = round(
        (report["reactive"]["underprovisioned_pct"] - report["predictive"]["underprovisioned_pct"])
        / max(report["reactive"]["underprovisioned_pct"], 1e-6)
        * 100,
        2,
    )

    out_path = os.path.join(os.path.dirname(__file__), "reactive_vs_predictive.json")
    with open(out_path, "w") as f:
        json.dump(report, f, indent=2)

    print(json.dumps(report, indent=2))
    print(f"\nSaved to {out_path}")


if __name__ == "__main__":
    main()
