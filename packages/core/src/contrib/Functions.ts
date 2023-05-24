import _ from "lodash";
import { ops } from "../engine/Autodiff";
import {
  absVal,
  acos,
  acosh,
  add,
  addN,
  and,
  asin,
  asinh,
  atan,
  atan2,
  atanh,
  cbrt,
  ceil,
  cos,
  cosh,
  div,
  eq,
  exp,
  expm1,
  floor,
  gt,
  gte,
  ifCond,
  ln,
  log10,
  log1p,
  log2,
  lt,
  max,
  min,
  minN,
  mul,
  neg,
  not,
  or,
  pow,
  round,
  sign,
  sin,
  sinh,
  sqrt,
  squared,
  sub,
  tan,
  tanh,
  trunc,
} from "../engine/AutodiffFunctions";
import { PathBuilder } from "../renderer/PathBuilder";
import { Circle } from "../shapes/Circle";
import { Ellipse } from "../shapes/Ellipse";
import { Line } from "../shapes/Line";
import { Polygon } from "../shapes/Polygon";
import { Polyline } from "../shapes/Polyline";
import { Context, uniform } from "../shapes/Samplers";
import { Shape } from "../shapes/Shapes";
import * as ad from "../types/ad";
import { CompFunc } from "../types/functions";
import {
  Color,
  ColorV,
  FloatV,
  MatrixV,
  PathDataV,
  PtListV,
  TupV,
  VectorV,
} from "../types/value";
import {
  booleanT,
  colorT,
  colorTypeT,
  floatV,
  getStart,
  linePts,
  natT,
  pathCmdT,
  pathTypeT,
  posIntT,
  real2NT,
  real2T,
  real3T,
  realNMT,
  realNT,
  realT,
  rectlikeT,
  shapeT,
  stringT,
  unionT,
  unitT,
  valueT,
} from "../utils/Util";
import {
  centerOfMass,
  elasticEnergy,
  inflectionEnergy,
  isoperimetricRatio,
  lengthK,
  maxCurvature,
  pElasticEnergy,
  perimeter,
  signedArea,
  totalCurvature,
  turningNumber,
} from "./CurveConstraints";
import { rectLineDist, shapeDistance } from "./Queries";
import { Rectlike, clamp, isRectlike, numOf } from "./Utils";

/**
 * Static dictionary of computation functions
 * TODO: consider using `Dictionary` type so all runtime lookups are type-safe, like here https://codeburst.io/five-tips-i-wish-i-knew-when-i-started-with-typescript-c9e8609029db
 * TODO: think about user extension of computation dict and evaluation of functions in there
 */

