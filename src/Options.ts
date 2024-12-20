export class Options {
  /**
   * A helper method to extend the default options with user supplied ones.
   */
  static extend(...args: any[]): any {
    let extended = {} as Record<string, any>;
    let deep = false;
    let i = 0;
    let length = args.length;

    if (Object.prototype.toString.call(args[0]) === "[object Boolean]") {
      deep = args[0];
      i++;
    }

    let merge = function (obj: any) {
      for (var prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
          if (
            deep &&
            Object.prototype.toString.call(obj[prop]) === "[object Object]"
          ) {
            extended[prop] = Options.extend(true, extended[prop], obj[prop]);
          } else {
            extended[prop] = obj[prop];
          }
        }
      }
    };

    for (; i < length; i++) {
      let obj = args[i];
      merge(obj);
    }

    return extended;
  }
}