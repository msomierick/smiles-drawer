interface ContainsOptions<T> {
  value: any;
  property?: keyof T;
  func?: (item: T) => boolean;
}

interface AtomicNumberItem {
  vertexId: number;
  atomicNumber: string;
}

/**
 * A static class containing helper functions for array-related tasks.
 */
export class ArrayHelper {
  /**
   * Clone an array or an object. If an object is passed, a shallow clone will be created.
   *
   * @static
   * @template T
   * @param {T} arr The array or object to be cloned.
   * @returns {T} A clone of the array or object.
   */
  static clone<T>(arr: T): T {
    const out: any = Array.isArray(arr) ? [] : {};

    for (const key in arr) {
      const value = arr[key];

      if (typeof value === "object" && value !== null) {
        if (typeof (value as any).clone === "function") {
          out[key] = (value as any).clone();
        } else {
          out[key] = ArrayHelper.clone(value);
        }
      } else {
        out[key] = value;
      }
    }

    return out;
  }

  /**
   * Returns a boolean indicating whether or not the two arrays contain the same elements.
   * Only supports 1d, non-nested arrays.
   *
   * @static
   * @template T
   * @param {T[]} arrA An array.
   * @param {T[]} arrB An array.
   * @returns {boolean} A boolean indicating whether or not the two arrays contain the same elements.
   */
  static equals<T>(arrA: T[], arrB: T[]): boolean {
    if (arrA.length !== arrB.length) {
      return false;
    }

    const tmpA = arrA.slice().sort();
    const tmpB = arrB.slice().sort();

    for (let i = 0; i < tmpA.length; i++) {
      if (tmpA[i] !== tmpB[i]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Returns a string representation of an array. If the array contains objects with an id property, the id property is printed for each of the elements.
   *
   * @static
   * @template T
   * @param {T[]} arr An array.
   * @returns {string} A string representation of the array.
   */
  static print<T extends { id?: any }>(arr: T[]): string {
    if (arr.length === 0) {
      return "";
    }

    let s = "(";

    for (let i = 0; i < arr.length; i++) {
      s += arr[i].id ? arr[i].id + ", " : arr[i] + ", ";
    }

    s = s.substring(0, s.length - 2);

    return s + ")";
  }

  /**
   * Run a function for each element in the array. The element is supplied as an argument for the callback function
   *
   * @static
   * @template T
   * @param {T[]} arr An array.
   * @param {(item: T) => void} callback The callback function that is called for each element.
   */
  static each<T>(arr: T[], callback: (item: T) => void): void {
    for (let i = 0; i < arr.length; i++) {
      callback(arr[i]);
    }
  }

  /**
   * Return the array element from an array containing objects, where a property of the object is set to a given value.
   *
   * @static
   * @template T
   * @param {T[]} arr An array.
   * @param {keyof T} property A property contained within an object in the array.
   * @param {string | number} value The value of the property.
   * @returns {T | undefined} The array element matching the value.
   */
  static get<T>(
    arr: T[],
    property: keyof T,
    value: string | number
  ): T | undefined {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i][property] == value) {
        return arr[i];
      }
    }
    return undefined;
  }

