#!/usr/bin/env bash
# Brings up the entire platform locally via docker-compose.
set -e
cd "$(dirname "$0")/.."
docker compose -f docker/docker-compose.yml up -d --build
echo ""
echo "Services starting. URLs once healthy:"
echo "  Frontend:    http://localhost:5173"
echo "  Backend API: http://localhost:5000/api/v1/health"
echo "  Backend metrics: http://localhost:5000/metrics"
echo "  ML service:  http://localhost:8000/docs"
echo "  Prometheus:  http://localhost:9090"
echo "  Grafana:     http://localhost:3000  (admin/admin)"
echo "  Autoscaler metrics: http://localhost:9100/metrics"
