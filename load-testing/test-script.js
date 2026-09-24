// Entry point that picks a scenario via env var, e.g.:
//   k6 run -e SCENARIO=flash-sale -e BASE_URL=http://localhost:5000/api/v1 load-testing/test-script.js
import normal from "./normal-load/normal.js";
import gradual from "./gradual-load/gradual.js";
import flashSale from "./flash-sale/flash-sale.js";

const SCENARIO = __ENV.SCENARIO || "normal";

const scenarios = { normal, gradual, "flash-sale": flashSale };

export const options = (scenarios[SCENARIO] || normal).options;
export default (scenarios[SCENARIO] || normal).default;