  /**
   * Checks whether or not an array contains a given value.
   *
   * @static
   * @template T
   * @param {T[]} arr An array.
   * @param {ContainsOptions<T>} options The options for the contains check.
   * @returns {boolean} A boolean whether or not the array contains a value.
   */
  static contains<T>(arr: T[], options: ContainsOptions<T>): boolean {
    if (!options.property && !options.func) {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] == options.value) {
          return true;
        }
      }
    } else if (options.func) {
      for (let i = 0; i < arr.length; i++) {
        if (options.func(arr[i])) {
          return true;
        }
      }
    } else if (options.property) {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i][options.property] == options.value) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Returns an array containing the intersection between two arrays.
   *
   * @static
   * @template T
   * @param {T[]} arrA An array.
   * @param {T[]} arrB An array.
   * @returns {T[]} The intersecting values.
   */
  static intersection<T>(arrA: T[], arrB: T[]): T[] {
    const intersection: T[] = [];

    for (let i = 0; i < arrA.length; i++) {
      for (let j = 0; j < arrB.length; j++) {
        if (arrA[i] === arrB[j]) {
          intersection.push(arrA[i]);
        }
      }
    }

    return intersection;
  }

  /**
   * Returns an array of unique elements contained in an array.
   *
   * @static
   * @template T
   * @param {T[]} arr An array.
   * @returns {T[]} An array of unique elements.
   */
  static unique<T extends string | number>(arr: T[]): T[] {
    const contains: { [key: string]: boolean } = {};
    return arr.filter((i) => {
      return contains[i as string] !== undefined
        ? false
        : (contains[i as string] = true);
    });
  }

  /**
   * Count the number of occurrences of a value in an array.
   *
   * @static
   * @template T
   * @param {T[]} arr An array.
   * @param {T} value A value to be counted.
   * @returns {number} The number of occurrences of a value in the array.
   */
  static count<T>(arr: T[], value: T): number {
    let count = 0;

    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === value) {
        count++;
      }
    }

    return count;
  }

  /**
   * Toggles the value of an array.
   *
   * @static
   * @template T
   * @param {T[]} arr An array.
   * @param {T} value A value to be toggled.
   * @returns {T[]} The toggled array.
   */
  static toggle<T>(arr: T[], value: T): T[] {
    const newArr: T[] = [];

    let removed = false;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] !== value) {
        newArr.push(arr[i]);
      } else {
        removed = true;
      }
    }

    if (!removed) {
      newArr.push(value);
    }

    return newArr;
  }

  /**
   * Remove a value from an array.
   *
   * @static
   * @template T
   * @param {T[]} arr An array.
   * @param {T} value A value to be removed.
   * @returns {T[]} A new array with the element with a given value removed.
   */
  static remove<T>(arr: T[], value: T): T[] {
    const tmp: T[] = [];

    for (let i = 0; i < arr.length; i++) {
      if (arr[i] !== value) {
        tmp.push(arr[i]);
      }
    }

    return tmp;
  }

  /**
   * Remove a value from an array with unique values.
   *
   * @static
   * @template T
   * @param {T[]} arr An array.
   * @param {T} value A value to be removed.
   * @returns {T[]} An array with the element with a given value removed.
   */
  static removeUnique<T>(arr: T[], value: T): T[] {
    const index = arr.indexOf(value);

    if (index > -1) {
      arr.splice(index, 1);
    }

    return arr;
  }

  /**
   * Remove all elements contained in one array from another array.
   *
   * @static
   * @template T
   * @param {T[]} arrA The array to be filtered.
   * @param {T[]} arrB The array containing elements that will be removed from the other array.
   * @returns {T[]} The filtered array.
   */
  static removeAll<T>(arrA: T[], arrB: T[]): T[] {
    return arrA.filter((item) => arrB.indexOf(item) === -1);
  }

  /**
   * Merges two arrays and returns the result.
   *
   * @static
   * @template T
   * @param {T[]} arrA An array.
   * @param {T[]} arrB An array.
   * @returns {T[]} The merged array.
   */
  static merge<T>(arrA: T[], arrB: T[]): T[] {
    const arr: T[] = new Array(arrA.length + arrB.length);

    for (let i = 0; i < arrA.length; i++) {
      arr[i] = arrA[i];
    }

    for (let i = 0; i < arrB.length; i++) {
      arr[arrA.length + i] = arrB[i];
    }

    return arr;
  }

  /**
   * Checks whether or not an array contains all the elements of another array.
   *
   * @static
   * @template T
   * @param {T[]} arrA An array.
   * @param {T[]} arrB An array.
   * @returns {boolean} A boolean indicating whether or not both array contain the same elements.
   */
  static containsAll<T>(arrA: T[], arrB: T[]): boolean {
    let containing = 0;
    for (let i = 0; i < arrA.length; i++) {
      for (let j = 0; j < arrB.length; j++) {
        if (arrA[i] === arrB[j]) {
          containing++;
        }
      }
    }

    return containing === arrB.length;
  }

  /**
   * Sort an array of atomic number information.
   *
   * @static
   * @param {AtomicNumberItem[]} arr An array of vertex ids with their associated atomic numbers.
   * @returns {AtomicNumberItem[]} The array sorted by atomic number.
   */
  static sortByAtomicNumberDesc(arr: AtomicNumberItem[]): AtomicNumberItem[] {
    const map = arr.map((e, i) => ({
      index: i,
      value: e.atomicNumber.split(".").map(Number),
    }));

    map.sort((a, b) => {
      const min = Math.min(b.value.length, a.value.length);
      let i = 0;

      while (i < min && b.value[i] === a.value[i]) {
        i++;
      }

      return i === min
        ? b.value.length - a.value.length
        : b.value[i] - a.value[i];
    });

    return map.map((e) => arr[e.index]);
  }

  /**
   * Copies an n-dimensional array.
   *
   * @static
   * @template T
   * @param {T[]} arr The array to be copied.
   * @returns {T[]} The copy.
   */
  static deepCopy<T>(arr: T[]): T[] {
    const newArr: T[] = [];

    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];

      if (item instanceof Array) {
        newArr[i] = ArrayHelper.deepCopy(item);
      } else {
        newArr[i] = item;
      }
    }

    return newArr;
  }
}
