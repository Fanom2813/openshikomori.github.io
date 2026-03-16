import { about } from "./about";
import { common } from "./common";
import { dataset } from "./dataset";
import { home } from "./home";
import { legal } from "./legal";
import { roadmapPage } from "./roadmapPage";

const en = {
  ...common,
  ...home,
  about,
  dataset,
  roadmapPage,
  legal,
} as const;

export default en;
