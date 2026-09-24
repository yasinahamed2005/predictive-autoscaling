"""Client for the ML forecasting service."""
import requests

from config import Config


def get_predicted_rps(current_rps: float, active_requests: float) -> dict:
    """Push the latest observation to the ML service, then ask it for a
    forecast. Falls back to 'predicted = current' if the ML service is
    unreachable or still warming up, so the autoscaler degrades gracefully
    instead of crashing."""
    try:
        requests.post(
            f"{Config.ML_SERVICE_URL}/ingest",
            json={"requests_per_second": current_rps, "active_requests": active_requests},
            timeout=5,
        )
        resp = requests.get(f"{Config.ML_SERVICE_URL}/predict", timeout=5)
        resp.raise_for_status()
        return resp.json()
    except Exception as exc:  # noqa: BLE001
        print(f"[predictor] ML service unavailable, falling back to current load: {exc}")
        return {"predicted_rps": current_rps, "warmed_up": False, "horizon_steps": 1}
