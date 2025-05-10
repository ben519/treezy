import { Node, UniformNode } from "./types.js"

/**
 * Options for traversing a generic node tree to find a parent node.
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
 * Options for traversing a strongly-typed uniform node tree to find a parent node.
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
 * Finds the parent of a node in a uniform tree structure by using a test function.
 *
 * @param tree - The root of the tree to search.
 * @param options - Options for traversal including test function and children key.
 * @returns The parent of the matching node, or null/undefined if not found.
 */
export function getParent<
  TChildrenKey extends string,
  TProps extends object = { [key: string]: unknown },
  TInputNode extends UniformNode<TChildrenKey, TProps> = UniformNode<
    TChildrenKey,
    TProps
  >
>(
  tree: TInputNode,
  options: UniformNodeOptions<TChildrenKey, TProps, TInputNode>
): TInputNode | null | undefined

/**
 * Finds the parent of a node in a generic tree structure by using a test function.
 *
 * @param tree - The root of the tree to search.
 * @param options - Options for traversal including test function and children key.
 * @returns The parent of the matching node, or null/undefined if not found.
 */
export function getParent<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  tree: TInputNode,
  options: GenericNodeOptions<TChildrenKey>
): TInputNode | null | undefined

/**
 * Internal overload resolver for getParent, delegates to the recursive helper.
 */
export function getParent<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  tree: TInputNode,
  options:
    | GenericNodeOptions<TChildrenKey, TInputNode>
    | UniformNodeOptions<TChildrenKey, any, TInputNode>
): TInputNode | null | undefined {
  const childrenKey = options.childrenKey
  const copy = options.copy ?? false
  const testFn = options.testFn
  const visitedNodesSet = new WeakSet()

  const helperOptions: HelperOptions<TChildrenKey, TInputNode> = {
    childrenKey,
    testFn,
  }

  return getParentHelper<TChildrenKey, TInputNode>(
    copy ? structuredClone(tree) : tree,
    null,
    0,
    visitedNodesSet,
    helperOptions
  )
}

/**
 * Recursively traverses the tree to find the parent of a node that matches the test function.
 *
 * @param node - The current node in the traversal.
 * @param parent - The parent of the current node.
 * @param depth - The current depth in the tree.
 * @param visited - Set of visited nodes to avoid circular references.
 * @param options - Options including test function and children key.
 * @returns The parent of the matching node, or undefined if not found.
 */
function getParentHelper<
  TChildrenKey extends string,
  TCurrentNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  node: TCurrentNode,
  parent: TCurrentNode | null,
  depth: number,
  visited: WeakSet<object>,
  options: HelperOptions<TChildrenKey, TCurrentNode>
): TCurrentNode | null | undefined {
  const { childrenKey, testFn } = options

  if (visited.has(node)) throw new Error("Circular reference detected")
  visited.add(node)

  if (testFn(node, parent, depth)) {
    return parent
  }

  const childrenArray = node[childrenKey] as TCurrentNode[] | undefined

  for (const child of childrenArray ?? []) {
    const parentInSubtree = getParentHelper(
      child,
      node,
      depth + 1,
      visited,
      options
    )
    if (parentInSubtree) return parentInSubtree
  }

  visited.delete(node)
  return undefined
}
