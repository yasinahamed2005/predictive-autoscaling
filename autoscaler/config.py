"""Central configuration for the autoscaler, all overridable via env vars
so the same image runs unmodified in docker-compose and Kubernetes."""
import os


def _bool(v, default=False):
    if v is None:
        return default
    return v.lower() in ("1", "true", "yes", "on")


class Config:
    # Where to read the current/predicted load from
    PROMETHEUS_URL = os.environ.get("PROMETHEUS_URL", "http://localhost:9090")
    ML_SERVICE_URL = os.environ.get("ML_SERVICE_URL", "http://localhost:8000")

    # What to scale
    NAMESPACE = os.environ.get("K8S_NAMESPACE", "predictive-autoscaling")
    DEPLOYMENT_NAME = os.environ.get("K8S_DEPLOYMENT_NAME", "backend")
    IN_CLUSTER = _bool(os.environ.get("K8S_IN_CLUSTER"), default=False)

    # Scaling bounds and behaviour
    MIN_REPLICAS = int(os.environ.get("MIN_REPLICAS", 1))
    MAX_REPLICAS = int(os.environ.get("MAX_REPLICAS", 10))
    # RPS a single pod is assumed to comfortably handle -- tune per real load test
    RPS_PER_REPLICA = float(os.environ.get("RPS_PER_REPLICA", 15))
    # Extra headroom so we scale up *before* pods are saturated, not exactly at the edge
    SAFETY_MARGIN = float(os.environ.get("SAFETY_MARGIN", 1.2))

    # Control loop
    POLL_INTERVAL_SECONDS = int(os.environ.get("POLL_INTERVAL_SECONDS", 15))
    COOLDOWN_SECONDS = int(os.environ.get("COOLDOWN_SECONDS", 60))  # min gap between scale actions

    # "predictive" uses the ML forecast; "reactive" only uses current load
    # (kept side by side so the dashboard can show predictive vs reactive)
    STRATEGY = os.environ.get("AUTOSCALER_STRATEGY", "predictive")

    # Metrics server for observability of the autoscaler itself
    METRICS_PORT = int(os.environ.get("AUTOSCALER_METRICS_PORT", 9100))

    DRY_RUN = _bool(os.environ.get("DRY_RUN"), default=False)