// NOTE: These all need to be written in terms of autodiff types
// These all return a Value<ad.Num>
export const compDict = {
  // TODO: Refactor derivative + derivativePre to be inlined as one case in evaluator

  makePath: {
    name: "makePath",
    description: "See https://github.com/penrose/penrose/issues/716",
    params: [
      { name: "start", description: "Start point of the path", type: real2T() },
      { name: "end", description: "End point of the path", type: real2T() },
      {
        name: "curveHeight",
        description: "Height of the curve",
        type: realT(),
      },
      {
        name: "padding",
        description: "Padding between the curve and the labels",
        type: realT(),
      },
    ],
    body: (
      _context: Context,
      start: [ad.Num, ad.Num],
      end: [ad.Num, ad.Num],
      curveHeight: ad.Num,
      padding: ad.Num
    ): PathDataV<ad.Num> => {
      // Two vectors for moving from `start` to the control point: `unit` is the direction of vector [start, end] (along the line passing through both labels) and `normalVec` is perpendicular to `unit` through the `rot90` operation.
      const unit: ad.Num[] = ops.vnormalize(ops.vsub(start, end));
      const normalVec: ad.Num[] = ops.rot90(toPt(unit));
      // There's only one control point in a quadratic bezier curve, and we want it to be equidistant to both `start` and `end`
      const halfLen: ad.Num = div(ops.vdist(start, end), 2);
      const controlPt: ad.Num[] = ops.vmove(
        ops.vmove(end, halfLen, unit),
        curveHeight,
        normalVec
      );
      const curveEnd: ad.Num[] = ops.vmove(end, padding, unit);
      // Both the start and end points of the curve should be padded by some distance such that they don't overlap with the texts
      const path = new PathBuilder();
      return path
        .moveTo(toPt(ops.vmove(start, padding, ops.vneg(unit))))
        .quadraticCurveTo(toPt(controlPt), toPt(curveEnd))
        .getPath();
    },
    returns: pathCmdT(),
  },

  /**
   * Return `i`th element of list `xs, assuming lists only hold floats.
   */
  get: {
    name: "get",
    description:
      "Return `i`th element of list `xs, assuming lists only hold floats.",
    params: [
      { name: "xs", description: "List of floats", type: realNT() },
      {
        name: "i",
        description: "Index of the element to return",
        type: natT(),
      },
    ],
    body: (_context: Context, xs: ad.Num[], i: number): FloatV<ad.Num> => {
      const res = xs[i];
      return {
        tag: "FloatV",
        contents: res,
      };
    },
    returns: realT(),
  },

  /**
   * Return a paint color of elements `r`, `g`, `b`, `a` (red, green, blue, opacity).
   */
  rgba: {
    name: "rgba",
    description:
      "Return a paint color of elements `r`, `g`, `b`, `a` (red, green, blue, opacity).",
    params: [
      { name: "r", description: "Red", type: unitT() },
      { name: "g", description: "Green", type: unitT() },
      { name: "b", description: "Blue", type: unitT() },
      { name: "a", description: "Opacity", type: unitT() },
    ],
    body: (
      _context: Context,
      r: ad.Num,
      g: ad.Num,
      b: ad.Num,
      a: ad.Num
    ): ColorV<ad.Num> => {
      return {
        tag: "ColorV",
        contents: {
          tag: "RGBA",
          contents: [r, g, b, a],
        },
      };
    },
    returns: valueT("Color"),
  },

  selectColor: {
    name: "selectColor",
    params: [
      { name: "color1", description: "First color", type: colorT() },
      { name: "color2", description: "Second color", type: colorT() },
      { name: "level", description: "Level", type: realT() },
    ],
    body: (
      _context: Context,
      color1: Color<ad.Num>,
      color2: Color<ad.Num>,
      level: ad.Num
    ): ColorV<ad.Num> => {
      const half = div(level, 2);
      const even = eq(half, trunc(half)); // autodiff doesn't have a mod operator
      if (!(color1.tag === "RGBA" && color2.tag === "RGBA")) {
        throw Error("selectColor only supports RGBA");
      }
      return {
        tag: "ColorV",
        contents: {
          tag: "RGBA",
          // https://github.com/penrose/penrose/issues/561
          contents: [
            ifCond(even, color1.contents[0], color2.contents[0]),
            ifCond(even, color1.contents[1], color2.contents[1]),
            ifCond(even, color1.contents[2], color2.contents[2]),
            ifCond(even, color1.contents[3], color2.contents[3]),
          ],
        },
      };
    },
    returns: colorT(),
  },

  /**
   * Return a paint color of elements `h`, `s`, `v`, `a` (hue, saturation, value, opacity).
   */
  hsva: {
    name: "hsva",
    description:
      "Return a paint color of elements `h`, `s`, `v`, `a` (hue, saturation, value, opacity).",
    params: [
      { name: "h", description: "Hue", type: unitT() },
      { name: "s", description: "Saturation", type: unitT() },
      { name: "v", description: "Value", type: unitT() },
      { name: "a", description: "Opacity", type: unitT() },
    ],
    body: (
      _context: Context,
      h: ad.Num,
      s: ad.Num,
      v: ad.Num,
      a: ad.Num
    ): ColorV<ad.Num> => {
      return {
        tag: "ColorV",
        contents: {
          tag: "HSVA",
          contents: [h, s, v, a],
        },
      };
    },
    returns: colorT(),
  },

  /**
   * Return a paint of none (no paint)
   */
  none: {
    name: "none",
    description: "Return a paint of none (no paint)",
    params: [],
    body: (_context: Context): ColorV<ad.Num> => {
      return {
        tag: "ColorV",
        contents: {
          tag: "NONE",
        },
      };
    },
    returns: valueT("Color"),
  },

  /**
   * Return `acosh(x)`.
   */
  acosh: {
    name: "acosh",
    description: "Return `acosh(x)`.",
    params: [{ name: "x", description: "`x`", type: realT() }],
    body: (_context: Context, x: ad.Num): FloatV<ad.Num> => {
      return {
        tag: "FloatV",
        contents: acosh(x),
      };
    },
    returns: valueT("Real"),
  },

  /**
   * Return `acos(x)`.
   */
  acos: {
    name: "acos",
    description: "Return `acos(x)`.",
    params: [{ name: "x", description: "`x`", type: realT() }],
    body: (_context: Context, x: ad.Num): FloatV<ad.Num> => {
      return {
        tag: "FloatV",
        contents: acos(x),
      };
    },
    returns: valueT("Real"),
  },

  /**
   * Return `asin(x)`.
   */
  asin: {
    name: "asin",
    description: "Return `asin(x)`.",
    params: [{ name: "x", description: "`x`", type: realT() }],
    body: (_context: Context, x: ad.Num): FloatV<ad.Num> => {
      return {
        tag: "FloatV",
        contents: asin(x),
      };
    },
    returns: valueT("Real"),
  },

  /**
   * Return `asinh(x)`.
   */
  asinh: {
    name: "asinh",
    description: "Return `asinh(x)`.",
    params: [{ name: "x", description: "`x`", type: realT() }],
    body: (_context: Context, x: ad.Num): FloatV<ad.Num> => {
      return {
        tag: "FloatV",
        contents: asinh(x),
      };
    },
    returns: valueT("Real"),
  },

  /**
   * Return `atan(x)`.
   */
  atan: {
    name: "atan",
    description: "Return `atan(x)`.",
    params: [{ name: "x", description: "`x`", type: realT() }],
    body: (_context: Context, x: ad.Num): FloatV<ad.Num> => {
      return {
        tag: "FloatV",
        contents: atan(x),
      };
    },
    returns: valueT("Real"),
  },

  /**
   * Return `atan2(y,x)`.
   */
  atan2: {
    name: "atan2",
    description: "Return `atan2(x, y)`.",
    params: [
      { name: "x", description: "`x`", type: realT() },
      { name: "y", description: "`y`", type: realT() },
    ],
    body: (_context: Context, x: ad.Num, y: ad.Num): FloatV<ad.Num> => {
      return {
        tag: "FloatV",
        contents: atan2(y, x),
      };
    },
    returns: valueT("Real"),
  },

  /**
   * Return `atanh(x)`.
   */
  atanh: {
    name: "atanh",
    description: "Return `atanh(x)`.",
    params: [{ name: "x", description: "`x`", type: realT() }],
    body: (_context: Context, x: ad.Num): FloatV<ad.Num> => {
      return {
        tag: "FloatV",
        contents: atanh(x),
      };
    },
    returns: valueT("Real"),
  },

  /**
   * Return `cbrt(x)`.
   */
  cbrt: {
    name: "cbrt",
    description: "Return `cbrt(x)`.",
    params: [{ name: "x", description: "`x`", type: realT() }],
    body: (_context: Context, x: ad.Num): FloatV<ad.Num> => {
      return {
        tag: "FloatV",
        contents: cbrt(x),
      };
    },
    returns: valueT("Real"),
  },

  /**
   * Return `ceil(x)`.
   */
  ceil: {
    name: "ceil",
    description: "Return `ceil(x)`.",
    params: [{ name: "x", description: "`x`", type: realT() }],
    body: (_context: Context, x: ad.Num): FloatV<ad.Num> => {
      return {
        tag: "FloatV",
        contents: ceil(x),
      };
    },
    returns: valueT("Real"),
  },

  /**
   * Return `cos(x)`.
   */
  cos: {
    name: "cos",
    description: "Return `cos(x)`.",
    params: [{ name: "x", description: "`x`", type: realT() }],
    body: (_context: Context, x: ad.Num): FloatV<ad.Num> => {
      return {
        tag: "FloatV",
        contents: cos(x),
      };
    },
    returns: valueT("Real"),
  },

  /**
   * Return `cosh(x)`.
   */
  cosh: {
    name: "cosh",
    description: "Return `cosh(x)`.",
    params: [{ name: "x", description: "`x`", type: realT() }],
    body: (_context: Context, x: ad.Num): FloatV<ad.Num> => {
      return {
        tag: "FloatV",
        contents: cosh(x),
      };
    },
    returns: valueT("Real"),
  },

  /**
   * Return `exp(x)`.
   */
  exp: {
    name: "exp",
    description: "Return `exp(x)`.",
    params: [{ name: "x", description: "`x`", type: realT() }],
    body: (_context: Context, x: ad.Num): FloatV<ad.Num> => {
      return {
        tag: "FloatV",
        contents: exp(x),
      };
    },
    returns: valueT("Real"),
  },

  /**
   * Return `expm1(x)`.
   */
  expm1: {
    name: "expm1",
    description: "Return `expm1(x)`.",
    params: [{ name: "x", description: "`x`", type: realT() }],
    body: (_context: Context, x: ad.Num): FloatV<ad.Num> => {
      return {
        tag: "FloatV",
        contents: expm1(x),
      };
    },
    returns: valueT("Real"),
  },

  /**
   * Return `floor(x)`.
   */
  floor: {
    name: "floor",
    description: "Return `floor(x)`.",
    params: [{ name: "x", description: "`x`", type: realT() }],
    body: (_context: Context, x: ad.Num): FloatV<ad.Num> => {
      return {
        tag: "FloatV",
        contents: floor(x),
      };
    },
    returns: valueT("Real"),
  },

  /**
   * Return `log(x)`.
   */
  log: {
    name: "log",
    description: "Return `log(x)`.",
    params: [{ name: "x", description: "`x`", type: realT() }],
    body: (_context: Context, x: ad.Num): FloatV<ad.Num> => {
      return {
        tag: "FloatV",
        contents: ln(x),
      };
    },
    returns: valueT("Real"),
  },

  /**
   * Return `log2(x)`.
   */
  log2: {
    name: "log2",
    description: "Return `log2(x)`.",
    params: [{ name: "x", description: "`x`", type: realT() }],
    body: (_context: Context, x: ad.Num): FloatV<ad.Num> => {
      return {
        tag: "FloatV",
        contents: log2(x),
      };
    },
    returns: valueT("Real"),
  },

  /**
   * Return `log10(x)`.
   */
  log10: {
    name: "log10",
    description: "Return `log10(x)`.",
    params: [{ name: "x", description: "`x`", type: realT() }],
    body: (_context: Context, x: ad.Num): FloatV<ad.Num> => {
      return {
        tag: "FloatV",
        contents: log10(x),
      };
    },
    returns: valueT("Real"),
  },

  /**
   * Return `log1p(x)`.
   */
  log1p: {
    name: "log1p",
    description: "Return `log1p(x)`.",
    params: [{ name: "x", description: "`x`", type: realT() }],
    body: (_context: Context, x: ad.Num): FloatV<ad.Num> => {
      return {
        tag: "FloatV",
        contents: log1p(x),
      };
    },
    returns: valueT("Real"),
  },

  /**
   * Return `pow(x,y)`.
   */
  pow: {
    name: "pow",
    description: "Return `pow(x, y)`.",
    params: [
      { name: "x", description: "`x`", type: realT() },
      { name: "y", description: "`y`", type: realT() },
    ],
    body: (_context: Context, x: ad.Num, y: ad.Num): FloatV<ad.Num> => {
      return {
        tag: "FloatV",
        contents: pow(x, y),
      };
    },
    returns: valueT("Real"),
  },

  /**
   * Return `round(x)`.
   */
  round: {
    name: "round",
    description: "Return `round(x)`.",
    params: [{ name: "x", description: "`x`", type: realT() }],
    body: (_context: Context, x: ad.Num): FloatV<ad.Num> => {
      return {
        tag: "FloatV",
        contents: round(x),
      };
    },
    returns: valueT("Real"),
  },

  /**
   * Return `sign(x)`.
   */
  sign: {
    name: "sign",
    description: "Return `sign(x)`.",
    params: [{ name: "x", description: "`x`", type: realT() }],
    body: (_context: Context, x: ad.Num): FloatV<ad.Num> => {
      return {
        tag: "FloatV",
        contents: sign(x),
      };
    },
    returns: valueT("Real"),
  },

  /**
   * Return `sin(x)`.
   */
  sin: {
    name: "sin",
    description: "Return `sin(x)`.",
    params: [{ name: "x", description: "`x`", type: realT() }],
    body: (_context: Context, x: ad.Num): FloatV<ad.Num> => {
      return {
        tag: "FloatV",
        contents: sin(x),
      };
    },
    returns: valueT("Real"),
  },

  /**
   * Return `sinh(x)`.
   */
  sinh: {
    name: "sinh",
    description: "Return `sinh(x)`.",
    params: [{ name: "x", description: "`x`", type: realT() }],
    body: (_context: Context, x: ad.Num): FloatV<ad.Num> => {
      return {
        tag: "FloatV",
        contents: sinh(x),
      };
    },
    returns: valueT("Real"),
  },

  /**
   * Return `tan(x)`.
   */
  tan: {
    name: "tan",
    description: "Return `tan(x)`.",
    params: [{ name: "x", description: "`x`", type: realT() }],
    body: (_context: Context, x: ad.Num): FloatV<ad.Num> => {
      return {
        tag: "FloatV",
        contents: tan(x),
      };
    },
    returns: valueT("Real"),
  },

  /**
   * Return `tanh(x)`.
   */
  tanh: {
    name: "tanh",
    description: "Return `tanh(x)`.",
    params: [{ name: "x", description: "`x`", type: realT() }],
    body: (_context: Context, x: ad.Num): FloatV<ad.Num> => {
      return {
        tag: "FloatV",
        contents: tanh(x),
      };
    },
    returns: valueT("Real"),
  },

  /**
   * Return `trunc(x)`.
   */
  trunc: {
    name: "trunc",
    description: "Return `trunc(x)`.",
    params: [{ name: "x", description: "`x`", type: realT() }],
    body: (_context: Context, x: ad.Num): FloatV<ad.Num> => {
      return {
        tag: "FloatV",
        contents: trunc(x),
      };
    },
    returns: valueT("Real"),
  },

  /**
   * Return the dot product of `v` and `w`.
   */
  dot: {
    name: "dot",
    description: "Return the dot product of `v` and `w`.",
    params: [
      { name: "v", description: "Vector `v`", type: realNT() },
      { name: "w", description: "Vector `w`", type: realNT() },
    ],
    body: (_context: Context, v: ad.Num[], w: ad.Num[]): FloatV<ad.Num> => {
      return {
        tag: "FloatV",
        contents: ops.vdot(v, w),
      };
    },
    returns: valueT("Real"),
  },

  /**
   * Return the outer product of `u` and `v`.
   */
  outerProduct: {
    name: "outerProduct",
    description: "Return the outer product of `v` and `w`.",
    params: [
      { name: "v", description: "Vector `v`", type: realNT() },
      { name: "w", description: "Vector `w`", type: realNT() },
    ],
    body: (_context: Context, u: ad.Num[], v: ad.Num[]): MatrixV<ad.Num> => {
      return {
        tag: "MatrixV",
        contents: ops.vouter(u, v),
      };
    },
    returns: valueT("RealNM"),
  },

  /**
   * Return the length of the line or arrow shape `[type, props]`.
   */
  length: {
    name: "length",
    description: "Return the length of the Line shape.",
    params: [{ name: "l", description: "A line", type: shapeT("Line") }],
    body: (_context: Context, shape: Line<ad.Num>): FloatV<ad.Num> => {
      const [p1, p2] = linePts(shape);
      return {
        tag: "FloatV",
        contents: ops.vdist(p1, p2),
      };
    },
    returns: valueT("Real"),
  },
  /**
   * Return the normalized version of vector `v`.
   */
  normalize: {
    name: "normalize",
    description: "Return the normalized version of vector `v`.",
    params: [{ type: realNT(), name: "v", description: "Vector `v`" }],
    body: (_context: Context, v: ad.Num[]): VectorV<ad.Num> => {
      return {
        tag: "VectorV",
        contents: ops.vnormalize(v),
      };
    },
    returns: valueT("RealN"),
  },

  /**
   * Given a list of points `pts`, returns a `PathData` that can be used as input to the `Path` shape's `pathData` attribute to be drawn on the screen.
   */
  pathFromPoints: {
    name: "pathFromPoints",
    description:
      "Given a list of points `pts`, returns a `PathData` that can be used as input to the `Path` shape's `pathData` attribute to be drawn on the screen.",
    params: [
      { name: "pathType", type: pathTypeT(), description: "Path Type" },
      { name: "pts", type: real2NT(), description: "List of points" },
    ],
    body: (
      _context: Context,
      pathType: string,
      pts: ad.Pt2[]
    ): PathDataV<ad.Num> => {
      const path = new PathBuilder();
      const [start, ...tailpts] = pts;
      path.moveTo(start);
      tailpts.forEach((pt: ad.Pt2) => path.lineTo(pt));
      if (pathType === "closed") path.closePath();
      return path.getPath();
    },
    returns: valueT("PathCmd"),
  },

  /**
   * Given a list of points `pts`, returns a `PathData` that can be used as input to the `Path` shape's `pathData` attribute to be drawn on the screen.
   */
  quadraticCurveFromPoints: {
    name: "quadraticCurveFromPoints",
    description:
      "Given a list of points `pts`, returns a `PathData` that can be used as input to the `Path` shape's `pathData` attribute to be drawn on the screen.",
    params: [
      { name: "pathType", type: pathTypeT(), description: "Path Type" },
      { name: "pts", type: real2NT(), description: "List of points" },
    ],
    body: (
      _context: Context,
      pathType: string,
      pts: ad.Pt2[]
    ): PathDataV<ad.Num> => {
      const path = new PathBuilder();
      const [start, cp, second, ...tailpts] = pts;
      path.moveTo(start);
      path.quadraticCurveTo(cp, second);
      tailpts.forEach((pt: ad.Pt2) => path.quadraticCurveJoin(pt));
      if (pathType === "closed") path.closePath();
      return path.getPath();
    },
    returns: valueT("PathCmd"),
  },

  /**
   * Draw a curve interpolating three given points.
   * (Note that this is different from specifying the
   * three control points of a quadratic Bézier curve,
   * since a Bézier does not interpolate the middle
   * control point.)
   */
  interpolateQuadraticFromPoints: {
    name: "interpolateQuadraticFromPoints",
    description: `Draw a curve interpolating three given points.
    (Note that this is different from specifying the three control points of a quadratic Bézier curve, since a Bézier does not interpolate the middle control point.)`,
    params: [
      { name: "pathType", type: pathTypeT(), description: "Path Type" },
      { name: "p0", type: real2T(), description: "First point" },
      { name: "p1", type: real2T(), description: "Second point" },
      { name: "p2", type: real2T(), description: "Third point" },
    ],
    body: (
      _context: Context,
      pathType: string,
      p0: ad.Pt2,
      p1: ad.Pt2,
      p2: ad.Pt2
    ): PathDataV<ad.Num> => {
      const path = new PathBuilder();
      path.moveTo(p0);
      // Compute the control point location q1 such that the
      // quadratic curve interpolates the midpoint p1, namely,
      //    q1 = 2 p1 - (p0+p2)/2
      // (This expression can be derived by expressing the
      // interpolation condition in terms of the quadratic
      // Bernstein basis.)
      const q1 = ops.vsub(ops.vmul(2.0, p1), ops.vmul(0.5, ops.vadd(p0, p2)));
      if (!ad.isPt2(q1)) {
        // XXX kludge to force TypeScript to know that q1 has length 2; see GitHub issue #715
        throw new Error("vector ops did not preserve dimension");
      }
      path.quadraticCurveTo(q1, p2);
      if (pathType === "closed") path.closePath();
      return path.getPath();
    },
    returns: valueT("PathCmd"),
  },

  /**
   * Given a list of points `pts`, returns a `PathData` that can be used as input to the `Path` shape's `pathData` attribute to be drawn on the screen.
   */
  cubicCurveFromPoints: {
    name: "cubicCurveFromPoints",
    description:
      "Given a list of points `pts`, returns a `PathData` that can be used as input to the `Path` shape's `pathData` attribute to be drawn on the screen.",

    params: [
      { type: pathTypeT(), name: "pathType", description: "Path type" },
      { type: real2NT(), name: "pts", description: "List of points" },
    ],
    body: (
      _context: Context,
      pathType: string,
      pts: ad.Pt2[]
    ): PathDataV<ad.Num> => {
      const path = new PathBuilder();
      const [start, cp1, cp2, second, ...tailpts] = pts;
      path.moveTo(start);
      path.bezierCurveTo(cp1, cp2, second);
      _.chunk(tailpts, 2).forEach(([cp, pt]) => path.cubicCurveJoin(cp, pt));
      if (pathType === "closed") path.closePath();
      return path.getPath();
    },
    returns: valueT("PathCmd"),
  },

  /**
   * Return two points parallel to line `s1` using its normal line `s2`.
   */
  unitMark: {
    name: "unitMark",
    description:
      "Return two points parallel to line `s1` using its normal line `s2`.",
    params: [
      { name: "s1", type: shapeT("Line") },
      { name: "s2", type: shapeT("Line") },
      { name: "padding", type: realT() },
    ],
    body: (
      _context: Context,
      s1: Line<ad.Num>,
      s2: Line<ad.Num>,
      padding: ad.Num
    ): PtListV<ad.Num> => {
      const [start1, end1] = linePts(s1);
      const [start2, end2] = linePts(s2);

      const dir = ops.vnormalize(ops.vsub(end2, start2));
      const normalDir = ops.vneg(dir);
      const markStart = ops.vmove(start1, padding, normalDir);
      const markEnd = ops.vmove(end1, padding, normalDir);

      return {
        tag: "PtListV",
        contents: [markStart, markEnd].map(toPt),
      };
    },
    returns: valueT("Real2N"),
  },

  /**
   * Return two points to "cap off" the line made in `unitMark`.
   */
  unitMark2: {
    name: "unitMark2",
    description: 'Return two points to "cap off" the line made in `unitMark`.',
    params: [
      { name: "[start, end]", type: real2NT() },
      { name: "t", type: stringT() },
      { name: "size", type: realT() },
    ],
    body: (
      _context: Context,
      [start, end]: [ad.Pt2, ad.Pt2],
      t: string,
      size: ad.Num
    ): PtListV<ad.Num> => {
      const dir = ops.vnormalize(ops.vsub(end, start));
      const normalDir = ops.rot90(toPt(dir));
      const base = t === "start" ? start : end;
      const [markStart, markEnd] = [
        ops.vmove(base, size, normalDir),
        ops.vmove(base, neg(size), normalDir),
      ];
      return {
        tag: "PtListV",
        contents: [markStart, markEnd].map(toPt),
      };
    },
    returns: valueT("Real2N"),
  },

  /**
   * Return series of elements that can render an arc SVG. See: https://css-tricks.com/svg-path-syntax-illustrated-guide/ for the "A" spec.
   * @param pathType: either "open" or "closed." whether the SVG should automatically draw a line between the final point and the start point
   * @param start: coordinate to start drawing the arc
   * @param end: coordinate to finish drawing the arc
   * @param radius: width and height of the ellipse to draw the arc along (i.e. [width, height])
   * @param rotation: angle in degrees to rotate ellipse about its center
   * @param largeArc: 0 to draw shorter of 2 arcs, 1 to draw longer
   * @param arcSweep: 0 to rotate CCW, 1 to rotate CW
   * @returns: Elements that can be passed to Path shape spec to render an SVG arc
   */
  arc: {
    name: "arc",
    description: `Return series of elements that can render an arc SVG. See: https://css-tricks.com/svg-path-syntax-illustrated-guide/ for the "A" spec. Returns elements that can be passed to Path shape spec to render an SVG arc.`,
    params: [
      {
        name: "pathType",
        type: pathTypeT(),
        description: `The path type: either "open" or "closed." whether the SVG should automatically draw a line between the final point and the start point`,
      },
      {
        name: "start",
        type: real2T(),
        description: "coordinate to start drawing the arc",
      },
      {
        name: "end",
        type: real2T(),
        description: "coordinate to finish drawing the arc",
      },
      {
        name: "[width, height]",
        type: real2T(),
        description: "width and height of the ellipse to draw the arc along",
      },
      {
        name: "rotation",
        type: realT(),
        description: "angle in degrees to rotate ellipse about its center",
      },
      {
        name: "largeArc",
        type: realT(),
        description: "0 to draw shorter of 2 arcs, 1 to draw longer",
      },
      {
        name: "arcSweep",
        type: realT(),
        description: "0 to rotate CCW, 1 to rotate CW",
      },
    ],
    body: (
      _context: Context,
      pathType: string,
      start: ad.Pt2,
      end: ad.Pt2,
      radius: ad.Pt2,
      rotation: ad.Num,
      largeArc: ad.Num,
      arcSweep: ad.Num
    ): PathDataV<ad.Num> => {
      const path = new PathBuilder();
      path.moveTo(start).arcTo(radius, end, [rotation, largeArc, arcSweep]);
      if (pathType === "closed") path.closePath();
      return path.getPath();
    },
    returns: valueT("PathCmd"),
  },

  repeatedArcs: {
    name: "repeatedArcs",
    description:
      "Generate multiple concentric arcs. Useful for denoting equal angles.",
    params: [
      {
        name: "innerStart",
        type: real2T(),
        description: "coordinate to start drawing the inner arc",
      },
      {
        name: "innerEnd",
        type: real2T(),
        description: "coordinate to end the inner arc",
      },
      {
        name: "outerStart",
        type: real2T(),
        description: "coordinate to start drawing the outer arc",
      },
      {
        name: "outerEnd",
        type: real2T(),
        description: "coordinate to end the outer arc",
      },
      {
        name: "innerRadius",
        type: real2T(),
        description:
          "radii of the ellipse to draw the inner arc along (width, height)",
      },
      {
        name: "repeat",
        type: posIntT(),
        description: "number of times to repeat the arc",
      },
      {
        name: "spacing",
        type: realT(),
        description: "spacing between arcs",
      },
      {
        name: "arcSweep",
        type: realT(),
        description: "arc length to sweep",
      },
    ],
    body: (
      _context: Context,
      innerStart: ad.Pt2,
      innerEnd: ad.Pt2,
      outerStart: ad.Pt2,
      outerEnd: ad.Pt2,
      innerRadius: ad.Pt2,
      repeat: number,
      spacing: ad.Num,
      arcSweep: ad.Num
    ): PathDataV<ad.Num> => {
      const path = new PathBuilder();
      const startDir = ops.vnormalize(ops.vsub(outerStart, innerStart));
      const endDir = ops.vnormalize(ops.vsub(outerEnd, innerEnd));
      let start: ad.Pt2 = innerStart;
      let end: ad.Pt2 = innerEnd;
      let radius = innerRadius;
      for (let i = 0; i < repeat; i++) {
        path.moveTo(start).arcTo(radius, end, [0, 0, arcSweep]);
        // TODO: avoid casting to `ad.Pt2`
        start = ops.vmove(start, spacing, startDir) as ad.Pt2;
        end = ops.vmove(end, spacing, endDir) as ad.Pt2;
        radius = ops.vadd(radius, [spacing, spacing]) as ad.Pt2;
      }
      return path.getPath();
    },
    returns: valueT("PathCmd"),
  },

  /**
   * Return series of elements that render a "wedge", which is the same as the arc above except that it's connected to the circle center and filled
   * @param center: center of the circle on which the arc sits
   * @param start: coordinate to start drawing the arc
   * @param end: coordinate to finish drawing the arc
   * @param radius: width and height of the ellipse to draw the arc along (i.e. [width, height])
   * @param rotation: angle in degrees to rotate ellipse about its center
   * @param largeArc: 0 to draw shorter of 2 arcs, 1 to draw longer
   * @param arcSweep: 0 to rotate CCW, 1 to rotate CW
   * @returns: Elements that can be passed to Path shape spec to render an SVG arc
   */
  wedge: {
    name: "wedge",
    description: `Return series of elements that render a "wedge", which is the same as the arc above except that it's connected to the circle center and filled. Returns elements that can be passed to Path shape spec to render an SVG arc.`,
    params: [
      {
        name: "center",
        type: real2T(),
        description: "center of the circle on which the arc sits",
      },
      {
        name: "start",
        type: real2T(),
        description: "coordinate to start drawing the arc",
      },
      {
        name: "end",
        type: real2T(),
        description: "coordinate to finish drawing the arc",
      },
      {
        name: "radius",
        type: real2T(),
        description:
          "width and height of the ellipse to draw the arc along (i.e. [width, height])",
      },
      {
        name: "rotation",
        type: realT(),
        description: "angle in degrees to rotate ellipse about its center",
      },
      {
        name: "largeArc",
        type: realT(),
        description: "0 to draw shorter of 2 arcs, 1 to draw longer",
      },
      {
        name: "arcSweep",
        type: realT(),
        description: "0 to rotate CCW, 1 to rotate CW",
      },
    ],
    body: (
      _context: Context,
      center: ad.Pt2,
      start: ad.Pt2,
      end: ad.Pt2,
      radius: ad.Pt2,
      rotation: ad.Num,
      largeArc: ad.Num,
      arcSweep: ad.Num
    ): PathDataV<ad.Num> => {
      const path = new PathBuilder();
      path
        .moveTo(start)
        .arcTo(radius, end, [rotation, largeArc, arcSweep])
        .lineTo(center);
      path.closePath();
      return path.getPath();
    },
    returns: valueT("PathCmd"),
  },
  /**
   * Find the point that is located at dist r along a line between p1 and p2.
   * @param p1: start point of line segment
   * @param p2: endpoint of line segment
   * @param r: distance from p1 to travel along the line
   * @returns: vector representation of the point of intersection
   */
  ptOnLine: {
    name: "ptOnLine",
    description:
      "Find the point that is located at dist r along a line between p1 and p2. Returns vector representation of the point of intersection.",
    params: [
      {
        name: "p1",
        type: realNT(),
        description: "start point of line segment",
      },
      { name: "p2", type: realNT(), description: "endpoint of line segment" },
      {
        name: "r",
        type: realT(),
        description: "distance from p1 to travel along the line",
      },
    ],
    body: (
      _context: Context,
      p1: ad.Num[],
      p2: ad.Num[],
      r: ad.Num
    ): VectorV<ad.Num> => {
      // find unit vector pointing towards v2
      const unit = ops.vnormalize(ops.vsub(p2, p1));
      return { tag: "VectorV", contents: ops.vmove(p1, r, unit) };
    },
    returns: valueT("RealN"),
  },
  /**
   * Return 0 if direction of rotation is CCW, 1 if direction of rotation is CW.
   * @param x1, y1: x, y coordinates of the circle/ellipse that the arc is drawn on
   * @param start: start point of the arc
   * @param end: end point of the arc
   * @returns: 0 or 1 depending on CCW or CW rotation
   */
  arcSweepFlag: {
    name: "arcSweepFlag",
    description:
      "Return 0 if direction of rotation is CCW, 1 if direction of rotation is CW.",

    params: [
      {
        name: "[x1, y1]",
        type: real2T(),
        description:
          "x, y coordinates of the circle/ellipse that the arc is drawn on",
      },
      { name: "start", type: real2T(), description: "start point of the arc" },
      { name: "end", type: real2T(), description: "end point of the arc" },
    ],
    body: (
      _context: Context,
      [x1, y1]: ad.Num[],
      start: ad.Pt2,
      end: ad.Pt2
    ): FloatV<ad.Num> => {
      const st = ops.vnormalize([sub(start[0], x1), sub(start[1], y1)]);
      const en = ops.vnormalize([sub(end[0], x1), sub(end[1], y1)]);
      const cross = ops.cross2(st, en);
      return {
        tag: "FloatV",
        contents: ifCond(gt(cross, 0), 0, 1),
      };
    },
    returns: valueT("Real"),
  },
  /**
   * Return the unsigned angle between vectors `u, v`, in radians.
   * Assumes that both u and v have nonzero magnitude.
   * The returned value will be in the range [0,pi].
   */
  angleBetween: {
    name: "angleBetween",
    description:
      "Return the unsigned angle between vectors `u, v`, in radians. Assumes that both u and v have nonzero magnitude. The returned value will be in the range [0,pi].",
    params: [
      { name: "u", type: realNT(), description: "A vector" },
      { name: "v", type: realNT(), description: "A vector" },
    ],
    body: (_context: Context, u: ad.Num[], v: ad.Num[]): FloatV<ad.Num> => {
      const theta = ops.angleBetween(u, v);
      return {
        tag: "FloatV",
        contents: theta,
      };
    },
    returns: valueT("Real"),
  },
  /**
   * Return the signed angle from vector `u` to vector `v`, in radians.
   * Assumes that both u and v are 2D vectors and have nonzero magnitude.
   * The returned value will be in the range [-pi,pi].
   */
  angleFrom: {
    name: "angleFrom",
    description:
      "Return the signed angle from vector `u` to vector `v`, in radians. Assumes that both u and v are 2D vectors and have nonzero magnitude. The returned value will be in the range [-pi,pi].",
    params: [
      { name: "u", type: realNT(), description: "A vector" },
      { name: "v", type: realNT(), description: "A vector" },
    ],
    body: (_context: Context, u: ad.Num[], v: ad.Num[]): FloatV<ad.Num> => {
      const theta = ops.angleFrom(u, v);
      return {
        tag: "FloatV",
        contents: theta,
      };
    },
    returns: valueT("Real"),
  },
  /**
   * Return the 2D cross product of `u` and `v`, equal to the determinant of the 2x2 matrix [u v]
   */
  cross2D: {
    name: "cross2D",
    description:
      "Return the 2D cross product of `u` and `v`, equal to the determinant of the 2x2 matrix [u v]",
    params: [
      { name: "u", type: real2T(), description: "A vector" },
      { name: "v", type: real2T(), description: "A vector" },
    ],
    body: (_context: Context, u: ad.Num[], v: ad.Num[]): FloatV<ad.Num> => {
      const det = sub(mul(u[0], v[1]), mul(u[1], v[0]));
      return {
        tag: "FloatV",
        contents: det,
      };
    },
    returns: valueT("Real"),
  },
  /**
   * Return the 3D cross product of `u` and `v`.
   */
  cross: {
    name: "cross",
    description: "Return the 3D cross product of 3D vectors `u` and `v`.",
    params: [
      { name: "u", type: real3T(), description: "A vector" },
      { name: "v", type: real3T(), description: "A vector" },
    ],
    body: (_context: Context, u: ad.Num[], v: ad.Num[]): VectorV<ad.Num> => {
      const result = ops.cross3(u, v);
      return {
        tag: "VectorV",
        contents: result,
      };
    },
    returns: real3T(),
  },
  /**
   * Return the intersection of a line passing through
   * `a0` and `a1` with a line passing through `b0` and `b1`
   */
  lineLineIntersection: {
    name: "lineLineIntersection",
    description:
      "Return the intersection of a line passing through `a0` and `a1` with a line passing through `b0` and `b1`.",
    params: [
      { name: "a0", type: real2T(), description: "First point of first line" },
      { name: "a1", type: real2T(), description: "Second point of first line" },
      { name: "b0", type: real2T(), description: "First point of second line" },
      {
        name: "b1",
        type: real2T(),
        description: "Second point of second line",
      },
    ],
    body: (
      _context: Context,
      a0: ad.Num[],
      a1: ad.Num[],
      b0: ad.Num[],
      b1: ad.Num[]
    ): VectorV<ad.Num> => {
      const A0 = [a0[0], a0[1], 1];
      const A1 = [a1[0], a1[1], 1];
      const B0 = [b0[0], b0[1], 1];
      const B1 = [b1[0], b1[1], 1];
      const X = ops.cross3(ops.cross3(A0, A1), ops.cross3(B0, B1));
      const x = [div(X[0], X[2]), div(X[1], X[2])];
      return {
        tag: "VectorV",
        contents: toPt(x),
      };
    },
    returns: valueT("Real2"),
  },
  /**
   * Return a point located at the midpoint between pts `start` and `end`
   */
  midpoint: {
    name: "midpoint",
    description:
      "Return a point located at the midpoint between pts `start` and `end`",
    params: [
      { name: "start", type: realNT(), description: "First point" },
      { name: "end", type: realNT(), description: "Second point" },
    ],
    body: (
      _context: Context,
      start: ad.Num[],
      end: ad.Num[]
    ): VectorV<ad.Num> => {
      const midpointLoc = ops.vmul(0.5, ops.vadd(start, end));
      return {
        tag: "VectorV",
        contents: midpointLoc,
      };
    },
    returns: valueT("RealN"),
  },
  /**
   * Return a point located at the midpoint of a line `s1` but offset by `padding` in its normal direction (for labeling).
   */
  midpointOffset: {
    name: "midpointOffset",
    description:
      "Return a point located at the midpoint of a line `s1` but offset by `padding` in its normal direction (for labeling).",
    params: [
      { name: "s1", type: shapeT("Line"), description: "A line" },
      {
        name: "padding",
        type: realT(),
        description: "Padding between midpoint and label",
      },
    ],
    body: (
      _context: Context,
      s1: Line<ad.Num>,
      padding: ad.Num
    ): TupV<ad.Num> => {
      const [start, end] = linePts(s1);
      // TODO: Cache these operations in Style!
      const normalDir = ops.rot90(ops.vnormalize(ops.vsub(end, start)));
      const midpointLoc = ops.vmul(0.5, ops.vadd(start, end));
      const midpointOffsetLoc = ops.vmove(midpointLoc, padding, normalDir);
      return {
        tag: "TupV",
        contents: toPt(midpointOffsetLoc),
      };
    },
    returns: valueT("Real2"),
  },
  chevron: {
    name: "chevron",
    description:
      "Return a list of points for a chevron shape comprised of two line segments intersecting at a right angle at the midpoint of `s1`, which can then be passed to `pathFromPoints` to draw the chevron.",
    params: [
      { name: "s1", type: shapeT("Line"), description: "A line" },
      {
        name: "padding",
        type: realT(),
        description: "Length of each line segment",
      },
    ],
    body: (
      _context: Context,
      // TODO reimplement with variable tick marks when #629 is merged
      s1: Line<ad.Num>,
      padding: ad.Num
    ): PtListV<ad.Num> => {
      // tickPlacement(padding, ticks);
      const [start, end] = linePts(s1);
      const dir = ops.vnormalize(ops.vsub(end, start)); // TODO make direction face "positive direction"
      const startDir = ops.vrot(dir, 135);
      const endDir = ops.vrot(dir, 225);
      const center = ops.vmul(0.5, ops.vadd(start, end));
      // if even, evenly divide tick marks about center. if odd, start in center and move outwards
      return {
        tag: "PtListV",
        contents: [
          ops.vmove(center, padding, startDir),
          center,
          ops.vmove(center, padding, endDir),
        ].map(toPt),
      };
    },
    returns: valueT("Real2N"),
  },
  /**
   * Return a point located at `padding` of a line `s1` offset by `padding` in its normal direction (for making right angle markers).
   */
  innerPointOffset: {
    name: "innerPointOffset",
    description:
      "Return a point located at `padding` of a line `s1` offset by `padding` in its normal direction (for making right angle markers).",

    params: [
      { name: "pt1", type: real2T(), description: "First point" },
      { name: "pt2", type: real2T(), description: "Second point" },
      { name: "pt3", type: real2T(), description: "Third point" },
      {
        name: "padding",
        type: realT(),
        description: "Offset from line to returned point",
      },
    ],
    body: (
      _context: Context,
      pt1: ad.Num[],
      pt2: ad.Num[],
      pt3: ad.Num[],
      padding: ad.Num
    ): VectorV<ad.Num> => {
      // unit vector towards first corner
      const vec1unit = ops.vnormalize(ops.vsub(pt2, pt1));
      const normalDir = ops.vneg(ops.rot90(vec1unit)); // rot90 rotates CW, neg to point in CCW direction

      // move along line between p1 and p2, then move perpendicularly
      const ref = ops.vmove(pt1, padding, vec1unit);
      const [xp, yp] = ops.vmove(ref, padding, normalDir);
      const [xn, yn] = ops.vmove(ref, padding, ops.vneg(normalDir));

      // unit vector towards end point
      const vec2unit = ops.vnormalize(ops.vsub(pt3, pt1));
      const endpt = ops.vmove(pt1, padding, vec2unit);

      // unit vector from midpoint to end point
      const intoEndUnit = ops.vnormalize(ops.vsub([xp, yp], endpt));
      // vector from B->E needs to be parallel to original vector, only care about positive 1 case bc intoEndUnit should point the same direction as vec1unit
      const cond = gt(ops.vdot(vec1unit, intoEndUnit), 0.95);
      return {
        tag: "VectorV",
        contents: [ifCond(cond, xp, xn), ifCond(cond, yp, yn)],
      };
    },
    returns: valueT("Real2"),
  },
  /**
   * Create equally spaced tick marks centered at the midpoint of a line
   * @param pt1: starting point of a line
   * @param pt2: endping point of a line
   * @param spacing: space in px between each tick
   * @param numTicks: number of tick marks to create
   * @param tickLength: 1/2 length of each tick
   */
  ticksOnLine: {
    name: "ticksOnLine",
    description:
      "Create equally spaced tick marks centered at the midpoint of a line",
    params: [
      { name: "pt1", type: real2T(), description: "starting point of a line" },
      { name: "pt2", type: real2T(), description: "ending point of a line" },
      {
        name: "spacing",
        type: realT(),
        description: "space in px between each tick",
      },
      {
        name: "numTicks",
        type: posIntT(),
        description: "number of tick marks to create",
      },
      {
        name: "tickLength",
        type: realT(),
        description: "1/2 length of each tick",
      },
    ],
    body: (
      _context: Context,
      pt1: ad.Num[],
      pt2: ad.Num[],
      spacing: ad.Num,
      numTicks: ad.Num,
      tickLength: ad.Num
    ): PathDataV<ad.Num> => {
      const path = new PathBuilder();
      // calculate scalar multipliers to determine the placement of each tick mark
      const multipliers = tickPlacement(spacing, numOf(numTicks));
      const unit = ops.vnormalize(ops.vsub(pt2, pt1));
      const normalDir = ops.vneg(ops.rot90(unit)); // rot90 rotates CW, neg to point in CCW direction

      const mid = ops.vmul(0.5, ops.vadd(pt1, pt2));

      // start/end pts of each tick will be placed parallel to each other, offset at dist of tickLength
      // from the original pt1->pt2 line
      const [x1p, y1p] = ops.vmove(mid, tickLength, normalDir);
      const [x2p, y2p] = ops.vmove(mid, tickLength, ops.vneg(normalDir));

      multipliers.forEach((multiplier) => {
        const [sx, sy] = ops.vmove([x1p, y1p], multiplier, unit);
        const [ex, ey] = ops.vmove([x2p, y2p], multiplier, unit);
        path.moveTo([sx, sy]).lineTo([ex, ey]);
      });
      return path.getPath();
    },
    returns: valueT("PathCmd"),
  },
  /**
   * Given two orthogonal segments that intersect at `intersection`, and a size `len`
   * return a path comprised of three points that describe a perpendicular mark at the angle where the segments intersect.
   */
  orientedSquare: {
    name: "orientedSquare",
    description:
      "Given two orthogonal segments that intersect at `intersection`, and a size `len` return a path comprised of three points that describe a perpendicular mark at the angle where the segments intersect.",

    params: [
      { name: "s1", type: shapeT("Line"), description: "First line segment" },
      { name: "s2", type: shapeT("Line"), description: "Second line segment" },
      {
        name: "intersection",
        type: real2T(),
        description: "Point of intersection",
      },
      {
        name: "len",
        type: realT(),
        description: "Side length of square marker",
      },
    ],
    body: (
      _context: Context,
      s1: Line<ad.Num>,
      s2: Line<ad.Num>,
      intersection: ad.Pt2,
      len: ad.Num
    ): PathDataV<ad.Num> => {
      const [seg1, seg2] = [linePts(s1), linePts(s2)];
      const [ptL, ptLR, ptR] = perpPathFlat(len, seg1, seg2);
      const path = new PathBuilder();
      return path
        .moveTo(toPt(ptL))
        .lineTo(toPt(ptLR))
        .lineTo(toPt(ptR))
        .lineTo(intersection)
        .closePath()
        .getPath();
    },
    returns: valueT("PathCmd"),
  },

  /**
   * Given three lines `l1, l2, l3` that already form a triangle, return a path that describes the triangle (which can then be filled, etc.).
   */
  triangle: {
    name: "triangle",
    description:
      "Given three lines `l1, l2, l3` that already form a triangle, return a path that describes the triangle (which can then be filled, etc.).",
    params: [
      { name: "l1", type: shapeT("Line"), description: "First line" },
      { name: "l2", type: shapeT("Line"), description: "Second line" },
      { name: "l3", type: shapeT("Line"), description: "Third line" },
    ],
    body: (
      _context: Context,
      l1: Line<ad.Num>,
      l2: Line<ad.Num>,
      l3: Line<ad.Num>
    ): PathDataV<ad.Num> => {
      const path = new PathBuilder();
      return path
        .moveTo(toPt(getStart(l1)))
        .lineTo(toPt(getStart(l2)))
        .lineTo(toPt(getStart(l3)))
        .closePath()
        .getPath();
    },
    returns: valueT("PathCmd"),
  },

  /**
   * Return the average of floats `x` and `y`.
   */
  average2: {
    name: "average2",
    description: "Return the average of floats `x` and `y`.",
    params: [
      { name: "x", type: realT(), description: "`x`" },
      { name: "y", type: realT(), description: "`y`" },
    ],
    body: (_context: Context, x: ad.Num, y: ad.Num): FloatV<ad.Num> => {
      return {
        tag: "FloatV",
        contents: div(add(x, y), 2),
      };
    },
    returns: valueT("Real"),
  },

  /**
   * Return the average of the floats in the list `xs`.
   */
  average: {
    name: "average",
    description: "Return the average of the floats in the list `xs`.",
    params: [{ name: "xs", type: realNT(), description: "`xs`" }],
    body: (_context: Context, xs: ad.Num[]): FloatV<ad.Num> => {
      return {
        tag: "FloatV",
        contents: div(addN(xs), max(1, xs.length)),
        // To avoid divide-by-0
      };
    },
    returns: valueT("Real"),
  },

  /**
   * Return the normalized version of vector `v`.
   */
  unit: {
    name: "unit",
    description: "Return the normalized version of vector `v`.",
    params: [{ name: "v", type: realNT(), description: "`v`" }],
    body: (_context: Context, v: ad.Num[]): VectorV<ad.Num> => {
      return {
        tag: "VectorV",
        contents: ops.vnormalize(v),
      };
    },
    returns: valueT("RealN"),
  },

  /**
   * Return a uniform random value between minVal and maxValue.
   */
  random: {
    name: "random",
    description:
      "Uniformly sample a random value in the range from `minVal` to `maxVal`.",
    params: [
      { name: "minVal", type: realT(), description: "minimum value" },
      { name: "maxVal", type: realT(), description: "maximum value" },
    ],
    body: (
      { makeInput }: Context,
      minVal: ad.Num,
      maxVal: ad.Num
    ): FloatV<ad.Num> => {
      if (typeof minVal === "number" && typeof maxVal === "number") {
        const val = makeInput({
          init: { tag: "Sampled", sampler: uniform(minVal, maxVal) },
          stages: new Set(),
        });

        return {
          tag: "FloatV",
          contents: val,
        };
      } else {
        throw new Error(
          "Expects the minimum and maximum values to be constants. Got a computed or optimized value instead."
        );
      }
    },
    returns: valueT("Real"),
  },

  /**
   * Return a uniform random value between 0 and 1
   */
  unitRandom: {
    name: "unitRandom",
    description: "Uniformly sample a random value in the range [0,1].",
    params: [],
    body: ({ makeInput }: Context): FloatV<ad.Num> => {
      const val = makeInput({
        init: { tag: "Sampled", sampler: uniform(0, 1) },
        stages: new Set(),
      });

      return {
        tag: "FloatV",
        contents: val,
      };
    },
    returns: valueT("Real"),
  },

  /**
   * Return a random value sampled from the uniform distribution on the unit disk.
   */
  diskRandom: {
    name: "diskRandom",
    description: "Sample the uniform distribution on the unit disk.",
    params: [],
    body: ({ makeInput }: Context): VectorV<ad.Num> => {
      const u1 = makeInput({
        init: { tag: "Sampled", sampler: uniform(0, 1) },
        stages: new Set(),
      });
      const u2 = makeInput({
        init: { tag: "Sampled", sampler: uniform(0, 1) },
        stages: new Set(),
      });

      // From the section "Sampling the Unit Disk" in Arvo, "Stratified Sampling of 2-Manifolds" (2001)
      const x = [
        mul(sqrt(u1), cos(mul(2 * Math.PI, u2))),
        mul(sqrt(u1), sin(mul(2 * Math.PI, u2))),
      ];

      return {
        tag: "VectorV",
        contents: x,
      };
    },
    returns: valueT("RealN"),
  },

  /**
   * Return a random value sampled from the uniform distribution on the unit circle.
   */
  circleRandom: {
    name: "circleRandom",
    description: "Sample the uniform distribution on the unit circle.",
    params: [],
    body: ({ makeInput }: Context): VectorV<ad.Num> => {
      const u = makeInput({
        init: { tag: "Sampled", sampler: uniform(0, 2 * Math.PI) },
        stages: new Set(),
      });

      const x = [cos(u), sin(u)];

      return {
        tag: "VectorV",
        contents: x,
      };
    },
    returns: valueT("RealN"),
  },

  /**
   * Return a random value sampled from the uniform distribution on the unit sphere.
   */
  sphereRandom: {
    name: "sphereRandom",
    description: "Sample the uniform distribution on the unit sphere.",
    params: [],
    body: ({ makeInput }: Context): VectorV<ad.Num> => {
      const u1 = makeInput({
        init: { tag: "Sampled", sampler: uniform(0, 1) },
        stages: new Set(),
      });
      const u2 = makeInput({
        init: { tag: "Sampled", sampler: uniform(0, 1) },
        stages: new Set(),
      });

      // Adapted from the section "Sampling the Unit Hemisphere" in Arvo, "Stratified Sampling of 2-Manifolds" (2001)
      const z = sub(1, mul(2, u1));
      const r = sqrt(clamp([0, 1], sub(1, mul(z, z))));
      const phi = mul(2 * Math.PI, u2);
      const x = [mul(r, cos(phi)), mul(r, sin(phi)), z];

      return {
        tag: "VectorV",
        contents: x,
      };
    },
    returns: valueT("RealN"),
  },

  /**
   * Return a random value sampled from a normal distribution with mean 0 and standard deviation 1.
   */
  normalRandom: {
    name: "normalRandom",
    description:
      "Sample a normal distribution with mean 0 and standard deviation 1.",
    params: [],
    body: ({ makeInput }: Context): FloatV<ad.Num> => {
      const u1 = makeInput({
        init: { tag: "Sampled", sampler: uniform(0, 1) },
        stages: new Set(),
      });
      const u2 = makeInput({
        init: { tag: "Sampled", sampler: uniform(0, 1) },
        stages: new Set(),
      });

      const Z = mul(sqrt(mul(-2, ln(u1))), cos(mul(2 * Math.PI, u2)));

      return {
        tag: "FloatV",
        contents: Z,
      };
    },
    returns: valueT("Real"),
  },

  /**
   * Return a random point sampled from the uniform distribution on a triangle with vertices a, b, c.
   */
  triangleRandom: {
    name: "triangleRandom",
    description:
      "Sample a point from the uniform distribution over a triangle with vertices `a`, `b`, and `c`.",
    params: [
      { name: "a", type: real2T(), description: "First vertex" },
      { name: "b", type: real2T(), description: "Second vertex" },
      { name: "c", type: real2T(), description: "Third vertex" },
    ],
    body: (
      { makeInput }: Context,
      a: ad.Num[],
      b: ad.Num[],
      c: ad.Num[]
    ): VectorV<ad.Num> => {
      const u1 = makeInput({
        init: { tag: "Sampled", sampler: uniform(0, 1) },
        stages: new Set(),
      });
      const u2 = makeInput({
        init: { tag: "Sampled", sampler: uniform(0, 1) },
        stages: new Set(),
      });

      // Following method SamplePlanarTriangle from Arvo, "Stratified Sampling of 2-Manifolds" (2001)
      const s = sqrt(u1);
      const t = u2;
      const x = ops.vadd(
        ops.vadd(ops.vmul(sub(1, s), a), ops.vmul(mul(s, sub(1, t)), b)),
        ops.vmul(mul(s, t), c)
      );

      return {
        tag: "VectorV",
        contents: x,
      };
    },
    returns: valueT("RealN"),
  },

  /**
   * Sample a random color once, with opacity `alpha` and colorType `colorType` (`"rgb"` or `"hsv"`).
   */
  sampleColor: {
    name: "sampleColor",
    description:
      'Sample a random color once, with opacity `alpha` and color type `colorType` (`"rgb"` or `"hsv"`).',
    params: [
      { name: "alpha", type: unitT(), description: "Opacity" },
      { name: "colorType", type: colorTypeT(), description: "Color model" },
    ],
    body: (
      { makeInput }: Context,
      alpha: ad.Num,
      colorType: "rgb" | "hsv"
    ): ColorV<ad.Num> => {
      if (colorType === "rgb") {
        const rgb = _.range(3).map(() =>
          makeInput({
            init: { tag: "Sampled", sampler: uniform(0.1, 0.9) },
            stages: new Set(),
          })
        );

        return {
          tag: "ColorV",
          contents: {
            tag: "RGBA",
            contents: [rgb[0], rgb[1], rgb[2], alpha],
          },
        };
      } else {
        const h = makeInput({
          init: { tag: "Sampled", sampler: uniform(0, 360) },
          stages: new Set(),
        });
        return {
          tag: "ColorV",
          contents: {
            tag: "HSVA",
            contents: [h, 100, 80, alpha], // HACK: for the color to look good
          },
        };
      }
    },
    returns: valueT("Color"),
  },

  /**
   * Set the opacity of a color `color` to `frac`.
   */
  setOpacity: {
    name: "setOpacity",
    description: "Set the opacity of a color `color` to `frac`.",
    params: [
      { name: "color", type: colorT(), description: "Color" },
      { name: "frac", type: unitT(), description: "Opacity" },
    ],
    body: (
      _context: Context,
      color: Color<ad.Num>,
      frac: ad.Num
    ): ColorV<ad.Num> => {
      // If paint=none, opacity is irreelevant
      if (color.tag === "NONE") {
        return {
          tag: "ColorV",
          contents: color,
        };
        // Otherwise, retain tag and color; only modify opacity
      } else {
        const props = color.contents;
        return {
          tag: "ColorV",
          contents: {
            tag: color.tag,
            contents: [props[0], props[1], props[2], mul(frac, props[3])],
          },
        };
      }
    },
    returns: valueT("Color"),
  },

  /**
   * Multiply a matrix `m` and a vector `v` (where `v` is implicitly treated as a column vector).
   */
  mul: {
    name: "mul",
    description:
      "Multiply a matrix `m` and a vector `v` (where `v` is implicitly treated as a column vector).",
    params: [
      { name: "m", type: realNMT(), description: "A matrix" },
      { name: "v", type: realNT(), description: "A vector" },
    ],
    body: (_context: Context, m: ad.Num[][], v: ad.Num[]): VectorV<ad.Num> => {
      if (!m.length) {
        throw Error("empty matrix");
      }
      if (!v.length) {
        throw Error("empty vector");
      }

      return {
        tag: "VectorV",
        contents: m.map((row) => ops.vdot(row, v)),
      };
    },
    returns: valueT("RealN"),
  },

  // ------ Triangle centers

  /**
   * Return the barycenter of the triangle with vertices `a`, `b`, `c`.
   */
  barycenter: {
    name: "barycenter",
    description:
      "Return the barycenter of the triangle with vertices `a`, `b`, `c`.",

    params: [
      { name: "a", type: real2T(), description: "First vertex" },
      { name: "b", type: real2T(), description: "Second vertex" },
      { name: "c", type: real2T(), description: "Third vertex" },
    ],
    body: (
      _context: Context,
      a: ad.Num[],
      b: ad.Num[],
      c: ad.Num[]
    ): VectorV<ad.Num> => {
      const x = ops.vmul(1 / 3, ops.vadd(a, ops.vadd(b, c)));
      return {
        tag: "VectorV",
        contents: toPt(x),
      };
    },
    returns: valueT("Real2"),
  },

  /**
   * Return the circumcenter of the triangle with vertices `p`, `q`, `r`.
   */
  circumcenter: {
    name: "circumcenter",
    description:
      "Return the circumcenter of the triangle with vertices `p`, `q`, `r`.",

    params: [
      { name: "p", type: real2T(), description: "First vertex" },
      { name: "q", type: real2T(), description: "Second vertex" },
      { name: "r", type: real2T(), description: "Third vertex" },
    ],
    body: (
      _context: Context,
      p: ad.Num[],
      q: ad.Num[],
      r: ad.Num[]
    ): VectorV<ad.Num> => {
      // edge vectors
      const u = ops.vsub(r, q);
      const v = ops.vsub(p, r);
      const w = ops.vsub(q, p);

      // side lengths
      const a = ops.vnorm(u);
      const b = ops.vnorm(v);
      const c = ops.vnorm(w);

      // homogeneous barycentric coordinates for circumcenter
      const hp = neg(mul(div(a, mul(b, c)), ops.vdot(w, v)));
      const hq = neg(mul(div(b, mul(c, a)), ops.vdot(u, w)));
      const hr = neg(mul(div(c, mul(a, b)), ops.vdot(v, u)));

      // normalize to get barycentric coordinates for circumcenter
      const H = add(add(hp, hq), hr);
      const bp = div(hp, H);
      const bq = div(hq, H);
      const br = div(hr, H);

      // circumcenter
      const x = ops.vadd(
        ops.vadd(ops.vmul(bp, p), ops.vmul(bq, q)),
        ops.vmul(br, r)
      );

      return {
        tag: "VectorV",
        contents: toPt(x),
      };
    },
    returns: valueT("Real2"),
  },

  /**
   * Return the circumradius of the triangle with vertices `p`, `q`, `r`.
   */
  circumradius: {
    name: "circumradius",
    description:
      "Return the circumradius of the triangle with vertices `p`, `q`, `r`.",
    params: [
      { name: "p", type: real2T(), description: "First vertex" },
      { name: "q", type: real2T(), description: "Second vertex" },
      { name: "r", type: real2T(), description: "Third vertex" },
    ],
    body: (
      _context: Context,
      p: ad.Num[],
      q: ad.Num[],
      r: ad.Num[]
    ): FloatV<ad.Num> => {
      // side lengths
      const a = ops.vnorm(ops.vsub(r, q));
      const b = ops.vnorm(ops.vsub(p, r));
      const c = ops.vnorm(ops.vsub(q, p));

      // semiperimeter
      const s = mul(0.5, add(add(a, b), c));

      // circumradius, computed as
      // R = (abc)/(4 sqrt( s(a+b-s)(a+c-s)(b+c-s) ) )
      const R = div(
        mul(mul(a, b), c),
        mul(
          4,
          sqrt(
            mul(
              mul(mul(s, sub(add(a, b), s)), sub(add(a, c), s)),
              sub(add(b, c), s)
            )
          )
        )
      );

      return {
        tag: "FloatV",
        contents: R,
      };
    },
    returns: valueT("Real"),
  },

  /**
   * Return the incenter of the triangle with vertices `p`, `q`, `r`.
   */
  incenter: {
    name: "incenter",
    description:
      "Return the incenter of the triangle with vertices `p`, `q`, `r`.",

    params: [
      { name: "p", type: real2T(), description: "First vertex" },
      { name: "q", type: real2T(), description: "Second vertex" },
      { name: "r", type: real2T(), description: "Third vertex" },
    ],
    body: (
      _context: Context,
      p: ad.Num[],
      q: ad.Num[],
      r: ad.Num[]
    ): VectorV<ad.Num> => {
      // side lengths
      const a = ops.vnorm(ops.vsub(r, q));
      const b = ops.vnorm(ops.vsub(p, r));
      const c = ops.vnorm(ops.vsub(q, p));

      // barycentric coordinates for incenter
      const s = add(add(a, b), c);
      const bp = div(a, s);
      const bq = div(b, s);
      const br = div(c, s);

      // incenter
      const x = ops.vadd(
        ops.vadd(ops.vmul(bp, p), ops.vmul(bq, q)),
        ops.vmul(br, r)
      );

      return {
        tag: "VectorV",
        contents: toPt(x),
      };
    },
    returns: valueT("Real2"),
  },

  /**
   * Return the inradius of the triangle with vertices `p`, `q`, `r`.
   */
  inradius: {
    name: "inradius",
    description:
      "Return the inradius of the triangle with vertices `p`, `q`, `r`.",

    params: [
      { name: "p", type: real2T(), description: "First vertex" },
      { name: "q", type: real2T(), description: "Second vertex" },
      { name: "r", type: real2T(), description: "Third vertex" },
    ],
    body: (
      _context: Context,
      p: ad.Num[],
      q: ad.Num[],
      r: ad.Num[]
    ): FloatV<ad.Num> => {
      // side lengths
      const a = ops.vnorm(ops.vsub(r, q));
      const b = ops.vnorm(ops.vsub(p, r));
      const c = ops.vnorm(ops.vsub(q, p));

      // semiperimeter
      const s = mul(0.5, add(add(a, b), c));

      // inradius
      const R = sqrt(div(mul(mul(sub(s, a), sub(s, b)), sub(s, c)), s));

      return {
        tag: "FloatV",
        contents: R,
      };
    },
    returns: valueT("Real"),
  },

  // ------ Utility functions

  /**
   * Return the square of the number `x`.
   */
  sqr: {
    name: "sqr",
    description: "Return the square of the number `x`.",
    params: [{ name: "x", type: realT(), description: "`x`" }],
    body: (_context: Context, x: ad.Num): FloatV<ad.Num> => {
      return { tag: "FloatV", contents: squared(x) };
    },
    returns: valueT("Real"),
  },

  /**
   * Return the square root of the number `x`. (NOTE: if `x < 0`, you may get `NaN`s)
   */
  sqrt: {
    name: "sqrt",
    description:
      "Return the square root of number `x`. (Note: if `x < 0` you may get `NaN`s)",
    params: [{ name: "x", type: realT(), description: "`x`" }],
    body: (_context: Context, x: ad.Num): FloatV<ad.Num> => {
      return { tag: "FloatV", contents: sqrt(x) };
    },
    returns: valueT("Real"),
  },

  /**
   * Return the max of the numbers `x`, `y`.
   */
  max: {
    name: "max",
    description: "Return the max of the numbers `x`, `y`.",
    params: [
      { name: "x", type: realT(), description: "`x`" },
      { name: "y", type: realT(), description: "`y`" },
    ],
    body: (_context: Context, x: ad.Num, y: ad.Num): FloatV<ad.Num> => {
      return { tag: "FloatV", contents: max(x, y) };
    },
    returns: valueT("Real"),
  },

  /**
   * Return the min of the numbers `x`, `y`.
   */
  min: {
    name: "min",
    description: "Return the min of the numbers `x`, `y`.",
    params: [
      { name: "x", type: realT(), description: "`x`" },
      { name: "y", type: realT(), description: "`y`" },
    ],
    body: (_context: Context, x: ad.Num, y: ad.Num): FloatV<ad.Num> => {
      return { tag: "FloatV", contents: min(x, y) };
    },
    returns: valueT("Real"),
  },

  /**
   * Return the absolute value of the number `x`.
   */
  abs: {
    name: "abs",
    description: "Return the absolute value of the number `x`.",
    params: [{ name: "x", type: realT(), description: "`x`" }],
    body: (_context: Context, x: ad.Num): FloatV<ad.Num> => {
      return { tag: "FloatV", contents: absVal(x) };
    },
    returns: valueT("Real"),
  },

  /**
   * Convert the angle `theta` from degrees to radians.
   */
  toRadians: {
    name: "toRadians",
    description: "Convert the angle `theta` from degrees to radians.",
    params: [{ name: "theta", type: realT(), description: "`theta`" }],
    body: (_context: Context, theta: ad.Num): FloatV<ad.Num> => {
      return {
        tag: "FloatV",
        contents: mul(Math.PI / 180, theta),
      };
    },
    returns: valueT("Real"),
  },

  /**
   * Convert the angle `theta` from radians to degrees.
   */
  toDegrees: {
    name: "toDegrees",
    description: "Convert the angle `theta` from radians to degrees.",
    params: [{ name: "theta", type: realT(), description: "`theta`" }],
    body: (_context: Context, theta: ad.Num): FloatV<ad.Num> => {
      return {
        tag: "FloatV",
        contents: mul(180 / Math.PI, theta),
      };
    },
    returns: valueT("Real"),
  },

  /**
   * Return the Euclidean norm of the vector `v`.
   */
  norm: {
    name: "norm",
    description: "Return the Euclidean norm of the vector `v`.",
    params: [{ name: "v", type: realNT(), description: "A vector" }],
    body: (_context: Context, v: ad.Num[]): FloatV<ad.Num> => {
      return { tag: "FloatV", contents: ops.vnorm(v) };
    },
    returns: valueT("Real"),
  },

  /**
   * Return the Euclidean norm squared of the vector `v`.
   */
  normsq: {
    name: "normsq",
    description: "Return the Euclidean norm squared of the vector `v`.",
    params: [{ name: "v", type: realNT(), description: "A vector" }],
    body: (_context: Context, v: ad.Num[]): FloatV<ad.Num> => {
      return { tag: "FloatV", contents: ops.vnormsq(v) };
    },
    returns: valueT("Real"),
  },

  /**
   * Return the Euclidean distance between the vectors `v` and `w`.
   */
  vdist: {
    name: "vdist",
    description:
      "Return the Euclidean distance between the vectors `v` and `w`.",
    params: [
      { name: "v", type: realNT(), description: "A vector" },
      { name: "w", type: realNT(), description: "A vector" },
    ],
    body: (_context: Context, v: ad.Num[], w: ad.Num[]): FloatV<ad.Num> => {
      return { tag: "FloatV", contents: ops.vdist(v, w) };
    },
    returns: valueT("Real"),
  },

  vmul: {
    name: "vmul",
    description: "Returns the scalar-vector product.",
    params: [
      { name: "s", type: realT(), description: "A scalar" },
      { name: "v", type: realNT(), description: "A vector" },
    ],
    body: (_context: Context, s: ad.Num, v: ad.Num[]): VectorV<ad.Num> => {
      return { tag: "VectorV", contents: ops.vmul(s, v) };
    },
    returns: valueT("RealN"),
  },

  /**
   * Return the Euclidean distance squared between the vectors `v` and `w`.
   */
  vdistsq: {
    name: "vdistsq",
    description:
      "Return the Euclidean distance squared between the vectors `v` and `w`.",
    params: [
      { name: "v", type: realNT(), description: "A vector" },
      { name: "w", type: realNT(), description: "A vector" },
    ],
    body: (_context: Context, v: ad.Num[], w: ad.Num[]): FloatV<ad.Num> => {
      return { tag: "FloatV", contents: ops.vdistsq(v, w) };
    },
    returns: valueT("Real"),
  },

  /**
   * Return the angle made by the vector `v` with the positive x-axis.
   */
  angleOf: {
    name: "angleOf",
    description:
      "Return the angle made by the vector `v` with the positive x-axis.",
    params: [{ name: "v", type: realNT(), description: "A vector" }],
    body: (_context: Context, v: ad.Num[]): FloatV<ad.Num> => {
      return { tag: "FloatV", contents: atan2(v[1], v[0]) };
    },
    returns: valueT("Real"),
  },

  // ------ Mathematical constants

  /**
   * Base e of the natural logarithm.
   */
  MathE: {
    name: "MathE",
    description: "Base e of the natural logarithm.",
    params: [],
    body: (_context: Context): FloatV<ad.Num> => {
      return {
        tag: "FloatV",
        contents: Math.E,
      };
    },
    returns: valueT("Real"),
  },

  /**
   * Ratio of the circumference of a circle to its diameter.
   */
  MathPI: {
    name: "MathPI",
    description: "Ratio of the circumference of a circle to its diameter.",
    params: [],
    body: (_context: Context): FloatV<ad.Num> => {
      return {
        tag: "FloatV",
        contents: Math.PI,
      };
    },
    returns: valueT("Real"),
  },

  // ------ Geometry/graphics utils

  /**
   * Rotate a 2D vector `v` by 90 degrees counterclockwise.
   */
  rot90: {
    name: "rot90",
    description: "Rotate a 2D vector `v` by 90 degrees counterclockwise.",
    params: [{ name: "v", type: real2T(), description: "A vector" }],
    body: (_context: Context, v: ad.Num[]): VectorV<ad.Num> => {
      if (v.length !== 2) {
        throw Error("expected 2D vector in `rot90`");
      }
      const [x, y] = v;
      return { tag: "VectorV", contents: [neg(y), x] };
    },
    returns: valueT("Real2"),
  },

  /**
   * Rotate a 2D vector `v` by theta degrees counterclockwise.
   */
  rotateBy: {
    name: "rotateBy",
    description: "Rotate a 2D vector `v` by theta degrees counterclockwise.",
    params: [
      { name: "v", type: real2T(), description: "A vector" },
      {
        name: "theta",
        type: realT(),
        description: "degrees to rotate counterclockwise",
      },
    ],
    body: (_context: Context, v: ad.Num[], theta: ad.Num): VectorV<ad.Num> => {
      if (v.length !== 2) {
        throw Error("expected 2D vector in `rotateBy`");
      }
      const [x, y] = v;
      const X = add(mul(cos(theta), x), mul(sin(theta), y));
      const Y = add(neg(mul(sin(theta), x)), mul(cos(theta), y));
      return { tag: "VectorV", contents: [X, Y] };
    },
    returns: valueT("Real2"),
  },

  signedDistance: {
    name: "signedDistance",
    description: "Return the signed distance between a shape and a point",
    params: [
      {
        name: "s",
        type: unionT(
          rectlikeT(),
          shapeT("Circle"),
          shapeT("Polygon"),
          shapeT("Line"),
          shapeT("Polyline")
        ),
        description: "A shape",
      },
      { name: "p", type: real2T(), description: "A point" },
    ],
    body: (
      _context: Context,
      s:
        | Rectlike<ad.Num>
        | Circle<ad.Num>
        | Polygon<ad.Num>
        | Line<ad.Num>
        | Polyline<ad.Num>,
      p: ad.Num[]
    ): FloatV<ad.Num> => {
      /*  
    All math borrowed from:
    https://iquilezles.org/articles/distfunctions2d/
    
    axis-aligned rectangle:
    float sdBox( in vec2 p, in vec2 b )
    {
      vec2 d = abs(p)-b;
      return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
    } 
    */
      if (isRectlike(s)) {
        const absp = ops.vabs(ops.vsub(p, s.center.contents));
        const b = [div(s.width.contents, 2), div(s.height.contents, 2)];
        const d = ops.vsub(absp, b);
        const result = add(
          ops.vnorm(ops.vmax(d, [0.0, 0.0])),
          min(max(d[0], d[1]), 0.0)
        );
        return {
          tag: "FloatV",
          contents: result,
        };
      } else if (s.shapeType === "Circle") {
        /*     
      float sdCircle( vec2 p, float r )
      {
        return length(p) - r;
      } 
      */
        const pOffset = ops.vsub(p, s.center.contents);
        const result = sub(ops.vnorm(pOffset), s.r.contents);
        return {
          tag: "FloatV",
          contents: result,
        };
      } else if (s.shapeType === "Polygon") {
        /*
      float sdPolygon( in vec2[N] v, in vec2 p )
      {
          float d = dot(p-v[0],p-v[0]);
          float s = 1.0;
          for( int i=0, j=N-1; i<N; j=i, i++ )
          {
              vec2 e = v[j] - v[i];
              vec2 w =    p - v[i];
              vec2 b = w - e*clamp( dot(w,e)/dot(e,e), 0.0, 1.0 );
              d = min( d, dot(b,b) );
              bvec3 c = bvec3(p.y>=v[i].y,p.y<v[j].y,e.x*w.y>e.y*w.x);
              if( all(c) || all(not(c)) ) s*=-1.0;  
          }
          return s*sqrt(d);
      }
      */
        const v = s.points.contents;
        let d = ops.vdot(ops.vsub(p, v[0]), ops.vsub(p, v[0]));
        let ess: ad.Num = 1.0;
        let j = v.length - 1;
        for (let i = 0; i < v.length; i++) {
          const e = ops.vsub(v[j], v[i]);
          const w = ops.vsub(p, v[i]);
          const clampedVal = clamp([0, 1], div(ops.vdot(w, e), ops.vdot(e, e)));
          const b = ops.vsub(w, ops.vmul(clampedVal, e));
          d = min(d, ops.vdot(b, b));
          const c1 = gte(p[1], v[i][1]);
          const c2 = lt(p[1], v[j][1]);
          const c3 = gt(mul(e[0], w[1]), mul(e[1], w[0]));
          const c4 = and(and(c1, c2), c3);
          const c5 = not(c1);
          const c6 = not(c2);
          const c7 = not(c3);
          const c8 = and(and(c5, c6), c7);
          const negEss = mul(-1, ess);
          ess = ifCond(or(c4, c8), negEss, ess);
          // last line to match for loop in code we are borrowing from
          j = i;
        }
        const result = mul(ess, sqrt(d));
        return {
          tag: "FloatV",
          contents: result,
        };
      } else if (s.shapeType === "Line") {
        return {
          tag: "FloatV",
          contents: sdLine(s, p),
        };
      } else {
        return {
          tag: "FloatV",
          contents: sdPolyline(s, p),
        };
      }
    },
    returns: valueT("Real"),
  },

  /**
   * Construct a unit vector u in the direction of the
   * given angle theta (in radians).
   */
  unitVector: {
    name: "unitVector",
    description:
      "Construct a unit vector u in the direction of the given angle theta (in radians).",
    params: [{ name: "theta", type: realT(), description: "direction" }],
    body: (_context: Context, theta: ad.Num): VectorV<ad.Num> => {
      return { tag: "VectorV", contents: [cos(theta), sin(theta)] };
    },
    returns: valueT("Real2"),
  },

  /**
   * Given a point p and vector v, find the first point where the ray r(t)=p+tv
   * intersects the given shape S.  If there are no intersections, returns p.
   */
  rayIntersect: {
    name: "rayIntersect",
    params: [
      {
        name: "S",
        type: unionT(
          rectlikeT(),
          shapeT("Circle"),
          shapeT("Polygon"),
          shapeT("Line"),
          shapeT("Polyline"),
          shapeT("Ellipse"),
          shapeT("Group")
        ),
        description: "A shape",
      },
      { name: "p", type: real2T(), description: "A point" },
      { name: "v", type: real2T(), description: "A vector" },
    ],
    body: (
      _context: Context,
      S:
        | Circle<ad.Num>
        | Rectlike<ad.Num>
        | Line<ad.Num>
        | Polyline<ad.Num>
        | Polygon<ad.Num>
        | Ellipse<ad.Num>
        | Group<ad.Num>,
      p: ad.Num[],
      v: ad.Num[]
    ): VectorV<ad.Num> => {;
       const hit = rayIntersectShape(S,p,v);
       const x = hit[0];
       const x0 = ifCond( eq(absVal(x[0]),Infinity), p[0], x[0] );
       const x1 = ifCond( eq(absVal(x[1]),Infinity), p[1], x[1] );
       return { tag: "VectorV", contents: [x0,x1] };
    },
    returns: valueT("Real2"),
  },

  /**
   * Given a point p and vector v, find the unit normal at the first point where
   * the ray r(t)=p+tv intersects the given shape S.  If there are no
   * intersections, returns (0,0).
   */
  rayIntersectNormal: {
    name: "rayIntersectNormal",
    params: [
      {
        name: "S",
        type: unionT(
          rectlikeT(),
          shapeT("Circle"),
          shapeT("Polygon"),
          shapeT("Line"),
          shapeT("Polyline"),
          shapeT("Ellipse"),
          shapeT("Group")
        ),
        description: "A shape",
      },
      { name: "p", type: real2T(), description: "A point" },
      { name: "v", type: real2T(), description: "A vector" },
    ],
    body: (
      _context: Context,
      S:
        | Circle<ad.Num>
        | Rectlike<ad.Num>
        | Line<ad.Num>
        | Polyline<ad.Num>
        | Polygon<ad.Num>
        | Ellipse<ad.Num>
        | Group<ad.Num>,
      p: ad.Num[],
      v: ad.Num[]
    ): VectorV<ad.Num> => {;
       const hit = rayIntersectShape(S,p,v);
       const x = hit[0];
       const n = hit[1];
       const s = ops.vdot( n, ops.vsub(p,x));
       const n0 = ifCond( eq(absVal(x[0]),Infinity), 0.0, ifCond( lt(s,0), neg(n[0]), n[0] ));
       const n1 = ifCond( eq(absVal(x[1]),Infinity), 0.0, ifCond( lt(s,0), neg(n[1]), n[1] ));
       return { tag: "VectorV", contents: [n0,n1] };
    },
    returns: valueT("Real2"),
  },

  closestPoint: {
    name: "closestPoint",
    params: [
      {
        name: "s",
        type: unionT(
          rectlikeT(),
          shapeT("Circle"),
          shapeT("Polygon"),
          shapeT("Line"),
          shapeT("Polyline"),
          shapeT("Ellipse"),
          shapeT("Group")
        ),
        description: "A shape",
      },
      { name: "p", type: real2T(), description: "A point" },
    ],
    body: (
      _context: Context,
      s:
        | Circle<ad.Num>
        | Rectlike<ad.Num>
        | Line<ad.Num>
        | Polyline<ad.Num>
        | Polygon<ad.Num>
        | Ellipse<ad.Num>
        | Group<ad.Num>,
      p: ad.Num[]
    ): VectorV<ad.Num> => {;
       return { tag: "VectorV", contents: closestPointShape(s,p) };
    },
    returns: valueT("Real2"),
  },

  closestSilhouettePoint: {
    name: "closestSilhouettePoint",
    params: [
      {
        name: "s",
        type: unionT(
          rectlikeT(),
          shapeT("Circle"),
          shapeT("Polygon"),
          shapeT("Line"),
          shapeT("Polyline"),
          shapeT("Ellipse"),
          shapeT("Group")
        ),
        description: "A shape",
      },
      { name: "p", type: real2T(), description: "A point" },
    ],
    body: (
      _context: Context,
      s:
        | Circle<ad.Num>
        | Rectlike<ad.Num>
        | Line<ad.Num>
        | Polyline<ad.Num>
        | Polygon<ad.Num>
        | Ellipse<ad.Num>
        | Group<ad.Num>,
      p: ad.Num[]
    ): VectorV<ad.Num> => {
       const q = closestSilhouettePointShape(s,p);
       const qx = ifCond( eq(q[0],Infinity), p[0], q[0] );
       const qy = ifCond( eq(q[1],Infinity), p[1], q[1] );
       return { tag: "VectorV", contents: [qx,qy] };
    },
    returns: valueT("Real2"),
  },

  rectLineDist: {
    name: "rectLineDist",
    description:
      "Return the distance between a rectangle (defined using the bottom-left and top-right points) and a line (defined using start and end points)",
    params: [
      {
        name: "bottomLeft",
        type: real2T(),
        description: "bottom-left point of rectangle",
      },
      {
        name: "topRight",
        type: real2T(),
        description: "top-right point of rectangle",
      },
      { name: "start", type: real2T(), description: "start point of line" },
      { name: "end", type: real2T(), description: "end point of line" },
    ],
    body: (
      _context: Context,
      bottomLeft: ad.Pt2,
      topRight: ad.Pt2,
      start: ad.Pt2,
      end: ad.Pt2
    ): FloatV<ad.Num> =>
      floatV(rectLineDist({ bottomLeft, topRight }, { start, end })),
    returns: valueT("Real"),
  },

  shapeDistance: {
    name: "shapeDistance",
    description: "Return the distance between two shapes.",
    params: [
      { name: "s1", type: shapeT("AnyShape"), description: "a shape" },
      { name: "s2", type: shapeT("AnyShape"), description: "a shape" },
    ],
    body: (
      _context: Context,
      s1: Shape<ad.Num>,
      s2: Shape<ad.Num>
    ): FloatV<ad.Num> => floatV(shapeDistance(s1, s2)),
    returns: valueT("Real"),
  },

  /**
   * Returns the signed area enclosed by a polygonal chain given its nodes
   */
  signedArea: {
    name: "signedArea",
    description:
      "Returns the signed area enclosed by a polygonal chain given its nodes",
    params: [
      {
        name: "points",
        type: real2NT(),
        description: "points of polygonal chain",
      },
      {
        name: "closed",
        type: booleanT(),
        description: "whether the polygonic chain is closed",
      },
    ],
    body: (
      _context: Context,
      points: [ad.Num, ad.Num][],
      closed: boolean
    ): FloatV<ad.Num> => {
      return { tag: "FloatV", contents: signedArea(points, closed) };
    },
    returns: valueT("Real"),
  },

  /**
   * Returns the turning number of polygonal chain given its nodes
   */
  turningNumber: {
    name: "turningNumber",
    description:
      "Returns the turning number of polygonal chain given its nodes",
    params: [
      {
        name: "points",
        type: real2NT(),
        description: "points of polygonal chain",
      },
      {
        name: "closed",
        type: booleanT(),
        description: "whether the polygonic chain is closed",
      },
    ],
    body: (
      _context: Context,
      points: [ad.Num, ad.Num][],
      closed: boolean
    ): FloatV<ad.Num> => {
      return {
        tag: "FloatV",
        contents: turningNumber(points, closed),
      };
    },
    returns: valueT("Real"),
  },

  /**
   * Returns the total length of polygonal chain given its nodes
   */
  perimeter: {
    name: "perimeter",
    description: "Returns the total length of polygonal chain given its nodes",
    params: [
      {
        name: "points",
        type: real2NT(),
        description: "points of polygonal chain",
      },
      {
        name: "closed",
        type: booleanT(),
        description: "whether the polygonic chain is closed",
      },
    ],
    body: (
      _context: Context,
      points: [ad.Num, ad.Num][],
      closed: boolean
    ): FloatV<ad.Num> => {
      return { tag: "FloatV", contents: perimeter(points, closed) };
    },
    returns: valueT("Real"),
  },

  /**
   * Returns the isoperimetric ratio (perimeter squared divided by enclosed area)
   */
  isoperimetricRatio: {
    name: "isoperimetricRatio",
    description:
      "Returns the isoperimetric ratio (perimeter squared divided by enclosed area)",
    params: [
      {
        name: "points",
        type: real2NT(),
        description: "points of curve",
      },
      {
        name: "closed",
        type: booleanT(),
        description: "whether the curve is closed",
      },
    ],
    body: (
      _context: Context,
      points: [ad.Num, ad.Num][],
      closed: boolean
    ): FloatV<ad.Num> => {
      return { tag: "FloatV", contents: isoperimetricRatio(points, closed) };
    },
    returns: valueT("Real"),
  },

  /**
   * Returns integral of curvature squared along the curve
   */
  elasticEnergy: {
    name: "elasticEnergy",
    description: "Returns integral of curvature squared along the curve",
    params: [
      {
        name: "points",
        type: real2NT(),
        description: "points of curve",
      },
      {
        name: "closed",
        type: booleanT(),
        description: "whether curve is closed",
      },
    ],
    body: (
      _context: Context,
      points: [ad.Num, ad.Num][],
      closed: boolean
    ): FloatV<ad.Num> => {
      return { tag: "FloatV", contents: elasticEnergy(points, closed) };
    },
    returns: valueT("Real"),
  },

  /**
   * Returns integral of curvature along the curve
   */
  totalCurvature: {
    name: "totalCurvature",
    description: "Returns integral of curvature along the curve",
    params: [
      {
        name: "points",
        type: real2NT(),
        description: "points of curve",
      },
      {
        name: "closed",
        type: booleanT(),
        description: "whether curve is closed",
      },
      {
        name: "signed",
        type: booleanT(),
        description: "whether curvature is signed",
      },
    ],
    body: (
      _context: Context,
      points: [ad.Num, ad.Num][],
      closed: boolean,
      signed = true
    ): FloatV<ad.Num> => {
      return {
        tag: "FloatV",
        contents: totalCurvature(points, closed, signed),
      };
    },
    returns: valueT("Real"),
  },

  /**
   * Returns the sum of all line segment lengths raised to `k`
   */
  lengthK: {
    name: "lengthK",
    description: "Returns the sum of all line segment lengths raised to `k`",
    params: [
      {
        name: "points",
        type: real2NT(),
        description: "points of curve",
      },
      {
        name: "closed",
        type: booleanT(),
        description: "whether curve is closed",
      },
      {
        name: "k",
        type: realT(),
        description: "exponent for line segments",
      },
    ],
    body: (
      _context: Context,
      points: [ad.Num, ad.Num][],
      closed: boolean,
      k: number
    ): FloatV<ad.Num> => {
      return { tag: "FloatV", contents: lengthK(points, closed, k) };
    },
    returns: valueT("Real"),
  },

  /**
   * Returns the maximum value of curvature along the curve
   */
  maxCurvature: {
    name: "maxCurvature",
    description: "Returns the maximum value of curvature along the curve",
    params: [
      {
        name: "points",
        type: real2NT(),
        description: "points of curve",
      },
      {
        name: "closed",
        type: booleanT(),
        description: "whether curve is closed",
      },
    ],
    body: (
      _context: Context,
      points: [ad.Num, ad.Num][],
      closed: boolean
    ): FloatV<ad.Num> => {
      return { tag: "FloatV", contents: maxCurvature(points, closed) };
    },
    returns: valueT("Real"),
  },

  /**
   * Returns integral of curvature raised to `p` along the curve
   */
  pElasticEnergy: {
    name: "pElasticEnergy",
    description: "Returns integral of curvature raised to `p` along the curve",
    params: [
      {
        name: "points",
        type: real2NT(),
        description: "points of curve",
      },
      {
        name: "closed",
        type: booleanT(),
        description: "whether curve is closed",
      },
      {
        name: "p",
        type: realT(),
        description: "exponent for curvature",
      },
    ],
    body: (
      _context: Context,
      points: [ad.Num, ad.Num][],
      closed: boolean,
      p: number
    ): FloatV<ad.Num> => {
      return { tag: "FloatV", contents: pElasticEnergy(points, closed, p) };
    },
    returns: valueT("Real"),
  },

  /**
   * Returns integral of curvature derivative raised to `p` along the curve
   */
  inflectionEnergy: {
    name: "inflectionEnergy",
    description:
      "Returns integral of curvature derivative raised to `p` along the curve",
    params: [
      {
        name: "points",
        type: real2NT(),
        description: "points of curve",
      },
      {
        name: "closed",
        type: booleanT(),
        description: "whether curve is closed",
      },
      {
        name: "p",
        type: realT(),
        description: "exponent for curvature derivative",
      },
    ],
    body: (
      _context: Context,
      points: [ad.Num, ad.Num][],
      closed: boolean,
      p: number
    ): FloatV<ad.Num> => {
      return { tag: "FloatV", contents: inflectionEnergy(points, closed, p) };
    },
    returns: valueT("Real"),
  },

  /**
   * Returns center of mass for a 2D point cloud
   */
  centerOfMass: {
    name: "centerOfMass",
    description: "Returns center of mass for a 2D point cloud",
    params: [
      {
        name: "points",
        type: real2NT(),
        description: "points of curve",
      },
    ],
    body: (_context: Context, points: [ad.Num, ad.Num][]): VectorV<ad.Num> => {
      return { tag: "VectorV", contents: centerOfMass(points) };
    },
    returns: valueT("Real2"),
  },
};

