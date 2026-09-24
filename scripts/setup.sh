#!/usr/bin/env bash
# One-time setup: generates synthetic historical data and trains the
# forecasting model, so the demo works immediately even with zero real
# traffic history yet.
set -e
cd "$(dirname "$0")/.."

echo "== 1. Generating synthetic historical workload data =="
python3 -m venv .venv-ml 2>/dev/null || true
source .venv-ml/bin/activate 2>/dev/null || true
pip install -q pandas numpy scikit-learn joblib 2>/dev/null || true
python3 scripts/generate-data.py --days 14 --interval-minutes 5

echo "== 2. Training the workload forecasting model =="
cd ml-service
pip install -q -r requirements.txt 2>/dev/null || true
python3 train.py --data ../datasets/historical_workload.csv --horizon 1
cd ..

echo "== Setup complete. Next: ./scripts/start.sh =="
