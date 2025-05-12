import { Node, UniformNode } from "./types.js"

/**
 * Options for traversing a generic node tree to find a target node.
 *
 * @template TChildrenKey - The key used to access children in the node.
 * @template TInputNode - The type of node being processed.
 */
interface GenericNodeOptions<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
> {
  /**
   * Function to test if a node is the target node.
   * Should return true for the node whose parent you want to find.
   */
  testFn: (
    node: TInputNode,
    parent: TInputNode | null | undefined,
    depth: number
  ) => boolean

  /** Whether to deep-copy the input tree before searching. Defaults to false. */
  copy?: boolean

  /** The key in each node object used to access child nodes. */
  childrenKey: TChildrenKey
}

/**
 * Options for traversing a strongly-typed uniform node tree to find a target node.
 *
 * @template TChildrenKey - The key used to access children in the node.
 * @template TProps - The shape of properties each node contains.
 * @template TInputNode - The type of uniform node being processed.
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
   * Function to test if a node is the target node.
   * Should return true for the node whose parent you want to find.
   */
  testFn: (
    node: TInputNode,
    parent: TInputNode | null | undefined,
    depth: number
  ) => boolean

  /** Whether to deep-copy the input tree before searching. Defaults to false. */
  copy?: boolean

  /** The key in each node object used to access child nodes. */
  childrenKey: TChildrenKey
}

/**
 * Internal helper options used for recursive traversal.
 *
 * @template TChildrenKey - The key used to access children in the node.
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
 * Finds the path to a target node from the root of a uniform tree structure by using
 * a test function.
 *
 * @param tree - The root of the tree to search.
 * @param options - Options for traversal including test function and children key.
 * @returns Array of nodes from root to target or undefined if target not found
 */
export function getPath<
  TChildrenKey extends string,
  TProps extends object = { [key: string]: unknown },
  TInputNode extends UniformNode<TChildrenKey, TProps> = UniformNode<
    TChildrenKey,
    TProps
  >
>(
  tree: TInputNode,
  options: UniformNodeOptions<TChildrenKey, TProps, TInputNode>
): [TInputNode, ...TInputNode[]] | undefined

/**
 * Finds the path to a target node from the root of a generic tree structure by using
 * a test function.
 *
 * @param tree - The root of the tree to search.
 * @param options - Options for traversal including test function and children key.
 * @returns Array of nodes from root to target or undefined if target not found
 */
export function getPath<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  tree: TInputNode,
  options: GenericNodeOptions<TChildrenKey>
): [TInputNode, ...TInputNode[]] | undefined

/**
 * Internal overload resolver for getPath, delegates to the recursive helper.
 */
export function getPath<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  tree: TInputNode,
  options:
    | GenericNodeOptions<TChildrenKey, TInputNode>
    | UniformNodeOptions<TChildrenKey, any, TInputNode>
): [TInputNode, ...TInputNode[]] | undefined {
  const childrenKey = options.childrenKey
  const copy = options.copy ?? false
  const testFn = options.testFn
  const visitedNodesSet = new WeakSet()

  const helperOptions: HelperOptions<TChildrenKey, TInputNode> = {
    childrenKey,
    testFn,
  }

  const path = getPathHelper<TChildrenKey, TInputNode>(
    copy ? structuredClone(tree) : tree,
    null,
    0,
    visitedNodesSet,
    helperOptions
  )

  return path.length > 0 ? (path as [TInputNode, ...TInputNode[]]) : undefined
}

function getPathHelper<
  TChildrenKey extends string,
  TCurrentNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  node: TCurrentNode,
  parent: TCurrentNode | null,
  depth: number,
  visited: WeakSet<object>,
  options: HelperOptions<TChildrenKey, TCurrentNode>
): TCurrentNode[] {
  const { childrenKey, testFn } = options

  if (visited.has(node)) throw new Error("Circular reference detected")
  visited.add(node)

  if (testFn(node, parent, depth)) {
    return [node]
  }

  const childrenArray = node[childrenKey] as TCurrentNode[] | undefined

  for (const child of childrenArray ?? []) {
    const path = getPathHelper(child, node, depth + 1, visited, options)
    if (path.length) return [node, ...path]
  }

  visited.delete(node)
  return []
}