// `_compDictVals` causes TypeScript to enforce that every function in
// `compDict` actually has type `CompFunc` with the right function signature, etc.
const _compDictVals: CompFunc[] = Object.values(compDict);

/*
  Computes the signed distance for a line 
  float sdSegment( in vec2 p, in vec2 a, in vec2 b )
  {
    vec2 pa = p-a, ba = b-a;
    float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    return length( pa - ba*h );
  }
*/
const sdLine = (s: Line<ad.Num>, p: ad.Num[]): ad.Num => {
  return sdLineAsNums(s.start.contents, s.end.contents, p);
};

const sdLineAsNums = (a: ad.Num[], b: ad.Num[], p: ad.Num[]): ad.Num => {
  const pa = ops.vsub(p, a);
  const ba = ops.vsub(b, a);
  const h = clamp([0, 1], div(ops.vdot(pa, ba), ops.vdot(ba, ba)));
  return ops.vnorm(ops.vsub(pa, ops.vmul(h, ba)));
};

const sdPolyline = (s: Polyline<ad.Num>, p: ad.Num[]): ad.Num => {
  const dists: ad.Num[] = [];
  for (let i = 0; i < s.points.contents.length - 1; i++) {
    const start = s.points.contents[i];
    const end = s.points.contents[i + 1];
    dists[i] = sdLineAsNums(start, end, p);
  }
  return minN(dists);
};

