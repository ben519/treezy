import { Node, UniformNode } from "./types.js"

/**
 * Options for inserting a node into a generic tree structure.
 *
 * @template TChildrenKey - The key used to access child nodes.
 * @template TInputNode - The node type, defaults to `Node<TChildrenKey>`.
 */
interface GenericNodeOptions<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
> {
  /** Key used to access child nodes. */
  childrenKey: TChildrenKey

  /** Whether to insert a deep copy of the tree instead of mutating it. Defaults to `false`. */
  copy?: boolean

  /** Where to insert the node relative to the match: `"after"`, `"before"`, or `"below"`. Defaults to `"below"`. */
  direction?: "after" | "before" | "below"

  /** The node to insert into the tree. */
  nodeToInsert: TInputNode

  /**
   * Predicate function to test whether a node is the target for insertion.
   * @param node - The current node being examined.
   * @param parent - The parent of the current node, or `null` if root.
   * @param depth - The depth of the current node in the tree.
   */
  testFn?: (
    node: TInputNode,
    parent: TInputNode | null,
    depth: number
  ) => boolean
}

/**
 * Options for inserting a node into a uniform node tree structure.
 *
 * @template TChildrenKey - The key used to access child nodes.
 * @template TProps - The props shape of the node.
 * @template TInputNode - The uniform node type.
 */
interface UniformNodeOptions<
  TChildrenKey extends string,
  TProps extends object = { [key: string]: unknown },
  TInputNode extends UniformNode<TChildrenKey, TProps> = UniformNode<
    TChildrenKey,
    TProps
  >
> {
  childrenKey: TChildrenKey
  copy?: boolean
  direction?: "after" | "before" | "below"
  nodeToInsert: TInputNode
  testFn?: (
    node: TInputNode,
    parent: TInputNode | null,
    depth: number
  ) => boolean
}

/**
 * Internal options used by the recursive helper function.
 *
 * @template TChildrenKey - The key used to access child nodes.
 * @template TCurrentNode - The current node type.
 */
interface HelperOptions<
  TChildrenKey extends string,
  TCurrentNode extends Node<TChildrenKey> = Node<TChildrenKey>
> {
  childrenKey: TChildrenKey
  direction: "after" | "before" | "below"
  nodeToInsert: TCurrentNode
  testFn: (
    node: TCurrentNode,
    parent: TCurrentNode | null,
    depth: number
  ) => boolean
}

/**
 * Inserts a node into a tree of uniform nodes, optionally cloning the original tree.
 *
 * @param tree - The root of the tree to modify.
 * @param options - Configuration options for insertion.
 * @returns The modified tree, or `undefined` if no insertion occurred.
 */
export function insert<
  TChildrenKey extends string,
  TProps extends object = { [key: string]: unknown },
  TInputNode extends UniformNode<TChildrenKey, TProps> = UniformNode<
    TChildrenKey,
    TProps
  >
>(
  tree: TInputNode,
  options: UniformNodeOptions<TChildrenKey, TProps, TInputNode>
): TInputNode | undefined

/**
 * Inserts a node into a tree of generic nodes.
 *
 * @param tree - The root of the tree to modify.
 * @param options - Configuration options for insertion.
 * @returns The modified tree, or `undefined` if no insertion occurred.
 */
export function insert<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  tree: TInputNode,
  options: GenericNodeOptions<TChildrenKey>
): TInputNode | undefined

/**
 * Implementation of `insert`, supporting both generic and uniform node trees.
 */
export function insert<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  tree: TInputNode,
  options:
    | GenericNodeOptions<TChildrenKey, TInputNode>
    | UniformNodeOptions<TChildrenKey, any, TInputNode>
): TInputNode | undefined {
  const childrenKey = options.childrenKey
  const copy = options.copy ?? false
  const direction = options.direction ?? "below"
  const nodeToInsert = options.nodeToInsert
  const testFn = options.testFn ?? (() => true)

  const visitedNodesSet = new WeakSet()

  const helperOptions: HelperOptions<TChildrenKey, TInputNode> = {
    childrenKey,
    direction,
    nodeToInsert,
    testFn,
  }

  return insertHelper<TChildrenKey, TInputNode>(
    copy ? structuredClone(tree) : tree,
    null,
    0,
    visitedNodesSet,
    helperOptions
  )
}

/**
 * Recursive helper function for `insert`.
 *
 * Traverses the tree and inserts `nodeToInsert` relative to the first node that matches `testFn`.
 *
 * @param node - Current node in the traversal.
 * @param parent - Parent node of the current node.
 * @param depth - Depth of the current node.
 * @param visited - A WeakSet to detect and prevent infinite loops from circular references.
 * @param options - Configuration for the traversal and insertion logic.
 * @returns The root of the modified subtree, or `undefined` if insertion did not occur.
 */
function insertHelper<
  TChildrenKey extends string,
  TCurrentNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  node: TCurrentNode,
  parent: TCurrentNode | null,
  depth: number,
  visited: WeakSet<object>,
  options: HelperOptions<TChildrenKey, TCurrentNode>
): TCurrentNode | undefined {
  const { testFn, direction, childrenKey, nodeToInsert } = options

  if (visited.has(node)) throw new Error("Circular reference detected")
  visited.add(node)

  if (testFn(node, parent, depth)) {
    if (["after", "before"].includes(direction)) {
      if (parent === null) {
        throw new Error(
          "Cannot insert 'nodeToInsert' before the root of 'node'"
        )
      }

      const childrenOfParent = parent[childrenKey]!
      const idxOfNode = childrenOfParent.findIndex((x) => x === node)

      childrenOfParent.splice(
        idxOfNode + (direction === "before" ? 0 : 1),
        0,
        nodeToInsert
      )

      return node
    } else if (direction === "below") {
      let childrenProp = node[childrenKey]

      if (childrenProp === undefined) {
        ;(node[childrenKey] as TCurrentNode[]) = [nodeToInsert]
      } else {
        childrenProp.push(nodeToInsert)
      }

      return node
    }
  }

  const childrenArray = node[childrenKey] as TCurrentNode[] | undefined

  for (const child of childrenArray ?? []) {
    const wasInserted = insertHelper(child, node, depth + 1, visited, options)
    if (wasInserted) return node
  }

  visited.delete(node)
  return undefined
}
