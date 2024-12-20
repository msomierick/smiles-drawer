import {Drawer} from "./Drawer";
import * as Parser from "./Parser";
import {ReactionParser} from "./ReactionParser";
import {SvgDrawer} from "./SvgDrawer";
import {ReactionDrawer} from "./ReactionDrawer";
// import {SmiDrawer} from "./src/SmilesDrawer";
import {GaussDrawer} from "./GaussDrawer";

const canUseDOM =
  typeof window !== "undefined" &&
  window.document &&
  window.document.createElement;

export const SmilesDrawer = {
  Version: "1.0.0",
  Drawer,
  Parser,
  SvgDrawer,
  ReactionDrawer,
  ReactionParser,
  GaussDrawer,

  clean(smiles) {
    return smiles.replace(/[^A-Za-z0-9@.+-?!()[\]{}\/\\=#$:*]/g, "");
  },

  apply(
    options,
    selector = "canvas[data-smiles]",
    themeName = "light",
    onError = null
  ) {
    const smilesDrawer = new Drawer(options);
    const elements = document.querySelectorAll(selector);

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      this.parse(
        element.getAttribute("data-smiles"),
        (tree) => {
          smilesDrawer.draw(tree, element, themeName, false);
        },
        (err) => {
          if (onError) {
            onError(err);
          }
        }
      );
    }
  },

  parse(smiles, successCallback, errorCallback) {
    try {
      if (successCallback) {
        successCallback(Parser.parse(smiles));
      }
    } catch (err) {
      if (errorCallback) {
        errorCallback(err);
      }
    }
  },

  parseReaction(reactionSmiles, successCallback, errorCallback) {
    try {
      if (successCallback) {
        successCallback(ReactionParser.parse(reactionSmiles));
      }
    } catch (err) {
      if (errorCallback) {
        errorCallback(err);
      }
    }
  },
};

if (canUseDOM) {
  window.SmilesDrawer = SmilesDrawer;
}


if (!Array.prototype.fill) {
  Object.defineProperty(Array.prototype, "fill", {
    value: function (value) {
      if (this == null) {
        throw new TypeError("this is null or not defined");
      }

      const O = Object(this);
      const len = O.length >>> 0;
      const start = arguments[1];
      const relativeStart = start >> 0;
      const k =
        relativeStart < 0
          ? Math.max(len + relativeStart, 0)
          : Math.min(relativeStart, len);

      const end = arguments[2];
      const relativeEnd = end === undefined ? len : end >> 0;

      const final =
        relativeEnd < 0
          ? Math.max(len + relativeEnd, 0)
          : Math.min(relativeEnd, len);

      while (k < final) {
        O[k] = value;
        k++;
      }

      return O;
    },
  });
}

const input = document.getElementById("input");
const debugCheckbox = document.getElementById("debug");
const bondThicknessInput = document.getElementById("bondThickness");
const textSizeInput = document.getElementById("textSize");
const bondLengthInput = document.getElementById("bondLength");
const shortBondLengthInput = document.getElementById("shortBondLength");
const bondSpacingInput = document.getElementById("bondSpacing");
const sizeInput = document.getElementById("size");
const overlapInput = document.getElementById("overlap");

const options = {
  debug: false,
  atomVisualization: "default",
};

const smilesDrawer = new SmilesDrawer.Drawer(options);
const log = document.getElementById("log");

function draw() {
  const t = performance.now();
  SmilesDrawer.parse(
    input.value,
    (tree) => {
      smilesDrawer.draw(tree, "output-canvas", "dark", false);
      const td = performance.now() - t;
      log.innerHTML = "&nbsp;";
      log.style.visibility = "hidden";

      new Noty({
        text: `Drawing took ${td.toFixed(
          3
        )}ms with a total overlap score of ${smilesDrawer
          .getTotalOverlapScore()
          .toFixed(3)}.`,
        killer: true,
        timeout: 2000,
        animation: {
          open: null,
          close: null,
        },
      }).show();

      console.log(smilesDrawer.getMolecularFormula());
    },
    (err) => {
      log.innerHTML = err;
      log.style.visibility = "visible";
      console.log(err);
    }
  );
}

function updateOptions() {
  const updatedDrawer = new SmilesDrawer.Drawer(options);
  draw();
}

document.addEventListener("DOMContentLoaded", () => {
  input.addEventListener("input", draw);

  debugCheckbox.addEventListener("click", () => {
    options.debug = debugCheckbox.checked;
    updateOptions();
  });

  textSizeInput.addEventListener("input", () => {
    options.fontSizeLarge = parseInt(textSizeInput.value);
    options.fontSizeSmall = (3 / 5) * options.fontSizeLarge;
    updateOptions();
  });

  bondThicknessInput.addEventListener("input", () => {
    options.bondThickness = parseFloat(bondThicknessInput.value);
    updateOptions();
  });

  bondLengthInput.addEventListener("input", () => {
    options.bondLength = parseInt(bondLengthInput.value);
    updateOptions();
  });

  shortBondLengthInput.addEventListener("input", () => {
    options.shortBondLength = parseInt(shortBondLengthInput.value) / 100;
    updateOptions();
  });

  bondSpacingInput.addEventListener("input", () => {
    options.bondSpacing = parseInt(bondSpacingInput.value);
    updateOptions();
  });

  sizeInput.addEventListener("input", () => {
    options.width = parseInt(sizeInput.value);
    options.height = parseInt(sizeInput.value);
    updateOptions();
  });

  overlapInput.addEventListener("input", () => {
    options.overlapResolutionIterations = parseInt(overlapInput.value);
    updateOptions();
  });
});