export const sdEllipse = (s: Ellipse<ad.Num>, p: ad.Num[]): ad.Num => {
  return sdEllipseAsNums(s.rx.contents, s.ry.contents, s.center.contents, p);
};

/*
  float msign(in float x) { return (x<0.0)?-1.0:1.0; }
*/
export const msign = (x: ad.Num): ad.Num => {
  return ifCond(lt(x, 0), -1, 1);
};

/*
  Ported code is here: https://www.shadertoy.com/view/4sS3zz
*/
export const sdEllipseAsNums = (
  radiusx: ad.Num,
  radiusy: ad.Num,
  center: ad.Num[],
  pInput: ad.Num[]
): ad.Num => {
  // if = abs( p );
  // if( p.x>p.y ){ p=p.yx; ab=ab.yx; }
  const pOffset = ops.vsub(pInput, center);
  const pUnswizzled = ops.vabs(pOffset);
  const abUnswizzled = [radiusx, radiusy];
  const p = [];
  const ab = [];
  p[0] = ifCond(
    gt(pUnswizzled[0], pUnswizzled[1]),
    pUnswizzled[1],
    pUnswizzled[0]
  );
  p[1] = ifCond(
    gt(pUnswizzled[0], pUnswizzled[1]),
    pUnswizzled[0],
    pUnswizzled[1]
  );
  ab[0] = ifCond(
    gt(pUnswizzled[0], pUnswizzled[1]),
    abUnswizzled[1],
    abUnswizzled[0]
  );
  ab[1] = ifCond(
    gt(pUnswizzled[0], pUnswizzled[1]),
    abUnswizzled[0],
    abUnswizzled[1]
  );
  // float l = ab.y*ab.y - ab.x*ab.x;
  const l = sub(squared(ab[1]), squared(ab[0]));
  // float m = ab.x*p.x/l;
  const m = div(mul(ab[0], p[0]), l);
  // float m2 = m*m;
  const m2 = squared(m);
  // float n = ab.y*p.y/l;
  const n = div(mul(ab[1], p[1]), l);
  // float n2 = n*n;
  const n2 = squared(n);
  // float c = (m2+n2-1.0)/3.0; float c3 = c*c*c;
  const c = div(sub(add(m2, n2), 1), 3);
  const c3 = mul(mul(c, c), c);
  // float q = c3 + m2*n2*2.0;
  const q = add(c3, mul(m2, mul(n2, 2)));
  // float d = c3 + m2*n2;
  const d = add(c3, mul(m2, n2));
  // float g = m + m*n2;
  const g = add(m, mul(m, n2));

  //if branch
  // float h = acos(q/c3)/3.0;
  const hif = div(acos(div(q, c3)), 3);
  // float s = cos(h) + 2.0;
  const sif = add(cos(hif), 2);
  // float t = sin(h)*sqrt(3.0);
  const tif = mul(sin(hif), sqrt(3));
  // float rx = sqrt( m2-c*(s+t) );
  const rxif = sqrt(sub(m2, mul(c, add(sif, tif))));
  // float ry = sqrt( m2-c*(s-t) );
  const ryif = sqrt(sub(m2, mul(c, sub(sif, tif))));
  // co = ry + sign(l)*rx + abs(g)/(rx*ry);
  const coif = add(
    add(ryif, mul(sign(l), rxif)),
    div(absVal(g), mul(rxif, ryif))
  );
  // elsebranch
  // float h = 2.0*m*n*sqrt(d);
  const h = mul(2, mul(m, mul(n, sqrt(d))));
  // float s = msign(q+h)*pow( abs(q+h), 1.0/3.0 );
  const onethird = div(1, 3);
  const s = mul(msign(add(q, h)), pow(absVal(add(q, h)), onethird));
  // float t = msign(q-h)*pow( abs(q-h), 1.0/3.0 );
  const t = mul(msign(sub(q, h)), pow(absVal(sub(q, h)), onethird));
  // float rx = -(s+t) - c*4.0 + 2.0*m2;
  const rx = add(sub(neg(add(s, t)), mul(c, 4)), mul(2, m2));
  // float ry =  (s-t)*sqrt(3.0);
  const ry = mul(sub(s, t), sqrt(3));
  // float rm = sqrt( rx*rx + ry*ry );
  const rm = sqrt(add(squared(rx), squared(ry)));
  // co = ry/sqrt(rm-rx) + 2.0*g/rm;
  const coelse = add(div(ry, sqrt(sub(rm, rx))), mul(2, div(g, rm)));

  // co = (co-m)/2.0;
  // if (d<0.0)
  const co_pred = ifCond(lt(d, 0), coif, coelse);
  const co = div(sub(co_pred, m), 2);

  // float si = sqrt( max(1.0-co*co,0.0) );
  const si = sqrt(max(sub(1, squared(co)), 0));
  // vec2 r = ab * vec2(co,si);
  const r = ops.vproduct(ab, [co, si]);
  // return length(r-p) * msign(p.y-r.y);
  return mul(ops.vnorm(ops.vsub(r, p)), msign(sub(p[1], r[1])));
};

