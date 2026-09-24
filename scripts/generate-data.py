"""
Synthetic historical workload generator.

A brand-new deployment has no traffic history yet, so the ML model has
nothing to train on. This script generates a realistic-looking dataset
(daily seasonality + weekday/weekend pattern + random flash-sale spikes +
noise) so the forecasting pipeline can be trained and demoed end-to-end
before real Prometheus history has accumulated.

Once the collector (monitoring-service/collector/metrics.py) has been
running for a while, swap this synthetic file for the real one -- the
ML service doesn't care which one it reads, only the column schema.

Usage:
    python scripts/generate-data.py --days 14 --interval-minutes 5
"""
import argparse
import csv
import math
import os
import random
from datetime import datetime, timedelta, timezone


def simulate(days: int, interval_minutes: int, seed: int = 42):
    random.seed(seed)
    now = datetime.now(timezone.utc)
    start = now - timedelta(days=days)
    step = timedelta(minutes=interval_minutes)

    rows = []
    t = start
    flash_sale_windows = []
    # Schedule 1-2 random "flash sale" spike windows per week of data
    num_sales = max(1, days // 5)
    for _ in range(num_sales):
        sale_start = start + timedelta(
            days=random.uniform(0, days), hours=random.uniform(0, 23)
        )
        flash_sale_windows.append((sale_start, sale_start + timedelta(hours=random.uniform(1, 3))))

    while t < now:
        hour = t.hour + t.minute / 60.0
        dow = t.weekday()  # 0=Mon .. 6=Sun

        # Daily seasonality: low overnight, peaks at lunch (13:00) and evening (20:00)
        daily = (
            0.5
            + 0.35 * math.sin((hour - 7) / 24 * 2 * math.pi)
            + 0.25 * math.exp(-((hour - 13) ** 2) / 8)
            + 0.35 * math.exp(-((hour - 20) ** 2) / 6)
        )
        weekend_boost = 1.25 if dow >= 5 else 1.0

        base_rps = 12 * daily * weekend_boost
        base_rps = max(1.0, base_rps)

        # Flash sale multiplier
        multiplier = 1.0
        for s, e in flash_sale_windows:
            if s <= t <= e:
                progress = (t - s) / (e - s)
                # Spike ramps up, peaks in the middle, ramps down
                multiplier = 1 + 9 * math.exp(-((progress - 0.5) ** 2) / 0.05)
                break

        noise = random.gauss(0, 0.08)
        rps = max(0.5, base_rps * multiplier * (1 + noise))

        active_requests = max(0, round(rps * random.uniform(0.15, 0.4)))
        p95_latency = 0.05 + (rps / 40) ** 1.5 * 0.4 + random.uniform(0, 0.03)
        error_rate = min(0.2, max(0.0, (rps / 150) ** 2 + random.uniform(-0.002, 0.004)))
        # A simple "reactive" replica count a real HPA would have chosen,
        # useful later for the reactive-vs-predictive comparison
        replica_count = max(1, min(10, math.ceil(rps / 15)))

        rows.append(
            {
                "timestamp": t.isoformat(),
                "hour": t.hour,
                "day_of_week": dow,
                "requests_per_second": round(rps, 3),
                "active_requests": active_requests,
                "p95_latency_seconds": round(p95_latency, 4),
                "error_rate": round(error_rate, 4),
                "replica_count": replica_count,
            }
        )
        t += step

    return rows


def main():
    parser = argparse.ArgumentParser(description="Generate synthetic historical workload data")
    parser.add_argument("--days", type=int, default=14)
    parser.add_argument("--interval-minutes", type=int, default=5)
    parser.add_argument(
        "--output",
        default=os.path.join(os.path.dirname(__file__), "..", "datasets", "historical_workload.csv"),
    )
    parser.add_argument(
        "--sample-output",
        default=os.path.join(os.path.dirname(__file__), "..", "datasets", "sample_data.csv"),
    )
    args = parser.parse_args()

    rows = simulate(args.days, args.interval_minutes)
    fieldnames = list(rows[0].keys())

    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    with open(args.output, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    print(f"Wrote {len(rows)} rows to {args.output}")

    # Small preview sample for quick inspection / documentation
    with open(args.sample_output, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows[:200])
    print(f"Wrote {min(200, len(rows))} preview rows to {args.sample_output}")


if __name__ == "__main__":
    main()
