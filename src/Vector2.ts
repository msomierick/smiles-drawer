/**
 * A class representing a 2D vector.
 *
 * @property {Number} x The x component of the vector.
 * @property {Number} y The y component of the vector.
 *
 */
export class Vector2 {
  x: number;
  y: number;

  /**
   * The constructor of the class Vector2.
   *
   * @param x The initial x coordinate value or, if the single argument, a Vector2 object
   * @param y The initial y coordinate value
   */
  constructor(x?: number | Vector2, y?: number) {
    if (arguments.length === 0) {
      this.x = 0;
      this.y = 0;
    } else if (arguments.length === 1 && x instanceof Vector2) {
      this.x = x.x;
      this.y = x.y;
    } else {
      this.x = x as number;
      this.y = y as number;
    }
  }

  /**
   * Clones this vector and returns the clone.
   */
  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  /**
   * Returns a string representation of this vector.
   */
  toString(): string {
    return `(${this.x},${this.y})`;
  }

  /**
   * Add the x and y coordinate values of a vector to the x and y coordinate values of this vector.
   */
  add(vec: Vector2): Vector2 {
    this.x += vec.x;
    this.y += vec.y;
    return this;
  }

  /**
   * Subtract the x and y coordinate values of a vector from the x and y coordinate values of this vector.
   */
  subtract(vec: Vector2): Vector2 {
    this.x -= vec.x;
    this.y -= vec.y;
    return this;
  }

  /**
   * Divide the x and y coordinate values of this vector by a scalar.
   */
  divide(scalar: number): Vector2 {
    this.x /= scalar;
    this.y /= scalar;
    return this;
  }

  /**
   * Multiply the x and y coordinate values of this vector by the values of another vector.
   */
  multiply(v: Vector2): Vector2 {
    this.x *= v.x;
    this.y *= v.y;
    return this;
  }

  /**
   * Multiply the x and y coordinate values of this vector by a scalar.
   */
  multiplyScalar(scalar: number): Vector2 {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  /**
   * Inverts this vector. Same as multiply(-1.0).
   */
  invert(): Vector2 {
    this.x = -this.x;
    this.y = -this.y;
    return this;
  }

  /**
   * Returns the angle of this vector in relation to the coordinate system.
   */
  angle(): number {
    return Math.atan2(this.y, this.x);
  }

  /**
   * Returns the euclidean distance between this vector and another vector.
   */
  distance(vec: Vector2): number {
    return Math.sqrt(
      (vec.x - this.x) * (vec.x - this.x) + (vec.y - this.y) * (vec.y - this.y)
    );
  }

  /**
   * Returns the squared euclidean distance between this vector and another vector.
   */
  distanceSq(vec: Vector2): number {
    return (
      (vec.x - this.x) * (vec.x - this.x) + (vec.y - this.y) * (vec.y - this.y)
    );
  }

  /**
   * Checks whether or not this vector is in a clockwise or counter-clockwise rotation
   */
  clockwise(vec: Vector2): -1 | 0 | 1 {
    const a = this.y * vec.x;
    const b = this.x * vec.y;

    if (a > b) return -1;
    if (a === b) return 0;
    return 1;
  }

  /**
   * Checks whether or not this vector is in a clockwise or counter-clockwise rotation
   * compared to another vector in relation to an arbitrary third vector.
   */
  relativeClockwise(center: Vector2, vec: Vector2): -1 | 0 | 1 {
    const a = (this.y - center.y) * (vec.x - center.x);
    const b = (this.x - center.x) * (vec.y - center.y);

    if (a > b) return -1;
    if (a === b) return 0;
    return 1;
  }

  /**
   * Rotates this vector by a given number of radians around the origin.
   */
  rotate(angle: number): Vector2 {
    const tmp = new Vector2(0, 0);
    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);

    tmp.x = this.x * cosAngle - this.y * sinAngle;
    tmp.y = this.x * sinAngle + this.y * cosAngle;

    this.x = tmp.x;
    this.y = tmp.y;

    return this;
  }

