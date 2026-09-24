// Slow ramp from quiet to busy and back down -- this is the scenario that
// best shows off *predictive* scaling: the forecaster should see the ramp
// coming and add replicas ahead of the peak, rather than reacting only
// once CPU/RPS is already high.
import http from "k6/http";
import { sleep, check } from "k6";

export const options = {
  scenarios: {
    gradual_ramp: {
      executor: "ramping-vus",
      startVUs: 2,
      stages: [
        { duration: "3m", target: 5 },
        { duration: "4m", target: 40 },
        { duration: "3m", target: 40 },
        { duration: "4m", target: 5 },
        { duration: "2m", target: 2 },
      ],
    },
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:5000/api/v1";

export default function () {
  const res = http.get(`${BASE_URL}/products`);
  check(res, { "status is 200 or 404": (r) => [200, 404].includes(r.status) });
  sleep(Math.random() * 1.5 + 0.5);
}
