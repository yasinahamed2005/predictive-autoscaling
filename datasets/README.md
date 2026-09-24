# datasets/

- `historical_workload.csv` — full historical time series used to train the
  forecasting model. Generated synthetically by `scripts/generate-data.py`
  (daily seasonality + weekday/weekend pattern + random flash-sale spikes +
  noise) so the pipeline is demoable before real traffic history exists.
  Once `monitoring-service/collector/metrics.py` has been running against a
  live deployment for a while, point `ml-service/train.py --data` at the
  collector's output instead — same column schema, real numbers.
- `sample_data.csv` — first 200 rows of the above, for quick inspection.

Columns: `timestamp, hour, day_of_week, requests_per_second, active_requests,
p95_latency_seconds, error_rate, replica_count`
