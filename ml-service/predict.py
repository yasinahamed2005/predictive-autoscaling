"""
Command-line helper for one-off predictions against the trained model.
The real serving path used by the autoscaler is api.py (FastAPI); this
script is mainly for quick sanity checks and for the mentor demo ("run
this and show the number").

Usage:
    python predict.py --recent-csv ../datasets/historical_workload.csv
"""
import argparse
import os

import joblib
import numpy as np
import pandas as pd

from train import FEATURE_COLUMNS, LAGS, ROLLING_WINDOWS  # reuse feature logic


def featurize_latest(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values("timestamp").reset_index(drop=True)
    df["hour_sin"] = np.sin(2 * np.pi * df["hour"] / 24)
    df["hour_cos"] = np.cos(2 * np.pi * df["hour"] / 24)
    df["dow_sin"] = np.sin(2 * np.pi * df["day_of_week"] / 7)
    df["dow_cos"] = np.cos(2 * np.pi * df["day_of_week"] / 7)
    for lag in LAGS:
        df[f"rps_lag_{lag}"] = df["requests_per_second"].shift(lag)
    for w in ROLLING_WINDOWS:
        df[f"rps_rollmean_{w}"] = df["requests_per_second"].rolling(w).mean()
        df[f"rps_rollstd_{w}"] = df["requests_per_second"].rolling(w).std()
    return df.dropna().reset_index(drop=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--recent-csv", default=os.path.join(os.path.dirname(__file__), "..", "datasets", "historical_workload.csv"))
    parser.add_argument("--model", default=os.path.join(os.path.dirname(__file__), "models", "workload_forecaster.joblib"))
    args = parser.parse_args()

    bundle = joblib.load(args.model)
    model, features = bundle["model"], bundle["features"]

    raw = pd.read_csv(args.recent_csv)
    feat = featurize_latest(raw)
    latest = feat.iloc[[-1]][features]

    prediction = model.predict(latest)[0]
    current = raw.iloc[-1]["requests_per_second"]
    print(f"Current RPS:          {current:.2f}")
    print(f"Predicted RPS (t+h):  {prediction:.2f}")
    print(f"Delta:                {prediction - current:+.2f}")


if __name__ == "__main__":
    main()
