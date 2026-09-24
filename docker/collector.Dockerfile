FROM python:3.11-slim
WORKDIR /app
COPY monitoring-service/collector/ ./
RUN pip install --no-cache-dir requests
CMD ["python", "metrics.py"]
