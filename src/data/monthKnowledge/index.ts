import type { MonthKnowledge } from "../../types";
import { knowledge202605 } from "./2026-05";
import { knowledge202606 } from "./2026-06";
import { knowledge202607 } from "./2026-07";
import { knowledge202608 } from "./2026-08";
import { knowledge202609 } from "./2026-09";
import { knowledge202610 } from "./2026-10";
import { knowledge202611 } from "./2026-11";
import { knowledge202612 } from "./2026-12";
import { knowledge202701 } from "./2027-01";
import { knowledge202702 } from "./2027-02";
import { knowledge202703 } from "./2027-03";
import { knowledge202704 } from "./2027-04";

export const monthKnowledge: MonthKnowledge[] = [
  knowledge202605,
  knowledge202606,
  knowledge202607,
  knowledge202608,
  knowledge202609,
  knowledge202610,
  knowledge202611,
  knowledge202612,
  knowledge202701,
  knowledge202702,
  knowledge202703,
  knowledge202704,
];

export function getMonthKnowledge(monthId: string) {
  return monthKnowledge.find((month) => month.monthId === monthId);
}
