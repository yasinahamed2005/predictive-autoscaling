"""
Trains the workload forecasting model.

Model: gradient-boosted regression trees (scikit-learn) predicting
requests-per-second N minutes into the future (default: 5 minutes,
matching the collector interval), using lag features + time-of-day/
day-of-week features. Deliberately simple: this is a capstone project,
not a production forecasting service, and a tree ensemble is far easier
to explain to a mentor / examiner than an LSTM, while still comfortably
beating a naive "assume next = current" baseline on this data.

Usage:
    python train.py --data ../datasets/historical_workload.csv --horizon 1
"""
import argparse
import json
import os

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.model_selection import train_test_split

LAGS = [1, 2, 3, 6, 12]  # in "rows" -- at 5-min intervals this is 5/10/15/30/60 min back
ROLLING_WINDOWS = [3, 6, 12]


def build_features(df: pd.DataFrame, horizon: int) -> pd.DataFrame:
    df = df.copy()
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values("timestamp").reset_index(drop=True)

    # Cyclical encodings so midnight isn't "far" from 23:00 to the model
    df["hour_sin"] = np.sin(2 * np.pi * df["hour"] / 24)
    df["hour_cos"] = np.cos(2 * np.pi * df["hour"] / 24)
    df["dow_sin"] = np.sin(2 * np.pi * df["day_of_week"] / 7)
    df["dow_cos"] = np.cos(2 * np.pi * df["day_of_week"] / 7)

    for lag in LAGS:
        df[f"rps_lag_{lag}"] = df["requests_per_second"].shift(lag)
    for w in ROLLING_WINDOWS:
        df[f"rps_rollmean_{w}"] = df["requests_per_second"].rolling(w).mean()
        df[f"rps_rollstd_{w}"] = df["requests_per_second"].rolling(w).std()

    # Target: RPS `horizon` steps ahead of the current row
    df["target"] = df["requests_per_second"].shift(-horizon)

    df = df.dropna().reset_index(drop=True)
    return df


FEATURE_COLUMNS = (
    ["requests_per_second", "active_requests", "hour_sin", "hour_cos", "dow_sin", "dow_cos"]
    + [f"rps_lag_{l}" for l in LAGS]
    + [f"rps_rollmean_{w}" for w in ROLLING_WINDOWS]
    + [f"rps_rollstd_{w}" for w in ROLLING_WINDOWS]
)


def main():
    parser = argparse.ArgumentParser(description="Train the workload forecasting model")
    parser.add_argument("--data", default=os.path.join(os.path.dirname(__file__), "..", "datasets", "historical_workload.csv"))
    parser.add_argument("--horizon", type=int, default=1, help="steps ahead to predict (1 step = 1 collector interval, default 5 min)")
    parser.add_argument("--model-out", default=os.path.join(os.path.dirname(__file__), "models", "workload_forecaster.joblib"))
    parser.add_argument("--metrics-out", default=os.path.join(os.path.dirname(__file__), "models", "training_metrics.json"))
    args = parser.parse_args()

    raw = pd.read_csv(args.data)
    feat = build_features(raw, args.horizon)

    X = feat[FEATURE_COLUMNS]
    y = feat["target"]

    # Time-ordered split (no shuffling) -- we're forecasting the future, so
    # the test set must actually come *after* the training set in time.
    split_idx = int(len(feat) * 0.85)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]

    model = GradientBoostingRegressor(
        n_estimators=200, max_depth=3, learning_rate=0.05, random_state=42
    )
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    rmse = mean_squared_error(y_test, preds) ** 0.5

    # Naive baseline: "future RPS = current RPS" -- what a system with no
    # forecasting at all would effectively assume. Used in the report to
    # justify that the ML model is worth having.
    naive_preds = X_test["requests_per_second"]
    naive_mae = mean_absolute_error(y_test, naive_preds)
    naive_rmse = mean_squared_error(y_test, naive_preds) ** 0.5

    metrics = {
        "horizon_steps": args.horizon,
        "train_rows": len(X_train),
        "test_rows": len(X_test),
        "model_mae": round(float(mae), 4),
        "model_rmse": round(float(rmse), 4),
        "naive_baseline_mae": round(float(naive_mae), 4),
        "naive_baseline_rmse": round(float(naive_rmse), 4),
        "improvement_over_naive_pct": round(float((naive_mae - mae) / naive_mae * 100), 2) if naive_mae else None,
        "feature_columns": FEATURE_COLUMNS,
    }

    os.makedirs(os.path.dirname(args.model_out), exist_ok=True)
    joblib.dump({"model": model, "features": FEATURE_COLUMNS, "horizon": args.horizon}, args.model_out)
    with open(args.metrics_out, "w") as f:
        json.dump(metrics, f, indent=2)

    print(json.dumps(metrics, indent=2))
    print(f"\nModel saved to {args.model_out}")


if __name__ == "__main__":
    main()