  /**
   * Rotates this vector around another vector.
   */
  rotateAround(angle: number, vec: Vector2): Vector2 {
    const s = Math.sin(angle);
    const c = Math.cos(angle);

    this.x -= vec.x;
    this.y -= vec.y;

    const x = this.x * c - this.y * s;
    const y = this.x * s + this.y * c;

    this.x = x + vec.x;
    this.y = y + vec.y;

    return this;
  }

  /**
   * Rotate a vector around a given center to the same angle as another vector.
   */
  rotateTo(vec: Vector2, center: Vector2, offsetAngle: number = 0.0): Vector2 {
    this.x += 0.001;
    this.y -= 0.001;

    const a = Vector2.subtract(this, center);
    const b = Vector2.subtract(vec, center);
    const angle = Vector2.angle(b, a);

    this.rotateAround(angle + offsetAngle, center);

    return this;
  }

  /**
   * Rotates the vector away from a specified vector around a center.
   */
  rotateAwayFrom(vec: Vector2, center: Vector2, angle: number): void {
    this.rotateAround(angle, center);

    const distSqA = this.distanceSq(vec);

    this.rotateAround(-2.0 * angle, center);

    const distSqB = this.distanceSq(vec);

    if (distSqB < distSqA) {
      this.rotateAround(2.0 * angle, center);
    }
  }

  /**
   * Returns the angle in radians used to rotate this vector away from a given vector.
   */
  getRotateAwayFromAngle(vec: Vector2, center: Vector2, angle: number): number {
    const tmp = this.clone();

    tmp.rotateAround(angle, center);
    const distSqA = tmp.distanceSq(vec);

    tmp.rotateAround(-2.0 * angle, center);
    const distSqB = tmp.distanceSq(vec);

    return distSqB < distSqA ? angle : -angle;
  }

  /**
   * Returns the angle in radians used to rotate this vector towards a given vector.
   */
  getRotateTowardsAngle(vec: Vector2, center: Vector2, angle: number): number {
    const tmp = this.clone();

    tmp.rotateAround(angle, center);
    const distSqA = tmp.distanceSq(vec);

    tmp.rotateAround(-2.0 * angle, center);
    const distSqB = tmp.distanceSq(vec);

    return distSqB > distSqA ? angle : -angle;
  }

  /**
   * Gets the angles between this vector and another vector around a common center of rotation.
   */
  getRotateToAngle(vec: Vector2, center: Vector2): number {
    const a = Vector2.subtract(this, center);
    const b = Vector2.subtract(vec, center);
    const angle = Vector2.angle(b, a);

    return Number.isNaN(angle) ? 0.0 : angle;
  }

  /**
   * Checks whether a vector lies within a polygon spanned by a set of vectors.
   */
  isInPolygon(polygon: Vector2[]): boolean {
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      if (
        polygon[i].y > this.y !== polygon[j].y > this.y &&
        this.x <
          ((polygon[j].x - polygon[i].x) * (this.y - polygon[i].y)) /
            (polygon[j].y - polygon[i].y) +
            polygon[i].x
      ) {
        inside = !inside;
      }
    }

