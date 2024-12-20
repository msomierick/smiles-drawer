import * as Parser from "./Parser";

export class Reaction {
  private reactantsSmiles: string[];
  private reagentsSmiles: string[];
  private productsSmiles: string[];

  private reactantsWeights: number[];
  private reagentsWeights: number[];
  private productsWeights: number[];

  private reactants: any[]; // Check what Parser.parse returns
  private reagents: any[];
  private products: any[];

  /**
   * The constructor for the class Reaction.
   *
   * @param {string} reactionSmiles A reaction SMILES.
   */
  constructor(reactionSmiles: string) {
    this.reactantsSmiles = [];
    this.reagentsSmiles = [];
    this.productsSmiles = [];

    this.reactantsWeights = [];
    this.reagentsWeights = [];
    this.productsWeights = [];

    this.reactants = [];
    this.reagents = [];
    this.products = [];

    const parts: string[] = reactionSmiles.split(">");

    if (parts.length !== 3) {
      throw new Error(
        "Invalid reaction SMILES. Did you add fewer than or more than two '>'?"
      );
    }

    if (parts[0] !== "") {
      this.reactantsSmiles = parts[0].split(".");
    }

    if (parts[1] !== "") {
      this.reagentsSmiles = parts[1].split(".");
    }

    if (parts[2] !== "") {
      this.productsSmiles = parts[2].split(".");
    }

    for (let i = 0; i < this.reactantsSmiles.length; i++) {
      this.reactants.push(Parser.parse(this.reactantsSmiles[i]));
    }

    for (let i = 0; i < this.reagentsSmiles.length; i++) {
      this.reagents.push(Parser.parse(this.reagentsSmiles[i]));
    }

    for (let i = 0; i < this.productsSmiles.length; i++) {
      this.products.push(Parser.parse(this.productsSmiles[i]));
    }
  }
}
