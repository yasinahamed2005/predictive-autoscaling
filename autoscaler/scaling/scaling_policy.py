"""
Turns a load number into a replica count.

Two strategies live here so the demo can show them side by side:

  - reactive:   replicas = ceil(current_rps / RPS_PER_REPLICA)
                (this is what a plain Kubernetes HPA on CPU roughly amounts to --
                 it can only ever react *after* load has already risen)

  - predictive: replicas = ceil(predicted_future_rps / RPS_PER_REPLICA * SAFETY_MARGIN)
                (uses the ML forecast, so capacity is added *before* the peak hits)
"""
import math

from config import Config


def compute_replicas(rps: float) -> int:
    raw = math.ceil((rps * Config.SAFETY_MARGIN) / Config.RPS_PER_REPLICA)
    return max(Config.MIN_REPLICAS, min(Config.MAX_REPLICAS, raw))


def decide(current_rps: float, predicted_rps: float, strategy: str = None) -> dict:
    strategy = strategy or Config.STRATEGY
    if strategy == "reactive":
        target_rps = current_rps
    else:
        target_rps = max(current_rps, predicted_rps)  # never scale down below current need

    replicas = compute_replicas(target_rps)
    return {
        "strategy": strategy,
        "target_rps_used": target_rps,
        "current_rps": current_rps,
        "predicted_rps": predicted_rps,
        "desired_replicas": replicas,
    }
