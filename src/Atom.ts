interface IBracket {
  hcount?: number;
  charge?: ("--" | "-" | "+" | "++")[];
  isotope?: number;
}

interface IPseudoElement {
  element: string;
  count: number;
  hydrogenCount: number;
  previousElement: string;
  charge: number;
}

interface IRingbond {
  id: number;
  bondType: string;
}

export class Atom {
  public idx: number | null;
  public element: string;
  public drawExplicit: boolean;
  public ringbonds: IRingbond[];
  public rings: number[];
  public bondType: string;
  public branchBond: string | null;
  public isBridge: boolean;
  public isBridgeNode: boolean;
  public originalRings: number[];
  public bridgedRing: number | null;
  public anchoredRings: number[];
  public bracket: IBracket | null;
  public plane: number;
  public attachedPseudoElements: { [key: string]: IPseudoElement };
  public hasAttachedPseudoElements: boolean;
  public isDrawn: boolean;
  public isConnectedToRing: boolean;
  public neighbouringElements: string[];
  public isPartOfAromaticRing: boolean;
  public bondCount: number;
  public chirality: string;
  public isStereoCenter: boolean;
  public priority: number;
  public mainChain: boolean;
  public hydrogenDirection: "up" | "down";
  public subtreeDepth: number;
  public hasHydrogen: boolean;
  public class?: number;

  /**
   * The constructor of the class Atom.
   *
   * @param {String} element The one-letter code of the element.
   * @param {String} [bondType='-'] The type of the bond associated with this atom.
   */
  constructor(element: string, bondType: string = "-") {
    this.idx = null;
    this.element = element.length === 1 ? element.toUpperCase() : element;
    this.drawExplicit = false;
    this.ringbonds = [];
    this.rings = [];
    this.bondType = bondType;
    this.branchBond = null;
    this.isBridge = false;
    this.isBridgeNode = false;
    this.originalRings = [];
    this.bridgedRing = null;
    this.anchoredRings = [];
    this.bracket = null;
    this.plane = 0;
    this.attachedPseudoElements = {};
    this.hasAttachedPseudoElements = false;
    this.isDrawn = true;
    this.isConnectedToRing = false;
    this.neighbouringElements = [];
    this.isPartOfAromaticRing = element !== this.element;
    this.bondCount = 0;
    this.chirality = "";
    this.isStereoCenter = false;
    this.priority = 0;
    this.mainChain = false;
    this.hydrogenDirection = "down";
    this.subtreeDepth = 1;
    this.hasHydrogen = false;
  }

  /**
   * Adds a neighbouring element to this atom.
   *
   * @param {String} element A string representing an element.
   */
  public addNeighbouringElement(element: string): void {
    this.neighbouringElements.push(element);
  }

  /**
   * Attaches a pseudo element (e.g. Ac) to the atom.
   * @param {String} element The element identifier (e.g. Br, C, ...).
   * @param {String} previousElement The element that is part of the main chain (not the terminals that are converted to the pseudo element or concatinated).
   * @param {Number} [hydrogenCount=0] The number of hydrogens for the element.
   * @param {Number} [charge=0] The charge for the element.
   */
  public attachPseudoElement(
    element: string,
    previousElement: string,
    hydrogenCount: number = 0,
    charge: number = 0
  ): void {
    if (hydrogenCount === null) {
      hydrogenCount = 0;
    }

    if (charge === null) {
      charge = 0;
    }

    const key = `${hydrogenCount}${element}${charge}`;

    if (this.attachedPseudoElements[key]) {
      this.attachedPseudoElements[key].count += 1;
    } else {
      this.attachedPseudoElements[key] = {
        element,
        count: 1,
        hydrogenCount,
        previousElement,
        charge,
      };
    }

    this.hasAttachedPseudoElements = true;
  }

  /**
   * Returns the attached pseudo elements sorted by hydrogen count (ascending).
   *
   * @returns {Object} The sorted attached pseudo elements.
   */
  public getAttachedPseudoElements(): { [key: string]: IPseudoElement } {
    const ordered: { [key: string]: IPseudoElement } = {};

    Object.keys(this.attachedPseudoElements)
      .sort()
      .forEach((key) => {
        ordered[key] = this.attachedPseudoElements[key];
      });

    return ordered;
  }

