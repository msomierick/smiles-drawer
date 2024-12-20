import { Vector2 } from "./Vector2";
import { Atom } from "./Atom";
import { MathHelper } from "./MathHelper";
import { Edge } from "./Edge";
import { Vertex } from "./Vertex";
import { Ring } from "./Ring";

// First, let's define necessary interfaces and types
interface ParseTreeNode {
  atom: any;
  bond: string;
  branchBond: string | null;
  ringbonds: any[];
  branches: ParseTreeNode[];
  branchCount: number;
  ringbondCount: number;
  next: ParseTreeNode | null;
  hasNext: boolean;
}

/**
 * A class representing the molecular graph.
 *
 * @property {Vertex[]} vertices The vertices of the graph.
 * @property {Edge[]} edges The edges of this graph.
 * @property {Number[]} atomIdxToVertexId A map mapping atom indices to vertex ids.
 * @property {Object} vertexIdsToEdgeId A map mapping vertex ids to the edge between the two vertices. The key is defined as vertexAId + '_' + vertexBId.
 * @property {Boolean} isometric A boolean indicating whether or not the SMILES associated with this graph is isometric.
 */
export class Graph {
  public vertices: Vertex[];
  public edges: Edge[];
  public atomIdxToVertexId: number[];
  public vertexIdsToEdgeId: { [key: string]: number };
  public isomeric: boolean;
  private _atomIdx: number;
  private _time: number;

  /**
   * The constructor of the class Graph.
   *
   * @param {Object} parseTree A SMILES parse tree.
   * @param {Boolean} [isomeric=false] A boolean specifying whether or not the SMILES is isomeric.
   */
  constructor(parseTree: ParseTreeNode, isomeric: boolean = false) {
    this.vertices = [];
    this.edges = [];
    this.atomIdxToVertexId = [];
    this.vertexIdsToEdgeId = {};
    this.isomeric = isomeric;

    // Used to assign indices to the heavy atoms.
    this._atomIdx = 0;

    // Used for the bridge detection algorithm
    this._time = 0;
    this._init(parseTree);
  }

  /**
   * PRIVATE FUNCTION. Initializing the graph from the parse tree.
   *
   * @param {Object} node The current node in the parse tree.
   * @param {?Number} parentVertexId=null The id of the previous vertex.
   * @param {Boolean} isBranch=false Whether or not the bond leading to this vertex is a branch bond. Branches are represented by parentheses in smiles (e.g. CC(O)C).
   */
  private _init(
    node: ParseTreeNode,
    order: number = 0,
    parentVertexId: number | null = null,
    isBranch: boolean = false
  ): void {
    // Create a new vertex object
    const element = node.atom.element ? node.atom.element : node.atom;
    let atom: Atom = {
      element: element,
      bondType: node.bond,
      idx: null,
      branchBond: null,
      ringbonds: [],
      bracket: null,
      class: null,
      isStereoCenter: false,
      isPartOfAromaticRing: false,
      bondCount: 0,
      neighbouringElements: [],
      addNeighbouringElement(element: string): void {
        this.neighbouringElements.push(element);
      },
    };

    if (element !== "H" || (!node.hasNext && parentVertexId === null)) {
      atom.idx = this._atomIdx;
      this._atomIdx++;
    }

    atom.branchBond = node.branchBond;
    atom.ringbonds = node.ringbonds;
    atom.bracket = node.atom.element ? node.atom : null;
    atom.class = node.atom.class;

    let vertex = this.createVertex(atom);
    let parentVertex = this.vertices[parentVertexId as number];

    this.addVertex(vertex);

    if (atom.idx !== null) {
      this.atomIdxToVertexId.push(vertex.id);
    }

    // Add the id of this node to the parent as child
    if (parentVertexId !== null) {
      vertex.setParentVertexId(parentVertexId);
      vertex.value.addNeighbouringElement(parentVertex.value.element);
      parentVertex.addChild(vertex.id);
      parentVertex.value.addNeighbouringElement(atom.element);

      // In addition create a spanningTreeChildren property, which later will
      // not contain the children added through ringbonds
      parentVertex.spanningTreeChildren.push(vertex.id);

      // Add edge between this node and its parent
      let edge: Edge = {
        id: 0,
        sourceId: parentVertexId,
        targetId: vertex.id,
        weight: 1,
        bondType: "",
        isPartOfAromaticRing: false,
        setBondType(bondType: string): void {
          this.bondType = bondType;
        },
      };
      let vertexId: number | null = null;

      if (isBranch) {
        edge.setBondType(vertex.value.branchBond || "-");
        vertexId = vertex.id;
      } else {
        edge.setBondType(parentVertex.value.bondType || "-");
        vertexId = parentVertex.id;
      }

      let edgeId = this.addEdge(edge);
    }

    let offset = node.ringbondCount + 1;

    if (atom.bracket) {
      offset += atom.bracket.hcount;
    }

    let stereoHydrogens = 0;
    if (atom.bracket && atom.bracket.chirality) {
      atom.isStereoCenter = true;
      stereoHydrogens = atom.bracket.hcount;
      for (let i = 0; i < stereoHydrogens; i++) {
        this._init(
          {
            atom: "H",
            bond: "-",
            branchBond: null,
            ringbonds: [],
            branches: [],
            branchCount: 0,
            ringbondCount: 0,
            next: null,
            hasNext: false,
          },
          i,
          vertex.id,
          true
        );
      }
    }

    for (let i = 0; i < node.branchCount; i++) {
      this._init(node.branches[i], i + offset, vertex.id, true);
    }

    if (node.hasNext) {
      this._init(node.next, node.branchCount + offset, vertex.id);
    }
  }

  // ... [Rest of the methods would follow with TypeScript type annotations]
  // I'll continue with the next section of methods if you'd like

  private createVertex(atom: Atom): Vertex {
    return {
      id: 0,
      value: atom,
      neighbours: [],
      edges: [],
      spanningTreeChildren: [],
      parentVertexId: null,
      positioned: false,
      forcePositioned: false,
      setParentVertexId(parentVertexId: number): void {
        this.parentVertexId = parentVertexId;
      },
      addChild(vertexId: number): void {
        this.neighbours.push(vertexId);
      },
      getNeighbours(vertexId: number | null): number[] {
        if (vertexId === null) {
          return this.neighbours;
        }
        return this.neighbours.filter((v) => v !== vertexId);
      },
      getSpanningTreeNeighbours(vertexId: number | null): number[] {
        if (vertexId === null) {
          return this.spanningTreeChildren;
        }
        return this.spanningTreeChildren.filter((v) => v !== vertexId);
      },
    };
  }
}
