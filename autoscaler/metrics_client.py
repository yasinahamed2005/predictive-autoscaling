"""Thin client for reading current load from Prometheus."""
import requests

from config import Config


def _query(expr: str) -> float:
    try:
        resp = requests.get(
            f"{Config.PROMETHEUS_URL}/api/v1/query", params={"query": expr}, timeout=5
        )
        resp.raise_for_status()
        result = resp.json()["data"]["result"]
        return float(result[0]["value"][1]) if result else 0.0
    except Exception as exc:  # noqa: BLE001
        print(f"[metrics_client] Prometheus query failed: {exc}")
        return 0.0


def get_current_rps() -> float:
    return _query("sum(rate(dukaan_http_requests_total[30s])) or sum(dukaan_requests_per_second)")


def get_active_requests() -> float:
    return _query("sum(dukaan_active_requests)")


def get_p95_latency() -> float:
    return _query(
        "histogram_quantile(0.95, sum(rate(dukaan_http_request_duration_seconds_bucket[1m])) by (le))"
    )
