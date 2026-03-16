import { about } from "./about";
import { common } from "./common";
import { dataset } from "./dataset";
import { home } from "./home";
import { legal } from "./legal";
import { roadmapPage } from "./roadmapPage";

const fr = {
  ...common,
  ...home,
  about,
  dataset,
  roadmapPage,
  legal,
} as const;

export default fr;
