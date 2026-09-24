# Predictive Autoscaling with Load Forecasting

Final-year capstone project. Extends the existing **Dukaan** full-stack
e-commerce application (React + Node/Express + MongoDB, ~30% baseline) into
a complete predictive autoscaling platform:

Docker → Kubernetes → Prometheus → Grafana → load testing → historical data
collection → ML workload forecasting → predictive scaling decisions →
automatic Kubernetes pod scaling → reactive-vs-predictive comparison.

See `docs/architecture/ARCHITECTURE.md` for the full data-flow diagram and
design rationale.

## What was added on top of the existing app

The existing `frontend/` and `backend/` folders are untouched except for
one addition: `backend/middleware/metrics.js` + a `/metrics` route wired
into `backend/app.js`, using `prom-client`, so Prometheus has something to
scrape. Nothing else in the original app was modified.

Everything else is new:

```
Predictive-Autoscaling/
├── frontend/            existing React app (untouched)
├── backend/              existing Express API (+ /metrics endpoint)
├── monitoring-service/    Prometheus config, Grafana dashboard, CSV collector
├── ml-service/            forecasting model: train.py / predict.py / api.py
├── autoscaler/            control loop: metrics -> forecast -> K8s scaling
├── kubernetes/            manifests for a real cluster (Minikube/Docker Desktop)
├── load-testing/          k6 scripts: normal / gradual ramp / flash sale
├── datasets/              historical_workload.csv (synthetic bootstrap data)
├── docker/                Dockerfiles + docker-compose.yml (fastest demo path)
├── scripts/               setup.sh / start.sh / stop.sh / generate-data.py
└── docs/                  architecture doc + reactive-vs-predictive report
```

---

## Option A — Fastest demo path: Docker Compose (recommended for showing your mentor)

Requirements: Docker Desktop (with Compose v2), Python 3.10+.

```bash
cd Predictive-Autoscaling

# 1. Generate historical data + train the forecasting model
#    (already included pre-generated/pre-trained in this zip — rerun any time)
python3 scripts/generate-data.py --days 14 --interval-minutes 5
cd ml-service && pip install -r requirements.txt && python3 train.py && cd ..

# 2. Bring everything up
./scripts/start.sh
# (equivalent to: docker compose -f docker/docker-compose.yml up -d --build)
```

Once containers are healthy:

| Service | URL | Notes |
|---|---|---|
| Frontend (Dukaan store) | http://localhost:5173 | the existing e-commerce UI |
| Backend API | http://localhost:5000/api/v1/health | existing API |
| Backend Prometheus metrics | http://localhost:5000/metrics | new |
| ML forecast API | http://localhost:8000/docs | FastAPI Swagger UI |
| Prometheus | http://localhost:9090 | query `dukaan_requests_per_second` |
| Grafana | http://localhost:3000 | login `admin` / `admin`; dashboard auto-loaded |
| Autoscaler metrics | http://localhost:9100/metrics | `autoscaler_*` series |

By default the autoscaler runs with `DRY_RUN=true` under docker-compose (there's
no Kubernetes cluster to scale in this mode) — it prints and exposes the
scaling decisions it *would* make. Watch it live:

```bash
docker logs -f pa-autoscaler
```

