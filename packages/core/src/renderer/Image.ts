import { StrV } from "../types/value";
import {
  attrAutoFillSvg,
  attrRotation,
  attrTransformCoords,
  attrWH,
} from "./AttrHelper";
import * as notFound from "./not_found";
import { ShapeProps } from "./Renderer";
import { makeIdsUnique } from "./util";

const Image = async ({
  shape,
  canvasSize,
  pathResolver,
}: ShapeProps): Promise<SVGGElement> => {
  const elem = document.createElementNS("http://www.w3.org/2000/svg", "g");
  // Keep track of which input properties we programatically mapped
  const attrToNotAutoMap: string[] = [];

  // Map/Fill the shape attributes while keeping track of input properties mapped
  const path = (shape.properties.href as StrV).contents;
  let rawSVG = await pathResolver(path);
  if (rawSVG === undefined) {
    console.error(`Could not resolve image path ${path}`);
    rawSVG = notFound.image;
  }
  attrToNotAutoMap.push("href");
  elem.innerHTML = rawSVG;
  // We assume the first svg element in the file is the one to display
  const svg = elem.querySelector("svg")!;
  makeIdsUnique(elem, false);

  attrToNotAutoMap.push(...attrWH(shape, svg));
  attrToNotAutoMap.push(...attrRotation(shape, canvasSize, elem));
  attrToNotAutoMap.push(...attrTransformCoords(shape, canvasSize, elem));

  // Directly Map across any "unknown" SVG properties
  attrAutoFillSvg(shape, elem, attrToNotAutoMap);

  return elem;
};
export default Image;