    return inside;
  }

  /**
   * Returns the length of this vector.
   */
  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Returns the square of the length of this vector.
   */
  lengthSq(): number {
    return this.x * this.x + this.y * this.y;
  }

  /**
   * Normalizes this vector.
   */
  normalize(): Vector2 {
    this.divide(this.length());
    return this;
  }

  /**
   * Returns a normalized copy of this vector.
   */
  normalized(): Vector2 {
    return Vector2.divideScalar(this, this.length());
  }

  /**
   * Calculates which side of a line spanned by two vectors this vector is.
   */
  whichSide(vecA: Vector2, vecB: Vector2): number {
    return (
      (this.x - vecA.x) * (vecB.y - vecA.y) -
      (this.y - vecA.y) * (vecB.x - vecA.x)
    );
  }

  /**
   * Checks whether or not this vector is on the same side of a line as another vector.
   */
  sameSideAs(vecA: Vector2, vecB: Vector2, vecC: Vector2): boolean {
    const d = this.whichSide(vecA, vecB);
    const dRef = vecC.whichSide(vecA, vecB);

    return (
      (d < 0 && dRef < 0) || (d === 0 && dRef === 0) || (d > 0 && dRef > 0)
    );
  }

  // Static Methods

  /**
   * Adds two vectors and returns the result as a new vector.
   */
  static add(vecA: Vector2, vecB: Vector2): Vector2 {
    return new Vector2(vecA.x + vecB.x, vecA.y + vecB.y);
  }

  /**
   * Subtracts one vector from another and returns the result as a new vector.
   */
  static subtract(vecA: Vector2, vecB: Vector2): Vector2 {
    return new Vector2(vecA.x - vecB.x, vecA.y - vecB.y);
  }

  /**
   * Multiplies two vectors (value by value) and returns the result.
   */
  static multiply(vecA: Vector2, vecB: Vector2): Vector2 {
    return new Vector2(vecA.x * vecB.x, vecA.y * vecB.y);
  }

  /**
   * Multiplies a vector by a scalar and returns the result.
   */
  static multiplyScalar(vec: Vector2, scalar: number): Vector2 {
    return new Vector2(vec.x, vec.y).multiplyScalar(scalar);
  }

  /**
   * Returns the midpoint of a line spanned by two vectors.
   */
  static midpoint(vecA: Vector2, vecB: Vector2): Vector2 {
    return new Vector2((vecA.x + vecB.x) / 2, (vecA.y + vecB.y) / 2);
  }

  /**
   * Returns the normals of a line spanned by two vectors.
   */
  static normals(vecA: Vector2, vecB: Vector2): [Vector2, Vector2] {
    const delta = Vector2.subtract(vecB, vecA);

    return [new Vector2(-delta.y, delta.x), new Vector2(delta.y, -delta.x)];
  }

  /**
   * Returns the unit vectors of a line spanned by two vectors.
   */
  static units(vecA: Vector2, vecB: Vector2): [Vector2, Vector2] {
    const delta = Vector2.subtract(vecB, vecA);

    return [
      new Vector2(-delta.y, delta.x).normalize(),
      new Vector2(delta.y, -delta.x).normalize(),
    ];
  }

  /**
   * Divides a vector by another vector and returns the result as new vector.
   */
  static divide(vecA: Vector2, vecB: Vector2): Vector2 {
    return new Vector2(vecA.x / vecB.x, vecA.y / vecB.y);
  }

  /**
   * Divides a vector by a scalar and returns the result as new vector.
   */
  static divideScalar(vecA: Vector2, s: number): Vector2 {
    return new Vector2(vecA.x / s, vecA.y / s);
  }

  /**
   * Returns the dot product of two vectors.
   */
  static dot(vecA: Vector2, vecB: Vector2): number {
    return vecA.x * vecB.x + vecA.y * vecB.y;
  }

  /**
   * Returns the angle between two vectors.
   */
  static angle(vecA: Vector2, vecB: Vector2): number {
    const dot = Vector2.dot(vecA, vecB);
    return Math.acos(dot / (vecA.length() * vecB.length()));
  }

  /**
   * Returns the angle between two vectors based on a third vector in between.
   */
  static threePointAngle(vecA: Vector2, vecB: Vector2, vecC: Vector2): number {
    const ab = Vector2.subtract(vecB, vecA);
    const bc = Vector2.subtract(vecC, vecB);
    const abLength = vecA.distance(vecB);
    const bcLength = vecB.distance(vecC);

    return Math.acos(Vector2.dot(ab, bc) / (abLength * bcLength));
  }

  /**
   * Returns the scalar projection of a vector on another vector.
   */
  static scalarProjection(vecA: Vector2, vecB: Vector2): number {
    const unit = vecB.normalized();
    return Vector2.dot(vecA, unit);
  }

  /**
   * Returns the average vector (normalized) of the input vectors.
   */
  static averageDirection(vecs: Vector2[]): Vector2 {
    const avg = new Vector2(0.0, 0.0);

    for (const vec of vecs) {
      avg.add(vec);
    }

    return avg.normalize();
  }
}