const rayIntersectShape = (
      s:
        | Circle<ad.Num>
        | Rectlike<ad.Num>
        | Line<ad.Num>
        | Polyline<ad.Num>
        | Polygon<ad.Num>
        | Ellipse<ad.Num>
        | Group<ad.Num>,
      p: ad.Num[],
      v: ad.Num[]
): ad.Num[][] => {
   const t = s.shapeType;
   if (t === "Circle") {
      return rayIntersectCircle(s,p,v);
   } else if (
      t === "Rectangle" ||
      t === "Text" ||
      t === "Equation" ||
      t === "Image"
   ) {
      return rayIntersectRect(s,p,v);
   } else if (t === "Line") {
      return rayIntersectLine(s,p,v);
   } else if (t === "Polyline") {
      return rayIntersectPolyline(s,p,v);
   } else if (t === "Polygon") {
      return rayIntersectPolygon(s,p,v);
   } else if (t === "Ellipse") {
      return rayIntersectEllipse(s,p,v);
   } else { // t === "Group"
      const firstHits = s.shapes.contents.map((shape) => rayIntersectShape(shape,p,v));
      const dist = firstHits.map((hit) => ops.vdist(hit[0],p));
      let hitX: ad.Num = Infinity;
      let hitY: ad.Num = Infinity;
      let nrmX: ad.Num = Infinity;
      let nrmY: ad.Num = Infinity;
      let firstDist: ad.Num = Infinity;
      for (let i = 0; i < s.shapes.contents.length; i++) {
         firstDist = ifCond(lt(firstDist, dist[i]), firstDist, dist[i]);
         hitX = ifCond(eq(firstDist, dist[i]), firstHits[i][0][0], hitX);
         hitY = ifCond(eq(firstDist, dist[i]), firstHits[i][0][1], hitY);
         nrmX = ifCond(eq(firstDist, dist[i]), firstHits[i][1][0], nrmX);
         nrmY = ifCond(eq(firstDist, dist[i]), firstHits[i][1][1], nrmY);
      }
      return [ [hitX,hitY], [nrmX,nrmY] ];
   }
}

