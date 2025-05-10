import { Node, UniformNode } from "./types.js"

/**
 * Options for traversing a generic tree structure.
 *
 * @template TChildrenKey - The key in each node that contains child nodes.
 * @template TInputNode - The type of node in the tree.
 */
interface GenericNodeOptions<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
> {
  /** The key used to access children from a node. */
  childrenKey: TChildrenKey

  /** Whether to deep copy the input tree before processing. */
  copy?: boolean

  /**
   * A function used to test whether a node matches a certain condition.
   * If the function returns true, traversal will stop and return that node.
   *
   * @param node - The current node being evaluated.
   * @param parent - The parent of the current node.
   * @param depth - The depth of the current node in the tree.
   */
  testFn?: (
    node: TInputNode,
    parent: TInputNode | null,
    depth: number
  ) => boolean
}

/**
 * Options for traversing a tree of `UniformNode`s with additional props.
 *
 * @template TChildrenKey - The key in each node that contains child nodes.
 * @template TProps - The additional properties present on each node.
 * @template TInputNode - The type of node in the tree.
 */
interface UniformNodeOptions<
  TChildrenKey extends string,
  TProps extends object = { [key: string]: unknown },
  TInputNode extends UniformNode<TChildrenKey, TProps> = UniformNode<
    TChildrenKey,
    TProps
  >
> {
  /** The key used to access children from a node. */
  childrenKey: TChildrenKey

  /** Whether to deep copy the input tree before processing. */
  copy?: boolean

  /**
   * A function used to test whether a node matches a certain condition.
   *
   * @param node - The current node being evaluated.
   * @param parent - The parent of the current node.
   * @param depth - The depth of the current node in the tree.
   */
  testFn?: (
    node: TInputNode,
    parent: TInputNode | null,
    depth: number
  ) => boolean
}

/**
 * Internal options used by the recursive helper function.
 *
 * @template TChildrenKey - The key used to access children.
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
 * Finds the first node in a tree that satisfies the provided test function.
 * Accepts trees of uniform nodes with extra props.
 *
 * @template TChildrenKey - The key used to access children.
 * @template TProps - The props object attached to each node.
 * @template TInputNode - The type of node.
 * @param tree - The root of the tree to search.
 * @param options - Options for traversal and testing.
 * @returns The first matching node, or undefined if none match.
 */
export function getNode<
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
 * Finds the first node in a tree that satisfies the provided test function.
 * Accepts generic nodes with a customizable children key.
 *
 * @template TChildrenKey - The key used to access children.
 * @template TInputNode - The type of node.
 * @param tree - The root of the tree to search.
 * @param options - Options for traversal and testing.
 * @returns The first matching node, or undefined if none match.
 */
export function getNode<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  tree: TInputNode,
  options: GenericNodeOptions<TChildrenKey>
): TInputNode | undefined

/**
 * Implementation of the `getNode` function overloads.
 */
export function getNode<
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
  const testFn = options?.testFn ?? (() => true)

  const visitedNodesSet = new WeakSet()

  const helperOptions: HelperOptions<TChildrenKey, TInputNode> = {
    childrenKey,
    testFn,
  }

  return getNodeHelper<TChildrenKey, TInputNode>(
    copy ? structuredClone(tree) : tree,
    null,
    0,
    visitedNodesSet,
    helperOptions
  )
}

/**
 * Recursively searches a tree to find a node that satisfies the test function.
 *
 * @template TChildrenKey - The key used to access children.
 * @template TCurrentNode - The type of the current node.
 * @param node - The node to check.
 * @param parent - The parent of the current node.
 * @param depth - The current depth in the tree.
 * @param visited - A WeakSet used to track visited nodes and prevent circular references.
 * @param options - The helper options including the test function and children key.
 * @returns The matching node if found, otherwise undefined.
 */
function getNodeHelper<
  TChildrenKey extends string,
  TCurrentNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  node: TCurrentNode,
  parent: TCurrentNode | null,
  depth: number,
  visited: WeakSet<object>,
  options: HelperOptions<TChildrenKey, TCurrentNode>
): TCurrentNode | undefined {
  const { testFn, childrenKey } = options

  if (visited.has(node)) throw new Error("Circular reference detected")
  visited.add(node)

  if (testFn(node, parent, depth)) {
    return node
  }

  const childrenArray = node[childrenKey] as TCurrentNode[] | undefined

  for (const child of childrenArray ?? []) {
    const subtree = getNodeHelper(child, node, depth + 1, visited, options)
    if (subtree) return subtree
  }

  visited.delete(node)
  return undefined
}
