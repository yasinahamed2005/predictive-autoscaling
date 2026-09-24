# 📖 Capstone Demonstration Runbook

**Project Title:** Predictive Autoscaling with Load Forecasting  
**Application Target:** Dukaan E-Commerce Platform  

---

## 🖥️ Terminal Startup Guide for Final Demonstration

### Terminal 1 — Docker Compose & Kubernetes Cluster Status
```powershell
# 1. Verify Docker Desktop & Kubernetes Status
docker ps
kubectl get nodes
kubectl get pods -n predictive-autoscaling

# 2. Deploy to Docker Desktop Kubernetes (if not already applied)
cd "C:\Users\hp\Desktop\sem1\Capstrone Project\Predictive-Autoscaling"
kubectl apply -f kubernetes/
```

---

### Terminal 2 — Live Kubernetes Replica Monitoring
```powershell
# Watch real Kubernetes backend pod scaling live
kubectl get pods -n predictive-autoscaling -w
```

---

### Terminal 3 — Machine Learning Forecaster Training & Test
```powershell
cd "C:\Users\hp\Desktop\sem1\Capstrone Project\Predictive-Autoscaling\ml-service"
py -3 train.py
py -3 predict.py
```

---

### Terminal 4 — k6 Traffic Load Generator
```powershell
cd "C:\Users\hp\Desktop\sem1\Capstrone Project\Predictive-Autoscaling"

# Execute Flash Sale Traffic Surge
k6 run -e SCENARIO=flash-sale -e BASE_URL=http://localhost:5000/api/v1 load-testing/test-script.js
```

---

## 🌐 Demonstration Web Dashboard URLs

| Service / Dashboard | URL | Credentials / Notes |
| :--- | :--- | :--- |
| **Dukaan Storefront** | [http://localhost:5173](http://localhost:5173) | Main E-Commerce Platform |
| **Grafana Autoscaling Dashboard** | [http://localhost:3000](http://localhost:3000) | `admin` / `admin` (Live RPS, Forecast, Pod Count) |
| **Prometheus Monitoring** | [http://localhost:9090](http://localhost:9090) | Query `dukaan_requests_per_second` |
| **ML Forecast API** | [http://localhost:8000/docs](http://localhost:8000/docs) | FastAPI Interactive Swagger UI |
| **Autoscaler Control Center** | [http://localhost:8090](http://localhost:8090) | Standalone Simulator & Capacity Broker |

---

## 📊 Demonstrated Pipeline Architecture
$$\text{Traffic Load (k6 / Storefront)} \longrightarrow \text{Express Prometheus Metrics (/metrics)} \longrightarrow \text{Prometheus (5s Scrape)} \longrightarrow \text{5-Minute Collector CSV} \longrightarrow \text{ML Forecaster (Predicted RPS)} \longrightarrow \text{Capacity Policy (15 RPS/Pod)} \longrightarrow \text{Kubernetes API Scaling} \longrightarrow \text{Grafana Visualization}$$
