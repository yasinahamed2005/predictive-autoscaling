// Steady baseline traffic -- simulates "ordinary browsing", used to check
// the system behaves under normal, non-spiky load and to give the ML
// model clean baseline data.
import http from "k6/http";
import { sleep, check } from "k6";

export const options = {
  scenarios: {
    normal: {
      executor: "constant-vus",
      vus: 10,
      duration: "10m",
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<800"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:5000/api/v1";

export default function () {
  const res = http.get(`${BASE_URL}/products`);
  check(res, { "status is 200 or 404": (r) => [200, 404].includes(r.status) });
  sleep(Math.random() * 2 + 1);
}