const rayIntersectCircle = (
   s: Circle<ad.Num>,
   p: ad.Num[],
   v: ad.Num[],
): ad.Num[][] => {
   const c = s.center.contents;
   const r = s.r.contents;
   return rayIntersectCircleCoords( p, v, c, r );
}

const rayIntersectEllipse = (
   s: Ellipse<ad.Num>,
   p0: ad.Num[],
   v0: ad.Num[],
): ad.Num[][] => {
   // map ray data to coordinate system for unit circle
   const r = [ s.rx.contents, s.ry.contents ];
   const c0 = s.center.contents;
   const p = ops.ewvvdiv( p0, r );
   const v = ops.ewvvdiv( v0, r );
   const c = ops.ewvvdiv( c0, r );

   const hit = rayIntersectCircleCoords( p, v, c, 1 );

   // map hit point and normal back to ellipse coordinate system
   const x = ops.ewvvmul( hit[0], r );
   const n = ops.vnormalize( [ mul(div(r[1],r[0]),sub(x[0],c0[0])), mul(div(r[0],r[1]),sub(x[1],c0[1])) ] );

   return [x,n];
}

const rayIntersectCircleCoords = (
   p: ad.Num[],
   v: ad.Num[],
   c: ad.Num[],
   r: ad.Num
): ad.Num[][] => {
   const w = ops.vnormalize(v);
   const u = ops.vsub(p,c);
   const B = neg(ops.vdot(u,w));
   const C = sub(ops.vdot(u,u),mul(r,r));
   const D = sub(mul(B,B),C);
   const t1 = ifCond( lt(D,0), Infinity, sub(B,sqrt(D)) );
   const t2 = ifCond( lt(D,0), Infinity, add(B,sqrt(D)) );
   const t = ifCond( gt(t1,0), t1, ifCond( gt(t2,0), t2, Infinity ));
   const x = ops.vadd(p,ops.vmul(t,w));
   const n = ops.vnormalize(ops.vsub(x,c));
   return [x,n];
}