  /**
   * Returns the number of attached pseudo elements.
   *
   * @returns {Number} The number of attached pseudo elements.
   */
  public getAttachedPseudoElementsCount(): number {
    return Object.keys(this.attachedPseudoElements).length;
  }

  /**
   * Returns the number of attached pseudo elements.
   *
   * @returns {Number} The number of attached pseudo elements.
   */
  public isHeteroAtom(): boolean {
    return this.element !== "C" && this.element !== "H";
  }

  /**
   * Defines this atom as the anchor for a ring. When doing repositionings of the vertices and the vertex associated with this atom is moved, the center of this ring is moved as well.
   *
   * @param {Number} ringId A ring id.
   */
  public addAnchoredRing(ringId: number): void {
    if (!this.anchoredRings.includes(ringId)) {
      this.anchoredRings.push(ringId);
    }
  }

  /**
   * Returns the number of ringbonds (breaks in rings to generate the MST of the smiles) within this atom is connected to.
   *
   * @returns {Number} The number of ringbonds this atom is connected to.
   */
  public getRingbondCount(): number {
    return this.ringbonds.length;
  }

  /**
   * Backs up the current rings.
   */
  public backupRings(): void {
    this.originalRings = [...this.rings];
  }

  /**
   * Restores the most recent backed up rings.
   */
  public restoreRings(): void {
    this.rings = [...this.originalRings];
  }

  /**
   * Checks whether or not two atoms share a common ringbond id. A ringbond is a break in a ring created when generating the spanning tree of a structure.
   *
   * @param {Atom} atomA An atom.
   * @param {Atom} atomB An atom.
   * @returns {Boolean} A boolean indicating whether or not two atoms share a common ringbond.
   */
  public haveCommonRingbond(atomA: Atom, atomB: Atom): boolean {
    return atomA.ringbonds.some((rbA) =>
      atomB.ringbonds.some((rbB) => rbA.id === rbB.id)
    );
  }

  /**
   * Check whether or not the neighbouring elements of this atom equal the supplied array.
   *
   * @param {String[]} arr An array containing all the elements that are neighbouring this atom. E.g. ['C', 'O', 'O', 'N']
   * @returns {Boolean} A boolean indicating whether or not the neighbours match the supplied array of elements.
   */
  public neighbouringElementsEqual(arr: string[]): boolean {
    if (arr.length !== this.neighbouringElements.length) {
      return false;
    }

    const sortedArr = [...arr].sort();
    const sortedNeighbours = [...this.neighbouringElements].sort();

    return sortedArr.every(
      (element, index) => element === sortedNeighbours[index]
    );
  }

  /**
   * Get the atomic number of this atom.
   *
   * @returns {Number} The atomic number of this atom.
   */
  public getAtomicNumber(): number {
    return Atom.atomicNumbers[this.element];
  }

  /**
   * Get the atomic number of this atom.
   *
   * @returns {Number} The atomic number of this atom.
   */
  public getMaxBonds(): number {
    return Atom.maxBonds[this.element];
  }

  /**
   * A map mapping element symbols to their maximum bonds.
   */
  private static readonly maxBonds: { [key: string]: number } = {
    H: 1,
    C: 4,
    N: 3,
    O: 2,
    P: 3,
    S: 2,
    B: 3,
    F: 1,
    I: 1,
    Cl: 1,
    Br: 1,
  };

