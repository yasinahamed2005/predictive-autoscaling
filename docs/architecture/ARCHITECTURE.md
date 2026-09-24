# Architecture — Predictive Autoscaling with Load Forecasting

## Data flow

```
 USERS
   |
   v
FRONTEND (React/Vite, served by nginx)
   |
   v
BACKEND (Node/Express, /api/v1/*)  --- exposes /metrics (prom-client)
   |                                        |
   v                                        v
MongoDB                               Prometheus (scrapes every 5s)
                                             |
                          +------------------+------------------+
                          |                                     |
                          v                                     v
                      Grafana                          Collector (metrics.py)
                  (dashboards, live)                            |
                                                                 v
                                                   datasets/historical_workload.csv
                                                                 |
                                                                 v
                                              ml-service: train.py -> workload_forecaster.joblib
                                                                 |
                                                                 v
                                              ml-service: api.py (FastAPI /predict)
                                                                 ^
                                                                 | forecast request
                                                        autoscaler.py (control loop)
                                                                 |
                                                     scaling_policy.py (reactive | predictive)
                                                                 |
                                                                 v
                                                    kubernetes_client.py -> K8s API
                                                                 |
                                                                 v
                                                  backend Deployment replica count
                                                       (scale up / scale down)
```

## Why this isn't just an HPA

A standard Kubernetes Horizontal Pod Autoscaler is **reactive**: it watches
current CPU/memory/custom-metric values and only adds pods once those values
are already elevated. By the time new pods are scheduled, pulled, and pass
readiness checks, the load spike may already have caused latency/errors.

This project's `autoscaler/` service instead:

1. Reads current load from Prometheus (`requests_per_second`, active
   requests, p95 latency).
2. Sends it to the ML service, which forecasts load `horizon` steps ahead
   using a gradient-boosted regression model trained on lag + rolling-window
   + time-of-day/day-of-week features (`ml-service/train.py`).
3. Feeds `max(current, predicted)` into a replica-count formula with a
   safety margin (`autoscaler/scaling/scaling_policy.py`).
4. Applies the decision via the Kubernetes Python client
   (`autoscaler/kubernetes_client.py`), respecting min/max bounds and a
   cooldown so replicas don't thrash.

The `AUTOSCALER_STRATEGY` env var can be set to `reactive` (ignores the
forecast) or `predictive` (default), so both can be run side by side and
compared — see `docs/reports/compare_strategies.py` and
`reactive_vs_predictive.json` for an offline replay comparison, and the
Grafana dashboard (`autoscaling-dashboard.json`) for a live view.

## Component responsibilities

| Component | Responsibility |
|---|---|
| `frontend/`, `backend/` | Existing Dukaan e-commerce app (~30% baseline), backend now also exposes `/metrics` |
| `monitoring-service/` | Prometheus scrape config, Grafana dashboard/provisioning, CSV collector for training data |
| `ml-service/` | Feature engineering, model training (`train.py`), and serving (`api.py`) |
| `autoscaler/` | The control loop: metrics -> forecast -> decision -> Kubernetes API |
| `kubernetes/` | Manifests to run the whole stack on a real cluster (Minikube / Docker Desktop) |
| `load-testing/` | k6 scripts for normal, gradual-ramp, and flash-sale traffic patterns |
| `docker/` | Dockerfiles + docker-compose for a one-command local demo |
| `datasets/` | Historical workload data (synthetic bootstrap + real collector output) |

## Design choices worth explaining to a mentor

- **Gradient-boosted trees over an LSTM**: the dataset is modest and the
  goal is a defensible, explainable forecast, not state-of-the-art
  accuracy. Feature importances and the naive-baseline comparison
  (`ml-service/models/training_metrics.json`) are easy to present.
- **`max(current, predicted)` rather than `predicted` alone**: prevents the
  system from scaling *down* just because the forecast is optimistic while
  real load is still high — the forecast only ever adds anticipatory
  capacity, never removes safety margin that current load already needs.
- **Cooldown + min/max bounds**: avoids flapping and runaway scaling,
  standard practice for any autoscaler.
- **Graceful degradation**: if the ML service or Kubernetes API is
  unreachable, the autoscaler logs and falls back (to "predicted = current"
  or a simulated/dry-run scale) rather than crashing — important for a live
  demo in front of a mentor.
