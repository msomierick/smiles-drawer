// Adapted from https://codepen.io/shshaw/pen/XbxvNj by

export function convertImage(img: {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}): SVGElement | null {
  /**
   * Iterates over an array or object and applies a function to each item.
   * Stops iteration if the function returns `false`.
   *
   * @param obj - The array or object to iterate over.
   * @param fn - The function to apply to each item.
   */
  function each(
    obj: any[] | { [key: string]: any },
    fn: (key: string | number, value: any) => boolean | void
  ): void {
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        if (fn.call(obj[i], i, obj[i]) === false) {
          break;
        }
      }
    } else {
      for (const key in obj) {
        if (fn.call(obj[key], key, obj[key]) === false) {
          break;
        }
      }
    }
  }

  /**
   * Converts a color component to a two-character hexadecimal string.
   *
   * @param c - The color component value.
   * @returns A two-character hexadecimal string.
   */
  function componentToHex(c: string): string {
    const hex = parseInt(c).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }

  /**
   * Converts RGBA components to a color string.
   *
   * @param r - Red component.
   * @param g - Green component.
   * @param b - Blue component.
   * @param a - Alpha component.
   * @returns A color string in hex or rgba format, or `false` if transparent.
   */
  function getColor(
    r: string,
    g: string,
    b: string,
    a: string
  ): string | false {
    const alpha = parseInt(a);
    if (alpha === undefined || alpha === 255) {
      return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }
    if (alpha === 0) {
      return false;
    }
    return `rgba(${r},${g},${b},${alpha / 255})`;
  }

  /**
   * Generates an SVG path data string for a horizontal line.
   *
   * @param x - The starting x-coordinate.
   * @param y - The y-coordinate.
   * @param w - The width of the line.
   * @returns An SVG path data string.
   */
  function makePathData(x: number, y: number, w: number): string {
    return `M${x} ${y}h${w}`;
  }

  /**
   * Generates an SVG path element string for a given color and path data.
   *
   * @param color - The stroke color of the path.
   * @param data - The path data.
   * @returns An SVG path element string.
   */
  function makePath(color: string, data: string): string {
    return `<path stroke="${color}" d="${data}" />\n`;
  }

  /**
   * Converts a map of colors and pixel positions to SVG path elements.
   *
   * @param colors - A map of color strings to arrays of pixel positions.
   * @returns A string containing SVG path elements.
   */
  function colorsToPaths(colors: {
    [key: string]: [number, number][];
  }): string {
    let output = "";

    each(colors, function (color, values) {
      const orig = color;
      const colorValue = getColor(
        ...(color.toString().split(",") as [string, string, string, string])
      );

      if (colorValue === false) {
        return;
      }

      const paths: string[] = [];
      let curPath: [number, number] | undefined;
      let w = 1;

      each(values, function () {
        if (curPath && this[1] === curPath[1] && this[0] === curPath[0] + w) {
          w++;
        } else {
          if (curPath) {
            paths.push(makePathData(curPath[0], curPath[1], w));
            w = 1;
          }
          curPath = this as [number, number];
        }
      });

      if (curPath) {
        paths.push(makePathData(curPath[0], curPath[1], w)); // Finish the last path
      }
      output += makePath(colorValue, paths.join(""));
    });

    return output;
  }

  /**
   * Extracts colors and their corresponding pixel positions from image data.
   *
   * @param img - The image data.
   * @returns A map of color strings to arrays of pixel positions.
   */
  function getColors(img: {
    data: Uint8ClampedArray;
    width: number;
    height: number;
  }): { [key: string]: [number, number][] } {
    const colors: { [key: string]: [number, number][] } = {};
    const { data, width } = img;
    const len = data.length;

    for (let i = 0; i < len; i += 4) {
      if (data[i + 3] > 0) {
        const color = `${data[i]},${data[i + 1]},${data[i + 2]},${data[i + 3]}`;
        if (!colors[color]) {
          colors[color] = [];
        }
        const x = (i / 4) % width;
        const y = Math.floor(i / 4 / width);
        colors[color].push([x, y]);
      }
    }

    return colors;
  }

  const colors = getColors(img);
  const paths = colorsToPaths(colors);
  const output = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -0.5 ${img.width} ${img.height}" shape-rendering="crispEdges"><g shape-rendering="crispEdges">${paths}</g></svg>`;

  const dummyDiv = document.createElement("div");
  dummyDiv.innerHTML = output;

  return dummyDiv.firstChild as SVGElement | null;
}
