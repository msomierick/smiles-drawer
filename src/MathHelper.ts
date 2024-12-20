/**
 * A static class containing helper functions for math-related tasks.
 */
export class MathHelper {
  /** The factor to convert degrees to radians. */
  private static get radFactor(): number {
    return Math.PI / 180.0;
  }

  /** The factor to convert radians to degrees. */
  private static get degFactor(): number {
    return 180.0 / Math.PI;
  }

  /** Two times PI. */
  private static get twoPI(): number {
    return 2.0 * Math.PI;
  }

  /**
   * Rounds a value to a given number of decimals.
   *
   * @static
   * @param {number} value A number.
   * @param {number} decimals The number of decimals.
   * @returns {number} A number rounded to a given number of decimals.
   */
  public static round(value: number, decimals?: number): number {
    decimals = decimals ?? 1;
    return Number(Math.round(Number(value + "e" + decimals)) + "e-" + decimals);
  }

  /**
   * Returns the means of the angles contained in an array. In radians.
   *
   * @static
   * @param {number[]} arr An array containing angles (in radians).
   * @returns {number} The mean angle in radians.
   */
  public static meanAngle(arr: number[]): number {
    let sin: number = 0.0;
    let cos: number = 0.0;

    for (let i = 0; i < arr.length; i++) {
      sin += Math.sin(arr[i]);
      cos += Math.cos(arr[i]);
    }

    return Math.atan2(sin / arr.length, cos / arr.length);
  }

  /**
   * Returns the inner angle of a n-sided regular polygon.
   *
   * @static
   * @param {number} n Number of sides of a regular polygon.
   * @returns {number} The inner angle of a given regular polygon.
   */
  public static innerAngle(n: number): number {
    return MathHelper.toRad(((n - 2) * 180) / n);
  }

  /**
   * Returns the circumradius of a n-sided regular polygon with a given side-length.
   *
   * @static
   * @param {number} s The side length of the regular polygon.
   * @param {number} n The number of sides.
   * @returns {number} The circumradius of the regular polygon.
   */
  public static polyCircumradius(s: number, n: number): number {
    return s / (2 * Math.sin(Math.PI / n));
  }

  /**
   * Returns the apothem of a regular n-sided polygon based on its radius.
   *
   * @static
   * @param {number} r The radius.
   * @param {number} n The number of edges of the regular polygon.
   * @returns {number} The apothem of a n-sided polygon based on its radius.
   */
  public static apothem(r: number, n: number): number {
    return r * Math.cos(Math.PI / n);
  }

  /**
   * Returns the apothem from the side length of a regular polygon.
   *
   * @static
   * @param {number} s The side length.
   * @param {number} n The number of sides.
   * @returns {number} The apothem calculated from the side length.
   */
  public static apothemFromSideLength(s: number, n: number): number {
    const r: number = MathHelper.polyCircumradius(s, n);
    return MathHelper.apothem(r, n);
  }

  /**
   * The central angle of a n-sided regular polygon. In radians.
   *
   * @static
   * @param {number} n The number of sides of the regular polygon.
   * @returns {number} The central angle of the n-sided polygon in radians.
   */
  public static centralAngle(n: number): number {
    return MathHelper.toRad(360 / n);
  }

  /**
   * Converts radians to degrees.
   *
   * @static
   * @param {number} rad An angle in radians.
   * @returns {number} The angle in degrees.
   */
  public static toDeg(rad: number): number {
    return rad * MathHelper.degFactor;
  }

  /**
   * Converts degrees to radians.
   *
   * @static
   * @param {number} deg An angle in degrees.
   * @returns {number} The angle in radians.
   */
  public static toRad(deg: number): number {
    return deg * MathHelper.radFactor;
  }

  /**
   * Returns the parity of the permutation (1 or -1)
   * @param {(Array<number>|Uint8Array)} arr An array containing the permutation.
   * @returns {number} The parity of the permutation (1 or -1), where 1 means even and -1 means odd.
   */
  public static parityOfPermutation(arr: Array<number> | Uint8Array): number {
    const visited = new Uint8Array(arr.length);
    let evenLengthCycleCount = 0;

    const traverseCycle = function (
      i: number,
      cycleLength: number = 0
    ): number {
      if (visited[i] === 1) {
        return cycleLength;
      }

      cycleLength++;
      visited[i] = 1;
      return traverseCycle(arr[i], cycleLength);
    };

    for (let i = 0; i < arr.length; i++) {
      if (visited[i] === 1) {
        continue;
      }

      const cycleLength = traverseCycle(i);
      evenLengthCycleCount += 1 - (cycleLength % 2);
    }

    return evenLengthCycleCount % 2 ? -1 : 1;
  }
}
