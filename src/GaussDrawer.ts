import { Vector2 } from "./Vector2";
import { convertImage } from "./PixelsToSvg";

const chroma = require("chroma-js");

type ColorMapType = string[] | null;

class GaussDrawer {
  private points: Vector2[];
  private weights: number[];
  private width: number;
  private height: number;
  private sigma: number;
  private interval: number;
  private colormap: string[];
  private opacity: number;
  private normalized: boolean;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  /**
   * The constructor of the class Graph.
   *
   * @param {Vector2[]} points The centres of the gaussians.
   * @param {number[]} weights The weights / amplitudes for each gaussian.
   */
  constructor(
    points: Vector2[],
    weights: number[],
    width: number,
    height: number,
    sigma: number = 0.3,
    interval: number = 0,
    colormap: ColorMapType = null,
    opacity: number = 1.0,
    normalized: boolean = false
  ) {
    this.points = points;
    this.weights = weights;
    this.width = width;
    this.height = height;
    this.sigma = sigma;
    this.interval = interval;
    this.opacity = opacity;
    this.normalized = normalized;

    if (colormap === null) {
      const piyg11: string[] = [
        "#c51b7d",
        "#de77ae",
        "#f1b6da",
        "#fde0ef",
        "#ffffff",
        "#e6f5d0",
        "#b8e186",
        "#7fbc41",
        "#4d9221",
      ];
      colormap = piyg11;
    }
    this.colormap = colormap;

    this.canvas = document.createElement("canvas");
    const ctx = this.canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get 2D context");
    }
    this.context = ctx;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  public setFromArray(
    arr_points: [number, number][],
    arr_weights: number[]
  ): void {
    this.points = [];
    arr_points.forEach((a) => {
      this.points.push({ x: a[0], y: a[1] });
    });

    this.weights = [];
    arr_weights.forEach((w) => {
      this.weights.push(w);
    });
  }

  /**
   * Compute and draw the gaussians.
   */
  public draw(): void {
    const m: number[][] = Array(this.width)
      .fill(0)
      .map(() => Array(this.height).fill(0));

    // It looks like in some common js engines, multiplication by a
    // fraction is faster than division ...
    const divisor: number = 1.0 / (2 * this.sigma ** 2);

    for (let i = 0; i < this.points.length; i++) {
      const v = this.points[i];
      const a = this.weights[i];

      for (let x = 0; x < this.width; x++) {
        for (let y = 0; y < this.height; y++) {
          // let v_x = (x - v.x) ** 2 / (2 * this.sigma ** 2);
          // let v_y = (y - v.y) ** 2 / (2 * this.sigma ** 2);
          const v_xy = ((x - v.x) ** 2 + (y - v.y) ** 2) * divisor;
          const val = a * Math.exp(-v_xy);

          m[x][y] += val;
        }
      }
    }

    let abs_max = 1.0;

    if (!this.normalized) {
      let max = -Number.MAX_SAFE_INTEGER;
      let min = Number.MAX_SAFE_INTEGER;

      for (let x = 0; x < this.width; x++) {
        for (let y = 0; y < this.height; y++) {
          if (m[x][y] < min) {
            min = m[x][y];
          }

          if (m[x][y] > max) {
            max = m[x][y];
          }
        }
      }

      abs_max = Math.max(Math.abs(min), Math.abs(max));
    }

    const scale = chroma.scale(this.colormap).domain([-1.0, 1.0]);

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (!this.normalized) {
          m[x][y] = m[x][y] / abs_max;
        }

        if (this.interval !== 0) {
          m[x][y] = Math.round(m[x][y] / this.interval) * this.interval;
        }

        const [r, g, b] = scale(m[x][y]).rgb();
        this.setPixel({ x, y }, r, g, b);
      }
    }
  }

  /**
   * Get the canvas as an HTML image.
   *
   * @param {(image: HTMLImageElement) => void} callback
   */
  public getImage(callback?: (image: HTMLImageElement) => void): void {
    const image = new Image();
    image.onload = () => {
      this.context.imageSmoothingEnabled = false;
      this.context.drawImage(image, 0, 0, this.width, this.height);

      if (callback) {
        callback(image);
      }
    };

    image.onerror = function (err: ErrorEvent) {
      console.log(err);
    };

    image.src = this.canvas.toDataURL();
  }

  /**
   * Get the canvas as an SVG element.
   *
   * @returns {string} The SVG representation of the canvas
   */
  public getSVG(): string {
    return convertImage(
      this.context.getImageData(0, 0, this.width, this.height)
    );
  }

  /**
   * Set the colour at a specific point on the canvas.
   *
   * @param {Vector2} vec The pixel position on the canvas.
   * @param {number} r The red colour-component.
   * @param {number} g The green colour-component.
   * @param {number} b The blue colour-component.
   */
  private setPixel(vec: Vector2, r: number, g: number, b: number): void {
    this.context.fillStyle =
      "rgba(" + r + "," + g + "," + b + "," + this.opacity + ")";
    this.context.fillRect(vec.x, vec.y, 1, 1);
  }
}
