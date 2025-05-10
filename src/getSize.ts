import { Node, UniformNode } from "./types.js"

/**
 * Options for operating on a generic node tree.
 *
 * @template TChildrenKey - The string key used to access children in the node.
 * @template TInputNode - The type of nodes in the tree, defaulting to `Node<TChildrenKey>`.
 */
interface GenericNodeOptions<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
> {
  /**
   * Optional function to determine whether a node should be counted.
   * @param node - The current node being visited.
   * @param parent - The parent of the current node.
   * @param depth - The depth of the current node in the tree.
   * @returns `true` to count the node, `false` to skip it.
   */
  testFn?: (
    node: TInputNode,
    parent: TInputNode | null,
    depth: number
  ) => boolean

  /** The key to access the node's children array. */
  childrenKey: TChildrenKey
}

/**
 * Options for operating on a uniform node tree where all nodes share the same shape.
 *
 * @template TChildrenKey - The string key used to access children in the node.
 * @template TProps - The shape of the additional properties of the node.
 * @template TInputNode - The type of the input node.
 */
interface UniformNodeOptions<
  TChildrenKey extends string,
  TProps extends object = { [key: string]: unknown },
  TInputNode extends UniformNode<TChildrenKey, TProps> = UniformNode<
    TChildrenKey,
    TProps
  >
> {
  /**
   * Optional function to determine whether a node should be counted.
   * @param node - The current node being visited.
   * @param parent - The parent of the current node.
   * @param depth - The depth of the current node in the tree.
   * @returns `true` to count the node, `false` to skip it.
   */
  testFn?: (
    node: TInputNode,
    parent: TInputNode | null,
    depth: number
  ) => boolean

  /** The key to access the node's children array. */
  childrenKey: TChildrenKey
}

/**
 * Internal helper options used by the recursive node-counting function.
 *
 * @template TChildrenKey - The key used to access children in the node.
 * @template TCurrentNode - The node type used during recursion.
 */
interface HelperOptions<
  TChildrenKey extends string,
  TCurrentNode extends Node<TChildrenKey> = Node<TChildrenKey>
> {
  /** The key to access children in the current node. */
  childrenKey: TChildrenKey

  /**
   * A predicate function to determine if a node should be counted.
   * @param node - The node being evaluated.
   * @param parent - The parent of the node.
   * @param depth - The depth of the node in the tree.
   * @returns Whether the node should be included in the count.
   */
  testFn: (
    node: TCurrentNode,
    parent: TCurrentNode | null,
    depth: number
  ) => boolean
}

/**
 * Recursively counts the number of nodes in a tree that match a test function.
 *
 * @template TChildrenKey - The key used to access child nodes.
 * @template TInputNode - The type of node used in the input tree.
 * @template TProps - The shape of any extra node props, for uniform trees.
 *
 * @param tree - The root of the tree to count nodes from.
 * @param options - Configuration options for how to traverse and filter nodes.
 * @returns The number of nodes matching the provided criteria.
 */
export function getSize<
  TChildrenKey extends string,
  TProps extends object = { [key: string]: unknown },
  TInputNode extends UniformNode<TChildrenKey, TProps> = UniformNode<
    TChildrenKey,
    TProps
  >
>(
  tree: TInputNode,
  options: UniformNodeOptions<TChildrenKey, TProps, TInputNode>
): number

/**
 * Overload of `getSize` for generic tree structures.
 *
 * @template TChildrenKey - The key used to access child nodes.
 * @template TInputNode - The type of the input node.
 *
 * @param tree - The root of the generic node tree.
 * @param options - Configuration options for traversal and filtering.
 * @returns The number of nodes matching the criteria.
 */
export function getSize<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(tree: TInputNode, options: GenericNodeOptions<TChildrenKey>): number

export function getSize<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  tree: TInputNode,
  options:
    | GenericNodeOptions<TChildrenKey, TInputNode>
    | UniformNodeOptions<TChildrenKey, any, TInputNode>
): number {
  const childrenKey = options.childrenKey
  const testFn = options?.testFn ?? (() => true)
  const visitedNodesSet = new WeakSet()

  const helperOptions: HelperOptions<TChildrenKey, TInputNode> = {
    childrenKey,
    testFn,
  }

  return getSizeHelper<TChildrenKey, TInputNode>(
    tree,
    null,
    0,
    visitedNodesSet,
    helperOptions
  )
}

/**
 * Internal recursive function to count the number of nodes in the tree that match a predicate.
 *
 * @template TChildrenKey - The key used to access children from a node.
 * @template TCurrentNode - The node type at the current level of recursion.
 *
 * @param node - The current node being visited.
 * @param parent - The parent of the current node, or null if at the root.
 * @param depth - The current depth in the tree.
 * @param visited - A WeakSet used to track visited nodes to prevent infinite recursion.
 * @param options - Helper options including the children key and test function.
 * @returns The number of matching nodes in the current subtree.
 */
function getSizeHelper<
  TChildrenKey extends string,
  TCurrentNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  node: TCurrentNode,
  parent: TCurrentNode | null,
  depth: number,
  visited: WeakSet<object>,
  options: HelperOptions<TChildrenKey, TCurrentNode>
): number {
  const { childrenKey, testFn } = options

  if (visited.has(node)) throw new Error("Circular reference detected")
  visited.add(node)

  const count = testFn(node, parent, depth) ? 1 : 0
  const childrenArray = node[childrenKey] as TCurrentNode[] | undefined

  if (!childrenArray || childrenArray.length === 0) {
    visited.delete(node)
    return count
  }

  const countDescendants = childrenArray.reduce((sum, childNode) => {
    return sum + getSizeHelper(childNode, node, depth + 1, visited, options)
  }, 0)

  visited.delete(node)
  return count + countDescendants
}
