import client from 'prom-client';

// One shared registry for the whole process.
export const register = new client.Registry();
client.collectDefaultMetrics({ register, prefix: 'dukaan_' });

// Requests currently being handled — this is the number the autoscaler
// and HPA-style logic care about most, since it reacts faster than CPU.
export const activeRequests = new client.Gauge({
  name: 'dukaan_active_requests',
  help: 'Number of HTTP requests currently being processed',
  registers: [register],
});

export const httpRequestsTotal = new client.Counter({
  name: 'dukaan_http_requests_total',
  help: 'Total number of HTTP requests received',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

export const httpRequestDuration = new client.Histogram({
  name: 'dukaan_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [register],
});

// Approximates "requests per second" as a gauge too, so Grafana/ML don't
// have to compute rate() themselves when reading from the collector CSV.
let windowCount = 0;
export const requestsPerSecond = new client.Gauge({
  name: 'dukaan_requests_per_second',
  help: 'Requests received in the last 1-second window',
  registers: [register],
});
setInterval(() => {
  requestsPerSecond.set(windowCount);
  windowCount = 0;
}, 1000).unref();

export const metricsMiddleware = (req, res, next) => {
  const route = req.originalUrl.split('?')[0];
  activeRequests.inc();
  windowCount += 1;
  const endTimer = httpRequestDuration.startTimer();

  res.on('finish', () => {
    activeRequests.dec();
    const labels = { method: req.method, route, status_code: res.statusCode };
    httpRequestsTotal.inc(labels);
    endTimer(labels);
  });

  next();
};

export const metricsHandler = async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
};
