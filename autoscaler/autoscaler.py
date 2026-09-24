"""
Main control loop.

    current metrics -> ML forecast -> scaling decision -> Kubernetes API
                                                          -> replica change

Runs forever, polling every Config.POLL_INTERVAL_SECONDS. Respects a
cooldown so it doesn't thrash replicas up and down every tick. Exposes its
own Prometheus metrics on :9100/metrics so Grafana can plot predicted vs
actual load and the resulting replica count -- this is the panel that
demonstrates "predictive" vs "reactive" side by side.
"""
import time
from datetime import datetime, timezone

from prometheus_client import Counter, Gauge, start_http_server

from config import Config
from metrics_client import get_active_requests, get_current_rps
from predictor.predictor import get_predicted_rps
from scaling.scaling_policy import decide
from kubernetes_client import get_current_replicas, set_replicas

predicted_load_gauge = Gauge("autoscaler_predicted_load", "Most recently predicted RPS")
current_load_gauge = Gauge("autoscaler_current_load", "Most recently observed RPS")
current_replicas_gauge = Gauge(
    "autoscaler_current_replicas", "Replica count chosen by this strategy", ["strategy"]
)
scale_events_total = Counter("autoscaler_scale_events_total", "Number of times replicas were changed", ["direction"])


def run_once(last_scale_time: float) -> float:
    current_rps = get_current_rps()
    active = get_active_requests()

    forecast = get_predicted_rps(current_rps, active)
    predicted_rps = forecast.get("predicted_rps", current_rps)

    decision = decide(current_rps, predicted_rps, strategy=Config.STRATEGY)
    desired = decision["desired_replicas"]

    predicted_load_gauge.set(predicted_rps)
    current_load_gauge.set(current_rps)
    current_replicas_gauge.labels(strategy=Config.STRATEGY).set(desired)

    current_replicas = get_current_replicas()
    now = time.time()
    in_cooldown = (now - last_scale_time) < Config.COOLDOWN_SECONDS

    ts = datetime.now(timezone.utc).isoformat()
    print(
        f"[{ts}] strategy={Config.STRATEGY} current_rps={current_rps:.2f} "
        f"predicted_rps={predicted_rps:.2f} current_replicas={current_replicas} "
        f"desired_replicas={desired} cooldown={in_cooldown}"
    )

    if desired != current_replicas and not in_cooldown:
        direction = "up" if desired > current_replicas else "down"
        applied = set_replicas(desired)
        if applied:
            scale_events_total.labels(direction=direction).inc()
            return now  # reset cooldown

    return last_scale_time


def main():
    start_http_server(Config.METRICS_PORT)
    print(
        f"[autoscaler] started. strategy={Config.STRATEGY} target={Config.NAMESPACE}/{Config.DEPLOYMENT_NAME} "
        f"min={Config.MIN_REPLICAS} max={Config.MAX_REPLICAS} poll={Config.POLL_INTERVAL_SECONDS}s "
        f"metrics on :{Config.METRICS_PORT}/metrics"
    )
    last_scale_time = 0.0
    while True:
        try:
            last_scale_time = run_once(last_scale_time)
        except Exception as exc:  # noqa: BLE001 - the control loop must never die
            print(f"[autoscaler] loop error: {exc}")
        time.sleep(Config.POLL_INTERVAL_SECONDS)


if __name__ == "__main__":
    main()
