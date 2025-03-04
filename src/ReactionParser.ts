import { Reaction } from "./Reaction";

export class ReactionParser {
  /**
   * Returns the hex code of a color associated with a key from the current theme.
   *
   * @param {String} reactionSmiles A reaction SMILES.
   * @returns {Reaction} A reaction object.
   */
  static parse(reactionSmiles: string): Reaction {
    let reaction: Reaction = new Reaction(reactionSmiles);

    return reaction;
  }
}
