// Sharp, short spike -- simulates a flash sale announcement. Stress-tests
// how fast each strategy can react: reactive scaling will lag behind the
// spike; predictive scaling (if it recognises the lead-up pattern) should
// have already added capacity.
import http from "k6/http";
import { sleep, check } from "k6";

export const options = {
  scenarios: {
    flash_sale: {
      executor: "ramping-vus",
      startVUs: 5,
      stages: [
        { duration: "1m", target: 5 },     // quiet before the sale
        { duration: "30s", target: 150 },  // sale goes live -- sharp spike
        { duration: "3m", target: 150 },   // sustained peak
        { duration: "1m", target: 10 },    // sale ends, traffic drains
        { duration: "1m", target: 5 },
      ],
    },
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:5000/api/v1";

export default function () {
  const res = http.get(`${BASE_URL}/products`);
  check(res, { "status is 200 or 404": (r) => [200, 404].includes(r.status) });
  sleep(Math.random() * 0.5 + 0.1);
}