const rayIntersectLine = (
   S: Line<ad.Num>,
   p: ad.Num[],
   v: ad.Num[],
): ad.Num[][] => {
   return rayIntersectLineCoords( p, v, S.start.contents, S.end.contents );
}

const rayIntersectRect = (
   S: Line<ad.Num>,
   p: ad.Num[],
   v: ad.Num[],
): ad.Num[][] => {
   const c = S.center.contents;
   const w = S.width.contents;
   const h = S.height.contents;
   const x0 = sub( c[0], div(w,2.) );
   const x1 = add( c[0], div(w,2.) );
   const y0 = sub( c[1], div(h,2.) );
   const y1 = add( c[1], div(h,2.) );

   const points = [ [x0,y0], [x1,y0], [x1,y1], [x0,y1], [x0,y0] ];
   const firstHits: ad.Num[][][] = [];
   const dist: ad.Num[] = [];
   for (let i = 0; i < 4; i++) {
      const a = points[i];
      const b = points[i+1];
      firstHits[i] = rayIntersectLineCoords( p, v, a, b );
      dist[i] = ops.vdist( p, firstHits[i][0] );
   }

   let hitX: ad.Num = Infinity;
   let hitY: ad.Num = Infinity;
   let nrmX: ad.Num = Infinity;
   let nrmY: ad.Num = Infinity;
   let firstDist: ad.Num = Infinity;
   for (let i = 0; i < 4; i++) {
      firstDist = ifCond(lt(firstDist, dist[i]), firstDist, dist[i]);
      hitX = ifCond(eq(firstDist, dist[i]), firstHits[i][0][0], hitX);
      hitY = ifCond(eq(firstDist, dist[i]), firstHits[i][0][1], hitY);
      nrmX = ifCond(eq(firstDist, dist[i]), firstHits[i][1][0], nrmX);
      nrmY = ifCond(eq(firstDist, dist[i]), firstHits[i][1][1], nrmY);
   }
   return [ [hitX,hitY], [nrmX,nrmY] ];
}

const rayIntersectPolyline = (
   s: Polyline<ad.Num>,
   p: ad.Num[],
   v: ad.Num[]
): ad.Num[][] => {
   const firstHits: ad.Num[][][] = [];
   const dist: ad.Num[] = [];
   for (let i = 0; i < s.points.contents.length - 1; i++) {
      const a = s.points.contents[i];
      const b = s.points.contents[i + 1];
      firstHits[i] = rayIntersectLineCoords( p, v, a, b );
      dist[i] = ops.vdist( p, firstHits[i][0] );
   }
   let firstDist: ad.Num = Infinity;
   let hitX: ad.Num = Infinity;
   let hitY: ad.Num = Infinity;
   let nrmX: ad.Num = 0;
   let nrmY: ad.Num = 0;
   for (let i = 0; i < s.points.contents.length - 1; i++) {
      firstDist = ifCond(lt(firstDist, dist[i]), firstDist, dist[i]);
      hitX = ifCond(eq(firstDist, dist[i]), firstHits[i][0][0], hitX);
      hitY = ifCond(eq(firstDist, dist[i]), firstHits[i][0][1], hitY);
      nrmX = ifCond(eq(firstDist, dist[i]), firstHits[i][1][0], nrmX);
      nrmY = ifCond(eq(firstDist, dist[i]), firstHits[i][1][1], nrmY);
   }
   return [ [hitX,hitY], [nrmX,nrmY] ];
}

const rayIntersectPolygon = (
   s: Polygon<ad.Num>,
   p: ad.Num[],
   v: ad.Num[]
): ad.Num[][] => {
   const firstHits: ad.Num[][][] = [];
   const dist: ad.Num[] = [];
   let i = 0;
   for (; i < s.points.contents.length - 1; i++) {
      const a = s.points.contents[i];
      const b = s.points.contents[i + 1];
      firstHits[i] = rayIntersectLineCoords( p, v, a, b );
      dist[i] = ops.vdist( p, firstHits[i][0] );
   }

   const a = s.points.contents[i];
   const b = s.points.contents[0];
   firstHits[i] = rayIntersectLineCoords( p, v, a, b );
   dist[i] = ops.vdist( p, firstHits[i][0] );

   let firstDist: ad.Num = Infinity;
   let hitX: ad.Num = Infinity;
   let hitY: ad.Num = Infinity;
   let nrmX: ad.Num = 0;
   let nrmY: ad.Num = 0;
   for (let i = 0; i < s.points.contents.length; i++) {
      firstDist = ifCond(lt(firstDist, dist[i]), firstDist, dist[i]);
      hitX = ifCond(eq(firstDist, dist[i]), firstHits[i][0][0], hitX);
      hitY = ifCond(eq(firstDist, dist[i]), firstHits[i][0][1], hitY);
      nrmX = ifCond(eq(firstDist, dist[i]), firstHits[i][1][0], nrmX);
      nrmY = ifCond(eq(firstDist, dist[i]), firstHits[i][1][1], nrmY);
   }
   return [ [hitX,hitY], [nrmX,nrmY] ];
}

const rayIntersectLineCoords = (
   p: ad.Num[],
   v: ad.Num[],
   a: ad.Num[],
   b: ad.Num[],
): ad.Num[][] => {
   const u = ops.vsub(b,a);
   const w = ops.vsub(p,a);
   const d = ops.cross2(v,u);
   const s = div(ops.cross2(v,w),d);
   const t = div(ops.cross2(u,w),d);

   // position
   const T = ifCond( lt(t,0), Infinity, ifCond( lt(s,0), Infinity, ifCond( gt(s,1), Infinity, t )));
   const x = ops.vadd(p,ops.vmul(T,v));

   // normal
   let n = ops.vnormalize(ops.rot90(u));
   const nX = ifCond( lt(t,0), 0, ifCond( lt(s,0), 0, ifCond( gt(s,1), 0, n[0] )));
   const nY = ifCond( lt(t,0), 0, ifCond( lt(s,0), 0, ifCond( gt(s,1), 0, n[1] )));

   return [x,[nX,nY]];
}

const closestPointShape = (
      s:
        | Circle<ad.Num>
        | Rectlike<ad.Num>
        | Line<ad.Num>
        | Polyline<ad.Num>
        | Polygon<ad.Num>
        | Ellipse<ad.Num>
        | Group<ad.Num>,
      p: ad.Num[]
): ad.Num[] => {
   const t = s.shapeType;
   if (t === "Circle") {
      return closestPointCircle( s, p );
   } else if (
      t === "Rectangle" ||
      t === "Text" ||
      t === "Equation" ||
      t === "Image"
   ) {
      return closestPointRect(s,p);
   } else if (t === "Line") {
      return closestPointLine(s,p);
   } else if (t === "Polyline") {
      return closestPointPolyline(s,p);
   } else if (t === "Polygon") {
      return closestPointPolygon(s,p);
   } else if (t === "Ellipse") {
      return closestPointEllipse(s,p);
   } else { // t === "Group"
      const closestPoints = s.shapes.contents.map((shape) => closestPointShape(shape,p));
      const dist = closestPoints.map((point) => ops.vdist(point,p));
      let closestX: ad.Num = Infinity;
      let closestY: ad.Num = Infinity;
      let minDist: ad.Num = Infinity;
      for (let i = 0; i < s.shapes.contents.length; i++) {
         minDist = ifCond(lt(minDist, dist[i]), minDist, dist[i]);
         closestX = ifCond(eq(minDist, dist[i]), closestPoints[i][0], closestX);
         closestY = ifCond(eq(minDist, dist[i]), closestPoints[i][1], closestY);
      }
      return [closestX, closestY];
   }
}

const closestPointCircle = (
   s: Circle<ad.Num>,
   p: ad.Num[]
): ad.Num[] => {
   /**
    * Implementing formula
    * V = P - C
    * return C + (V/|V|)*r
    */
   const pOffset = ops.vsub(p, s.center.contents);
   const normOffset = ops.vnorm(pOffset);
   const unitVector = ops.vdiv(pOffset, normOffset);
   const pOnCircumferenceOffset = ops.vmul(s.r.contents, unitVector);
   const pOnCircumference = ops.vadd(
      s.center.contents,
      pOnCircumferenceOffset
   );
   return pOnCircumference;
}

const closestPointLine = (
   s: Line<ad.Num>,
   p: ad.Num[]
): ad.Num[] => {
   return closestPointLineCoords(p, s.start.contents, s.end.contents);
}

const closestPointPolyline = (
   s: Polyline<ad.Num>,
   p: ad.Num[]
): ad.Num[] => {
   const closestPoints: ad.Num[][] = [];
   const dist: ad.Num[] = [];
   for (let i = 0; i < s.points.contents.length - 1; i++) {
      const a = s.points.contents[i];
      const b = s.points.contents[i + 1];
      closestPoints[i] = closestPointLineCoords(p, a, b);
      dist[i] = ops.vdist(p, closestPoints[i]);
   }
   let closestX: ad.Num = Infinity;
   let closestY: ad.Num = Infinity;
   let minDist: ad.Num = Infinity;
   for (let i = 0; i < s.points.contents.length - 1; i++) {
      minDist = ifCond(lt(minDist, dist[i]), minDist, dist[i]);
      closestX = ifCond(eq(minDist, dist[i]), closestPoints[i][0], closestX);
      closestY = ifCond(eq(minDist, dist[i]), closestPoints[i][1], closestY);
   }
   return [closestX, closestY];
}

const closestPointPolygon = (
   s: Polygon<ad.Num>,
   p: ad.Num[]
): ad.Num[] => {
   const closestPoints: ad.Num[][] = [];
   const dist: ad.Num[] = [];
   let i = 0;
   for (; i < s.points.contents.length - 1; i++) {
      const a = s.points.contents[i];
      const b = s.points.contents[i + 1];
      closestPoints[i] = closestPointLineCoords(p, a, b);
      dist[i] = ops.vdist(p, closestPoints[i]);
   }
   const a = s.points.contents[i];
   const b = s.points.contents[0];
   closestPoints[i] = closestPointLineCoords(p, a, b);
   dist[i] = ops.vdist(p, closestPoints[i]);
   let closestX: ad.Num = Infinity;
   let closestY: ad.Num = Infinity;
   let minDist: ad.Num = Infinity;
   for (let i = 0; i < s.points.contents.length; i++) {
      minDist = ifCond(lt(minDist, dist[i]), minDist, dist[i]);
      closestX = ifCond(eq(minDist, dist[i]), closestPoints[i][0], closestX);
      closestY = ifCond(eq(minDist, dist[i]), closestPoints[i][1], closestY);
   }
   return [closestX, closestY];
}