  /**
   * A map mapping element symbols to the atomic number.
   */
  private static readonly atomicNumbers: { [key: string]: number } = {
    H: 1,
    He: 2,
    Li: 3,
    Be: 4,
    B: 5,
    b: 5,
    C: 6,
    c: 6,
    N: 7,
    n: 7,
    O: 8,
    o: 8,
    F: 9,
    Ne: 10,
    Na: 11,
    Mg: 12,
    Al: 13,
    Si: 14,
    P: 15,
    p: 15,
    S: 16,
    s: 16,
    Cl: 17,
    Ar: 18,
    K: 19,
    Ca: 20,
    Sc: 21,
    Ti: 22,
    V: 23,
    Cr: 24,
    Mn: 25,
    Fe: 26,
    Co: 27,
    Ni: 28,
    Cu: 29,
    Zn: 30,
    Ga: 31,
    Ge: 32,
    As: 33,
    Se: 34,
    Br: 35,
    Kr: 36,
    Rb: 37,
    Sr: 38,
    Y: 39,
    Zr: 40,
    Nb: 41,
    Mo: 42,
    Tc: 43,
    Ru: 44,
    Rh: 45,
    Pd: 46,
    Ag: 47,
    Cd: 48,
    In: 49,
    Sn: 50,
    Sb: 51,
    Te: 52,
    I: 53,
    Xe: 54,
    Cs: 55,
    Ba: 56,
    La: 57,
    Ce: 58,
    Pr: 59,
    Nd: 60,
    Pm: 61,
    Sm: 62,
    Eu: 63,
    Gd: 64,
    Tb: 65,
    Dy: 66,
    Ho: 67,
    Er: 68,
    Tm: 69,
    Yb: 70,
    Lu: 71,
    Hf: 72,
    Ta: 73,
    W: 74,
    Re: 75,
    Os: 76,
    Ir: 77,
    Pt: 78,
    Au: 79,
    Hg: 80,
    Tl: 81,
    Pb: 82,
    Bi: 83,
    Po: 84,
    At: 85,
    Rn: 86,
    Fr: 87,
    Ra: 88,
    Ac: 89,
    Th: 90,
    Pa: 91,
    U: 92,
    Np: 93,
    Pu: 94,
    Am: 95,
    Cm: 96,
    Bk: 97,
    Cf: 98,
    Es: 99,
    Fm: 100,
    Md: 101,
    No: 102,
    Lr: 103,
    Rf: 104,
    Db: 105,
    Sg: 106,
    Bh: 107,
    Hs: 108,
    Mt: 109,
    Ds: 110,
    Rg: 111,
    Cn: 112,
    Uut: 113,
    Uuq: 114,
    Uup: 115,
    Uuh: 116,
    Uus: 117,
    Uuo: 118,
  };

  /**
   * A map mapping element symbols to the atomic mass.
   */
  private static readonly mass: { [key: string]: number } = {
    H: 1,
    He: 2,
    Li: 3,
    Be: 4,
    B: 5,
    b: 5,
    C: 6,
    c: 6,
    N: 7,
    n: 7,
    O: 8,
    o: 8,
    F: 9,
    Ne: 10,
    Na: 11,
    Mg: 12,
    Al: 13,
    Si: 14,
    P: 15,
    p: 15,
    S: 16,
    s: 16,
    Cl: 17,
    Ar: 18,
    K: 19,
    Ca: 20,
    Sc: 21,
    Ti: 22,
    V: 23,
    Cr: 24,
    Mn: 25,
    Fe: 26,
    Co: 27,
    Ni: 28,
    Cu: 29,
    Zn: 30,
    Ga: 31,
    Ge: 32,
    As: 33,
    Se: 34,
    Br: 35,
    Kr: 36,
    Rb: 37,
    Sr: 38,
    Y: 39,
    Zr: 40,
    Nb: 41,
    Mo: 42,
    Tc: 43,
    Ru: 44,
    Rh: 45,
    Pd: 46,
    Ag: 47,
    Cd: 48,
    In: 49,
    Sn: 50,
    Sb: 51,
    Te: 52,
    I: 53,
    Xe: 54,
    Cs: 55,
    Ba: 56,
    La: 57,
    Ce: 58,
    Pr: 59,
    Nd: 60,
    Pm: 61,
    Sm: 62,
    Eu: 63,
    Gd: 64,
    Tb: 65,
    Dy: 66,
    Ho: 67,
    Er: 68,
    Tm: 69,
    Yb: 70,
    Lu: 71,
    Hf: 72,
    Ta: 73,
    W: 74,
    Re: 75,
    Os: 76,
    Ir: 77,
    Pt: 78,
    Au: 79,
    Hg: 80,
    Tl: 81,
    Pb: 82,
    Bi: 83,
    Po: 84,
    At: 85,
    Rn: 86,
    Fr: 87,
    Ra: 88,
    Ac: 89,
    Th: 90,
    Pa: 91,
    U: 92,
    Np: 93,
    Pu: 94,
    Am: 95,
    Cm: 96,
    Bk: 97,
    Cf: 98,
    Es: 99,
    Fm: 100,
    Md: 101,
    No: 102,
    Lr: 103,
    Rf: 104,
    Db: 105,
    Sg: 106,
    Bh: 107,
    Hs: 108,
    Mt: 109,
    Ds: 110,
    Rg: 111,
    Cn: 112,
    Uut: 113,
    Uuq: 114,
    Uup: 115,
    Uuh: 116,
    Uus: 117,
    Uuo: 118,
  };
}
