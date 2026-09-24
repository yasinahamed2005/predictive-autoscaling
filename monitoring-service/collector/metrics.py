"""
Historical workload collector.

Polls Prometheus on a fixed interval, pulls the metrics the ML model cares
about (request rate, active requests, p95 latency, replica count) and
appends them as rows to datasets/historical_workload.csv.

This is what turns "live monitoring" into "training data" — the ML service
trains on 5-minute aggregated time-series observations.

Usage:
    python metrics.py --prometheus-url http://localhost:9090 --interval 300
"""
import argparse
import csv
import os
import time
from datetime import datetime, timezone

import requests

DEFAULT_OUTPUT = os.path.join(
    os.path.dirname(__file__), "..", "..", "datasets", "historical_workload.csv"
)

# 5-minute time-series queries for ML model training data
QUERIES = {
    "requests_per_second": "sum(rate(dukaan_http_requests_total[5m])) or sum(dukaan_requests_per_second)",
    "active_requests": "avg_over_time(sum(dukaan_active_requests)[5m]) or sum(dukaan_active_requests)",
    "p95_latency_seconds": (
        "histogram_quantile(0.95, "
        "sum(rate(dukaan_http_request_duration_seconds_bucket[5m])) by (le))"
    ),
    "error_rate": (
        'sum(rate(dukaan_http_requests_total{status_code=~"5.."}[5m])) / '
        "clamp_min(sum(rate(dukaan_http_requests_total[5m])), 1)"
    ),
    "replica_count": 'max_over_time(count(dukaan_active_requests)[5m]) or vector(1)',
}

FIELDNAMES = ["timestamp", "hour", "day_of_week", *QUERIES.keys()]


def query_prometheus(base_url: str, expr: str):
    try:
        resp = requests.get(
            f"{base_url}/api/v1/query", params={"query": expr}, timeout=5
        )
        resp.raise_for_status()
        result = resp.json()["data"]["result"]
        if not result:
            return 0.0
        return float(result[0]["value"][1])
    except Exception as exc:  # noqa: BLE001 - collector must never crash the demo
        print(f"[collector] query failed for '{expr}': {exc}")
        return 0.0


def ensure_header(path: str):
    is_new = not os.path.exists(path) or os.path.getsize(path) == 0
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if is_new:
        with open(path, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
            writer.writeheader()


def collect_once(base_url: str, output_path: str):
    now = datetime.now(timezone.utc)
    row = {
        "timestamp": now.isoformat(),
        "hour": now.hour,
        "day_of_week": now.weekday(),
    }
    for name, expr in QUERIES.items():
        row[name] = query_prometheus(base_url, expr)

    with open(output_path, "a", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        writer.writerow(row)

    print(f"[collector] {row}")


def main():
    parser = argparse.ArgumentParser(description="Prometheus -> CSV 5-minute workload collector")
    parser.add_argument("--prometheus-url", default=os.environ.get("PROMETHEUS_URL", "http://localhost:9090"))
    parser.add_argument("--interval", type=int, default=int(os.environ.get("COLLECT_INTERVAL_SECONDS", 300)))
    parser.add_argument("--output", default=os.environ.get("OUTPUT_CSV", DEFAULT_OUTPUT))
    parser.add_argument("--once", action="store_true", help="collect a single row and exit")
    args = parser.parse_args()

    ensure_header(args.output)

    if args.once:
        collect_once(args.prometheus_url, args.output)
        return

    print(f"[collector] polling {args.prometheus_url} every {args.interval}s -> {args.output}")
    while True:
        collect_once(args.prometheus_url, args.output)
        time.sleep(args.interval)


if __name__ == "__main__":
    main()
