import { Node, UniformNode } from "./types.js"

/**
 * Options for pruning a generic tree node structure.
 *
 * @template TChildrenKey - The string literal type representing the child node key.
 * @template TInputNode - The node type extending `Node<TChildrenKey>`.
 */
interface GenericNodeOptions<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
> {
  /** The key on each node where child nodes are stored. */
  childrenKey: TChildrenKey

  /** If true, the tree will be deep cloned before pruning. Defaults to false. */
  copy?: boolean

  /**
   * A predicate function that determines whether a node should be pruned.
   *
   * @param node - The current node being evaluated.
   * @param parent - The parent of the current node, or null if root.
   * @param depth - The depth of the current node in the tree.
   * @returns `true` if the node should be pruned; otherwise `false`.
   */
  testFn: (
    node: TInputNode,
    parent: TInputNode | null,
    depth: number
  ) => boolean
}

/**
 * Options for pruning a uniform tree node structure with props.
 *
 * @template TChildrenKey - The key on the node that contains child nodes.
 * @template TProps - An object representing the shape of node props.
 * @template TInputNode - The node type extending `UniformNode`.
 */
interface UniformNodeOptions<
  TChildrenKey extends string,
  TProps extends object = { [key: string]: unknown },
  TInputNode extends UniformNode<TChildrenKey, TProps> = UniformNode<
    TChildrenKey,
    TProps
  >
> {
  /** The key on each node where child nodes are stored. */
  childrenKey: TChildrenKey

  /** If true, the tree will be deep cloned before pruning. Defaults to false. */
  copy?: boolean

  /**
   * A predicate function that determines whether a node should be pruned.
   *
   * @param node - The current node being evaluated.
   * @param parent - The parent of the current node, or null if root.
   * @param depth - The depth of the current node in the tree.
   * @returns `true` if the node should be pruned; otherwise `false`.
   */
  testFn: (
    node: TInputNode,
    parent: TInputNode | null,
    depth: number
  ) => boolean
}

/**
 * Internal helper options for recursive pruning logic.
 *
 * @template TChildrenKey - The key on each node where child nodes are stored.
 * @template TCurrentNode - The current node type.
 */
interface HelperOptions<
  TChildrenKey extends string,
  TCurrentNode extends Node<TChildrenKey> = Node<TChildrenKey>
> {
  childrenKey: TChildrenKey
  testFn: (
    node: TCurrentNode,
    parent: TCurrentNode | null,
    depth: number
  ) => boolean
}

/**
 * Prunes nodes from a uniform tree based on a test function.
 *
 * @template TChildrenKey - The key that contains child nodes.
 * @template TProps - Props object for each node.
 * @template TInputNode - The input node type.
 *
 * @param tree - The root of the tree to prune.
 * @param options - Options to control the pruning logic.
 * @returns A pruned version of the tree or `null` if the root is pruned.
 */
export function prune<
  TChildrenKey extends string,
  TProps extends object = { [key: string]: unknown },
  TInputNode extends UniformNode<TChildrenKey, TProps> = UniformNode<
    TChildrenKey,
    TProps
  >
>(
  tree: TInputNode,
  options: UniformNodeOptions<TChildrenKey, TProps, TInputNode>
): TInputNode | null

/**
 * Prunes nodes from a generic tree based on a test function.
 *
 * @template TChildrenKey - The key that contains child nodes.
 * @template TInputNode - The input node type.
 *
 * @param tree - The root of the tree to prune.
 * @param options - Options to control the pruning logic.
 * @returns A pruned version of the tree or `null` if the root is pruned.
 */
export function prune<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  tree: TInputNode,
  options: GenericNodeOptions<TChildrenKey>
): TInputNode | null

/**
 * Implementation of the `prune` function with support for both generic and uniform nodes.
 *
 * @template TChildrenKey - The key used to access child nodes.
 * @template TInputNode - The node type.
 *
 * @param tree - The root node of the tree to prune.
 * @param options - Configuration for pruning behavior.
 * @returns The pruned tree or null if the root is pruned.
 */
export function prune<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  tree: TInputNode,
  options:
    | GenericNodeOptions<TChildrenKey, TInputNode>
    | UniformNodeOptions<TChildrenKey, any, TInputNode>
): TInputNode | null {
  const childrenKey = options.childrenKey
  const copy = options.copy ?? false
  const testFn = options.testFn

  const visitedNodesSet = new WeakSet()

  const helperOptions: HelperOptions<TChildrenKey, TInputNode> = {
    childrenKey,
    testFn,
  }

  return pruneHelper<TChildrenKey, TInputNode>(
    copy ? structuredClone(tree) : tree,
    null,
    0,
    visitedNodesSet,
    helperOptions
  )
}

/**
 * Recursively traverses and prunes nodes in a tree based on a test function.
 *
 * @template TChildrenKey - The key used to access child nodes.
 * @template TCurrentNode - The current node type.
 *
 * @param node - The current node being processed.
 * @param parent - The parent of the current node.
 * @param depth - The depth of the current node in the tree.
 * @param visited - A WeakSet to detect circular references.
 * @param options - Helper options including `childrenKey` and `testFn`.
 * @returns The pruned node, or `null` if it should be removed.
 */
function pruneHelper<
  TChildrenKey extends string,
  TCurrentNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  node: TCurrentNode,
  parent: TCurrentNode | null,
  depth: number,
  visited: WeakSet<object>,
  options: HelperOptions<TChildrenKey, TCurrentNode>
): TCurrentNode | null {
  const { testFn, childrenKey } = options

  if (visited.has(node)) throw new Error("Circular reference detected")
  visited.add(node)

  if (testFn(node, parent, depth)) {
    return null
  }

  const childrenArray = node[childrenKey] as TCurrentNode[] | undefined

  if (!childrenArray || childrenArray.length === 0) {
    visited.delete(node)
    return node
  }

  for (let i = childrenArray.length - 1; i >= 0; i--) {
    const child = childrenArray[i]
    const newChild = pruneHelper(child, node, depth + 1, visited, options)
    if (newChild === null) childrenArray.splice(i, 1)
  }

  visited.delete(node)
  return node
}