const closestPointRect = (
   s: Rectlike<ad.Num>,
   p: ad.Num[]
): ad.Num[] => {
  const l = sub(s.center.contents[0], div(s.width.contents, 2));
  const t = sub(s.center.contents[1], div(s.height.contents, 2));
  const w = s.width.contents;
  const h = s.height.contents;
  const r = add(l, w);
  const b = add(t, h);
  const x = clamp([l, r], p[0]);
  const y = clamp([t, b], p[1]);
  const dl = absVal(sub(x, l));
  const dr = absVal(sub(x, r));
  const dt = absVal(sub(y, t));
  const db = absVal(sub(y, b));
  const m = min(min(min(dl, dr), dt), db);
  let retX: ad.Num = ifCond(or(eq(m, dt), eq(m, db)), x, r);
  retX = ifCond(eq(m, dl), l, retX);
  let retY: ad.Num = ifCond(or(eq(m, dl), eq(m, dr)), y, t);
  retY = ifCond(eq(m, db), b, retY);

  return [retX, retY];
};

const closestPointEllipse = (
   s: Ellipse<ad.Num>,
   p: ad.Num[]
): ad.Num[] => {
   return closestPointEllipseCoords( s.rx.contents, s.ry.contents, s.center.contents, p );
};

const closestPointLineCoords = (p: ad.Num[], a: ad.Num[], b: ad.Num[]): ad.Num[] => {
  const a_to_p = [sub(p[0], a[0]), sub(p[1], a[1])];
  const a_to_b = [sub(b[0], a[0]), sub(b[1], a[1])];
  const atb2 = add(squared(a_to_b[0]), squared(a_to_b[1]));
  const atp_dot_atb = add(mul(a_to_p[0], a_to_b[0]), mul(a_to_p[1], a_to_b[1]));
  const t = clamp([0, 1], div(atp_dot_atb, atb2));
  return [add(a[0], mul(a_to_b[0], t)), add(a[1], mul(a_to_b[1], t))];
};

const closestPointEllipseCoords = (
  // Note: this is an approximation function!
  radiusx: ad.Num,
  radiusy: ad.Num,
  center: ad.Num[],
  pInput: ad.Num[]
): ad.Num[] => {
  const pOffset = ops.vsub(pInput, center);
  const px = absVal(pOffset[0]);
  const py = absVal(pOffset[1]);

  let t = div(Math.PI, 4);
  let x: ad.Num = 0;
  let y: ad.Num = 0;

  const a = radiusx;
  const b = radiusy;
  for (let i = 0; i < 100; i++) {
    x = mul(a, cos(t));
    y = mul(b, sin(t));

    const ex = div(mul(sub(squared(a), squared(b)), pow(cos(t), 3)), a);
    const ey = div(mul(sub(squared(b), squared(a)), pow(sin(t), 3)), b);

    const rx = sub(x, ex);
    const ry = sub(y, ey);

    const qx = sub(px, ex);
    const qy = sub(py, ey);

    const r = sqrt(add(squared(ry), squared(rx)));
    const q = sqrt(add(squared(qy), squared(qx)));

    const delta_c = mul(r, asin(div(sub(mul(rx, qy), mul(ry, qx)), mul(r, q))));
    const delta_t = div(
      delta_c,
      sqrt(sub(sub(add(squared(a), squared(b)), squared(x)), squared(y)))
    );
    t = add(t, delta_t);
    t = min(div(Math.PI, 2), max(0, t));
  }
  x = mul(msign(pInput[0]), absVal(x));
  y = mul(msign(pInput[1]), absVal(y));
  x = add(x, center[0]);
  y = add(y, center[1]);
  return [x, y];
};

/* Returns the closest point on the visibility
 * silhouette of shape S relative to point p.
 * If there is no silhouette, returns p. */
const closestSilhouettePointShape = (
      s:
        | Circle<ad.Num>
        | Rectlike<ad.Num>
        | Line<ad.Num>
        | Polyline<ad.Num>
        | Polygon<ad.Num>
        | Ellipse<ad.Num>
        | Group<ad.Num>,
      p: ad.Num[]
): ad.Num[] => {
   const t = s.shapeType;
   if (t === "Circle") {
      return closestSilhouettePointCircle( s, p );
   } else if (
      t === "Rectangle" ||
      t === "Text" ||
      t === "Equation" ||
      t === "Image"
   ) {
      return closestSilhouettePointRect(s,p);
   } else if (t === "Line") {
      return closestSilhouettePointLine(s,p);
   } else if (t === "Polyline") {
      return closestSilhouettePointPolyline(s,p);
   } else if (t === "Polygon") {
      return closestSilhouettePointPolygon(s,p);
   } else if (t === "Ellipse") {
      return closestSilhouettePointEllipse(s,p);
   } else { // t === "Group"
      const closestSilhouettePoints = s.shapes.contents.map((shape) => closestSilhouettePointShape(shape,p));
      const dist = closestSilhouettePoints.map((point) => ops.vdist(point,p));
      let closestX: ad.Num = Infinity;
      let closestY: ad.Num = Infinity;
      let minDist: ad.Num = Infinity;
      for (let i = 0; i < s.shapes.contents.length; i++) {
         minDist = ifCond(lt(minDist, dist[i]), minDist, dist[i]);
         closestX = ifCond(eq(minDist, dist[i]), closestSilhouettePoints[i][0], closestX);
         closestY = ifCond(eq(minDist, dist[i]), closestSilhouettePoints[i][1], closestY);
      }
      return [closestX, closestY];
   }
}

const closestSilhouettePointCircle = (
   s: Circle<ad.Num>,
   p: ad.Num[]
): ad.Num[] => {
   const c = s.center.contents;
   const r = s.r.contents;
   const y = closestSilhouettePointEllipseCoords( ops.vsub(p,c), r, r );
   return ops.vadd(y,c);
}

const closestSilhouettePointEllipse = (
   s: Ellipse<ad.Num>,
   p: ad.Num[]
): ad.Num[] => {
   const c = s.center.contents;
   const rx = s.rx.contents;
   const ry = s.ry.contents;
   const y = closestSilhouettePointEllipseCoords( ops.vsub(p,c), rx, ry );
   return ops.vadd(y,c);
}

const closestSilhouettePointLine = (
   s: Line<ad.Num>,
   p: ad.Num[]
): ad.Num[] => {
   const a = s.start.contents;
   const b = s.end.contents;
   const da = ops.vdistsq(p,a);
   const db = ops.vdistsq(p,b);
   const y0 = ifCond(lt(da,db), a[0], b[0] );
   const y1 = ifCond(lt(da,db), a[1], b[1] );
   return [y0,y1];
}

/* Computes the closest silhouette on an ellipse with radii a0,b0 relative to a
 * point p0, assuming the ellipse has already been translated to the origin and
 * rotated to be axis-aligned. */
const closestSilhouettePointEllipseCoords = (
   p0: ad.Num[],
   a0: ad.Num[],
   b0: ad.Num[]
): ad.Num[] => {
   const b = div(b0,a0);
   const b2 = mul(b,b);
   const p = ops.vdiv(p0,a0);
   const x = p[0];
   const y = p[1];
   const x2 = mul(x,x);
   const y2 = mul(y,y);
   const d = add( mul(b2,x2), y2 );
   const e = add( mul(mul(b2,sub(x2,1)),y2), mul(y2,y2) );
   const f = mul(b2,x);
   const g = mul(b2,y2);
   const u0 = ifCond(lt(e,0), Infinity, mul(a0,div(sub(f,sqrt(e)),d)));
   const u1 = ifCond(lt(e,0), Infinity, mul(a0,div(add(g,mul(mul(x,b2),sqrt(e))),mul(d,y))));
   const v0 = ifCond(lt(e,0), Infinity, mul(a0,div(add(f,sqrt(e)),d)));
   const v1 = ifCond(lt(e,0), Infinity, mul(a0,div(sub(g,mul(mul(x,b2),sqrt(e))),mul(d,y))));
   const du = ops.vdist([u0,u1], p0);
   const dv = ops.vdist([v0,v1], p0);
   const z0 = ifCond(lt(du,dv), u0, v0);
   const z1 = ifCond(lt(du,dv), u1, v1);
   return [z0,z1];
}

const closestSilhouettePointRect = (
   S: Line<ad.Num>,
   p: ad.Num[],
   v: ad.Num[],
): ad.Num[][] => {
   const c = S.center.contents;
   const w = S.width.contents;
   const h = S.height.contents;
   const x0 = sub( c[0], div(w,2.) );
   const x1 = add( c[0], div(w,2.) );
   const y0 = sub( c[1], div(h,2.) );
   const y1 = add( c[1], div(h,2.) );

   const points = [ [x0,y0], [x1,y0], [x1,y1], [x0,y1] ];
   const closestSilhouettePoints: ad.Num[][][] = [];
   const dist: ad.Num[] = [];
   for (let i = 0; i < 4; i++) {
      const a = points[i];
      const b = points[(i+1)%4];
      const c = points[(i+2)%4];
      closestSilhouettePoints[i] = closestSilhouettePointCorner( p, a, b, c );
      dist[i] = ops.vdist( p, closestSilhouettePoints[i] );
   }

   let closestX: ad.Num = Infinity;
   let closestY: ad.Num = Infinity;
   let minDist: ad.Num = Infinity;
   for (let i = 0; i < 4; i++) {
      minDist = ifCond(lt(minDist, dist[i]), minDist, dist[i]);
      closestX = ifCond(eq(minDist, dist[i]), closestSilhouettePoints[i][0], closestX);
      closestY = ifCond(eq(minDist, dist[i]), closestSilhouettePoints[i][1], closestY);
   }
   return [closestX,closestY];
}

const closestSilhouettePointPolyline = (
   s: Polyline<ad.Num>,
   p: ad.Num[]
): ad.Num[] => {
   const closestSilhouettePoints: ad.Num[][] = [];
   const dist: ad.Num[] = [];

   // interior points
   for (let i = 0; i < s.points.contents.length-2; i++) {
      const a = s.points.contents[i];
      const b = s.points.contents[i+1];
      const c = s.points.contents[i+2];
      closestSilhouettePoints[i] = closestSilhouettePointCorner(p, a, b, c);
      dist[i] = ops.vdist(p, closestSilhouettePoints[i]);
   }
   let closestX: ad.Num = Infinity;
   let closestY: ad.Num = Infinity;
   let minDist: ad.Num = Infinity;
   for (let i = 0; i < s.points.contents.length-2; i++) {
      minDist = ifCond(lt(minDist, dist[i]), minDist, dist[i]);
      closestX = ifCond(eq(minDist, dist[i]), closestSilhouettePoints[i][0], closestX);
      closestY = ifCond(eq(minDist, dist[i]), closestSilhouettePoints[i][1], closestY);
   }

   //endpoints
   const q0 = s.points.contents[0];
   let dist0 = ops.vdist(p, q0);
   minDist = ifCond(lt(minDist, dist0), minDist, dist0);
   closestX = ifCond(eq(minDist, dist0), q0[0], closestX);
   closestY = ifCond(eq(minDist, dist0), q0[1], closestY);
   const qN = s.points.contents[ s.points.contents.length-1 ];
   let distN = ops.vdist(p, qN);
   minDist = ifCond(lt(minDist, distN), minDist, distN);
   closestX = ifCond(eq(minDist, distN), qN[0], closestX);
   closestY = ifCond(eq(minDist, distN), qN[1], closestY);

   return [closestX, closestY];
}

const closestSilhouettePointPolygon = (
   s: Polyline<ad.Num>,
   p: ad.Num[]
): ad.Num[] => {
   const closestSilhouettePoints: ad.Num[][] = [];
   const dist: ad.Num[] = [];
   for (let i = 0; i < s.points.contents.length; i++) {
      const j = (i+1) % s.points.contents.length;
      const k = (i+2) % s.points.contents.length;
      const a = s.points.contents[i];
      const b = s.points.contents[j];
      const c = s.points.contents[k];
      closestSilhouettePoints[i] = closestSilhouettePointCorner(p, a, b, c);
      dist[i] = ops.vdist(p, closestSilhouettePoints[i]);
   }
   let closestX: ad.Num = Infinity;
   let closestY: ad.Num = Infinity;
   let minDist: ad.Num = Infinity;
   for (let i = 0; i < s.points.contents.length; i++) {
      minDist = ifCond(lt(minDist, dist[i]), minDist, dist[i]);
      closestX = ifCond(eq(minDist, dist[i]), closestSilhouettePoints[i][0], closestX);
      closestY = ifCond(eq(minDist, dist[i]), closestSilhouettePoints[i][1], closestY);
   }
   return [closestX, closestY];
}

/* Given three points a, b, c describing a pair of line segments ab, bc and a
 * query point p, returns b if it is a silhouette point, relative to p, and
 * (Infinity,Infinity) otherwise. */
const closestSilhouettePointCorner = (
   p: ad.Num[],
   a: ad.Num[],
   b: ad.Num[],
   c: ad.Num[]
): ad.Num => {
   const s = mul( ops.cross2( ops.vsub(b,a), ops.vsub(p,a) ),
                  ops.cross2( ops.vsub(c,b), ops.vsub(p,b) ) );
   const y0 = ifCond( lt(s,0), b[0], Infinity );
   const y1 = ifCond( lt(s,0), b[1], Infinity );
   return [y0,y1];
}

const toPt = (v: ad.Num[]): ad.Pt2 => {
  if (v.length !== 2) {
    throw Error("expected vector of length 2");
  }
  return [v[0], v[1]];
};

/**
 * Given two perpendicular vectors `[startR, endR]` and `[startL, endL]`, return a path that describes a perpendicular mark between them.
 */
const perpPathFlat = (
  len: ad.Num,
  [startR, endR]: [ad.Num[], ad.Num[]],
  [startL, endL]: [ad.Num[], ad.Num[]]
): [ad.Num[], ad.Num[], ad.Num[]] => {
  // perpPathFlat :: Autofloat a => a -> (Pt2 a, Pt2 a) -> (Pt2 a, Pt2 a) -> (Pt2 a, Pt2 a, Pt2 a)
  // perpPathFlat size (startR, endR) (startL, endL) =
  //   let dirR = normalize' $ endR -: startR
  //       dirL = normalize' $ endL -: startL
  //       ptL = startR +: (size *: dirL)
  //       ptR = startR +: (size *: dirR)
  //       ptLR = startR +: (size *: dirL) +: (size *: dirR)
  //   in (ptL, ptLR, ptR)
  const dirR = ops.vnormalize(ops.vsub(endR, startR));
  const dirL = ops.vnormalize(ops.vsub(endL, startL));
  const ptL = ops.vmove(startR, len, dirL); // ops.vadd(startR, ops.vmul(len, dirL));
  const ptR = ops.vmove(startR, len, dirR); // ops.vadd(startR, ops.vmul(len, dirR));
  const ptLR = ops.vadd(ptL, ops.vmul(len, dirR));
  return [ptL, ptLR, ptR];
};

const tickPlacement = (
  padding: ad.Num,
  numPts: number,
  multiplier: ad.Num = 1
): ad.Num[] => {
  if (numPts <= 0) throw Error(`number of ticks must be greater than 0`);
  const even = numPts % 2 === 0;
  const pts: ad.Num[] = even ? [div(padding, 2)] : [0];
  for (let i = 1; i < numPts; i++) {
    if (even && i === 1) multiplier = neg(multiplier);
    const shift =
      i % 2 === 0
        ? mul(padding, mul(neg(i), multiplier))
        : mul(padding, mul(i, multiplier));
    pts.push(add(pts[i - 1], shift));
  }
  return pts;
};