Generate traffic to see it react (requires `k6`, https://k6.io/docs/get-started/installation/):

```bash
k6 run -e SCENARIO=gradual -e BASE_URL=http://localhost:5000/api/v1 load-testing/test-script.js
k6 run -e SCENARIO=flash-sale -e BASE_URL=http://localhost:5000/api/v1 load-testing/test-script.js
```

Stop everything:

```bash
./scripts/stop.sh
```

---

## Option B — Full Kubernetes deployment (for the "real" autoscaling demo)

Requirements: Minikube or Docker Desktop Kubernetes, `kubectl`, Docker.

```bash
# 1. Start a local cluster (pick one)
minikube start --cpus=4 --memory=8192
# or enable Kubernetes in Docker Desktop settings

# 2. Build images into the cluster's image store
eval $(minikube docker-env)   # skip this line if using Docker Desktop Kubernetes
docker build -f docker/backend.Dockerfile     -t predictive-autoscaling/backend:latest .
docker build -f docker/frontend.Dockerfile    -t predictive-autoscaling/frontend:latest .
docker build -f docker/ml-service.Dockerfile  -t predictive-autoscaling/ml-service:latest .
docker build -f docker/autoscaler.Dockerfile  -t predictive-autoscaling/autoscaler:latest .

# 3. Apply manifests
kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/mongo-deployment.yaml
kubectl apply -f kubernetes/backend-deployment.yaml -f kubernetes/backend-service.yaml
kubectl apply -f kubernetes/frontend-deployment.yaml -f kubernetes/frontend-service.yaml
kubectl apply -f kubernetes/prometheus-deployment.yaml -f kubernetes/prometheus-service.yaml
kubectl apply -f kubernetes/grafana-deployment.yaml -f kubernetes/grafana-service.yaml
kubectl apply -f kubernetes/ml-service-deployment.yaml
kubectl apply -f kubernetes/autoscaler-serviceaccount.yaml \
               -f kubernetes/autoscaler-role.yaml \
               -f kubernetes/autoscaler-rolebinding.yaml \
               -f kubernetes/autoscaler-deployment.yaml

# 4. Watch replicas change live
kubectl get pods -n predictive-autoscaling -w

# 5. Access services
minikube service frontend -n predictive-autoscaling
minikube service grafana -n predictive-autoscaling
kubectl port-forward -n predictive-autoscaling svc/prometheus 9090:9090
```

Run a load test against the in-cluster backend (port-forward it first, or use
the NodePort/`minikube service` URL as `BASE_URL`), then watch
`kubectl get pods -n predictive-autoscaling -w` and the Grafana dashboard —
replica count should rise *ahead of* the load peak under the `predictive`
strategy.

To compare against plain reactive scaling, edit `AUTOSCALER_STRATEGY` in
`kubernetes/autoscaler-deployment.yaml` to `reactive`, re-apply, and repeat
the same load test.

---

## Reactive vs Predictive — offline comparison report

For a comparison you don't need a live cluster running for hours to
produce, `docs/reports/compare_strategies.py` replays the historical
dataset through both scaling policies and reports how each would have
performed (specifically, how often each strategy would have been
under-provisioned for the load that actually arrived):

```bash
cd ml-service
python3 ../docs/reports/compare_strategies.py
```

Output is written to `docs/reports/reactive_vs_predictive.json` — a sample
run is already included in this zip and shows predictive scaling
eliminating under-provisioned intervals that reactive scaling hits, at a
negligible increase in average replica count.

Model training metrics (MAE/RMSE vs a naive "next = current" baseline) are
in `ml-service/models/training_metrics.json`, generated by `train.py`.

---

## Re-training the model on real data

Once the collector has been running against a live deployment for a while:

```bash
python3 monitoring-service/collector/metrics.py --prometheus-url http://localhost:9090 --interval 15
# let it run for a few hours/days, writing to datasets/historical_workload.csv
cd ml-service && python3 train.py --data ../datasets/historical_workload.csv
```

The synthetic generator (`scripts/generate-data.py`) and the real collector
write to the exact same CSV schema, so `train.py` doesn't need to change.

---

## What to show your mentor

1. **The existing e-commerce app running normally** — nothing about it broke.
2. **Grafana dashboard** — live requests/sec, predicted vs actual load,
   replica count, p95 latency.
3. **A `k6 run -e SCENARIO=flash-sale ...` load test** while watching
   `kubectl get pods -w` (or `docker logs -f pa-autoscaler` in Compose
   dry-run mode) — replicas rising ahead of/alongside the spike.
4. **`ml-service/models/training_metrics.json`** — model beats the naive
   baseline, with real numbers.
5. **`docs/reports/reactive_vs_predictive.json`** — the head-to-head
   comparison.
6. **`docs/architecture/ARCHITECTURE.md`** — the full pipeline diagram, for
   the written report.

## Honest limitations (worth stating up front to your mentor)

- The forecasting model is trained on synthetic data by default; swap in
  a few days of real collector output before final submission for a more
  convincing evaluation.
- `RPS_PER_REPLICA` (capacity assumed per pod) is a configured constant —
  in a more rigorous version you'd derive it from an actual load test
  against a single replica rather than assuming a number.
- `DRY_RUN` mode (used under docker-compose, since there's no cluster to
  scale there) only *logs* the scaling decisions; the Kubernetes path
  (Option B) is what actually demonstrates real pod scaling.
