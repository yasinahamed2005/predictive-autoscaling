"""Wrapper around the Kubernetes Python client for reading/writing replica
counts. In DRY_RUN or when no kubeconfig/in-cluster config is available
(e.g. running the demo purely under docker-compose), it logs the intended
action instead of failing -- so the control loop is demonstrable even
without a live cluster."""
from config import Config

_client_available = False
try:
    from kubernetes import client, config as k8s_config

    try:
        if Config.IN_CLUSTER:
            k8s_config.load_incluster_config()
        else:
            k8s_config.load_kube_config()
        _apps_v1 = client.AppsV1Api()
        _client_available = True
    except Exception as exc:  # noqa: BLE001
        print(f"[kubernetes_client] No usable kube config found ({exc}); running in simulated mode.")
except ImportError:
    print("[kubernetes_client] `kubernetes` package not installed; running in simulated mode.")

_simulated_replicas = {Config.DEPLOYMENT_NAME: Config.MIN_REPLICAS}


def get_current_replicas() -> int:
    if _client_available and not Config.DRY_RUN:
        dep = client.AppsV1Api().read_namespaced_deployment(Config.DEPLOYMENT_NAME, Config.NAMESPACE)
        return dep.spec.replicas
    return _simulated_replicas[Config.DEPLOYMENT_NAME]


def set_replicas(count: int) -> bool:
    """Returns True if a scale action was actually (or would have been) applied."""
    if Config.DRY_RUN or not _client_available:
        print(f"[kubernetes_client] (dry-run/simulated) would set {Config.DEPLOYMENT_NAME} -> {count} replicas")
        _simulated_replicas[Config.DEPLOYMENT_NAME] = count
        return True

    try:
        body = {"spec": {"replicas": count}}
        client.AppsV1Api().patch_namespaced_deployment_scale(
            Config.DEPLOYMENT_NAME, Config.NAMESPACE, body
        )
        print(f"[kubernetes_client] scaled {Config.DEPLOYMENT_NAME} -> {count} replicas")
        return True
    except Exception as exc:  # noqa: BLE001
        print(f"[kubernetes_client] scale action failed: {exc}")
        return False
