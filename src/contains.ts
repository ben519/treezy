import { Node, UniformNode } from "./types.js"

/**
 * Configuration options for performing a "contains" check on a generic node tree.
 * @template TChildrenKey - The key used to access child nodes.
 * @template TInputNode - The node type used for traversal.
 */
interface GenericNodeOptions<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
> {
  /** The property name that contains child nodes */
  childrenKey: TChildrenKey

  /**
   * Function to determine if a node matches the condition
   * @param node - The current node being tested.
   * @param parent - The parent of the current node.
   * @param depth - The depth of the current node in the tree.
   * @returns true if the node matches, false otherwise.
   */
  testFn: (
    node: TInputNode,
    parent: TInputNode | null,
    depth: number
  ) => boolean
}

/**
 * Configuration options for performing a "contains" check on a uniform node tree.
 * @template TChildrenKey - The key used to access child nodes.
 * @template TProps - Additional properties that may be present on nodes.
 * @template TInputNode - The node type used for traversal.
 */
interface UniformNodeOptions<
  TChildrenKey extends string,
  TProps extends object = { [key: string]: unknown },
  TInputNode extends UniformNode<TChildrenKey, TProps> = UniformNode<
    TChildrenKey,
    TProps
  >
> {
  /** The property name that contains child nodes */
  childrenKey: TChildrenKey

  /**
   * A test function to determine if a node matches the condition.
   * @param node - The current node being tested.
   * @param parent - The parent of the current node.
   * @param depth - The depth of the current node in the tree.
   * @returns true if the node matches, false otherwise.
   */
  testFn: (
    node: TInputNode,
    parent: TInputNode | null,
    depth: number
  ) => boolean
}

/**
 * Internal helper options for the recursive contains function.
 * @template TChildrenKey - The key used to access child nodes.
 * @template TCurrentNode - The current node type.
 */
interface ContainsHelperOptions<
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
 * Determines whether any node in the tree matches the given test function.
 * Supports both generic and uniform node types.

 * @template TChildrenKey - The key used to access child nodes.
 * @template TProps - Optional additional node properties.
 * @template TInputNode - The root node type.
 *
 * @param tree - The root node of the tree.
 * @param options - Configuration including the test function and children key.
 * @returns true if any node matches the condition, false otherwise.
 */
export function contains<
  TChildrenKey extends string,
  TProps extends object = { [key: string]: unknown },
  TInputNode extends UniformNode<TChildrenKey, TProps> = UniformNode<
    TChildrenKey,
    TProps
  >
>(
  tree: TInputNode,
  options: UniformNodeOptions<TChildrenKey, TProps, TInputNode>
): boolean

export function contains<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(tree: TInputNode, options: GenericNodeOptions<TChildrenKey>): boolean

export function contains<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  tree: TInputNode,
  options:
    | GenericNodeOptions<TChildrenKey, TInputNode>
    | UniformNodeOptions<TChildrenKey, any, TInputNode>
): boolean {
  const childrenKey = options.childrenKey
  const testFn = options.testFn
  const visitedNodesSet = new WeakSet()

  const helperOptions: ContainsHelperOptions<TChildrenKey, TInputNode> = {
    childrenKey,
    testFn,
  }

  return containsHelper<TChildrenKey, TInputNode>(
    tree,
    null,
    0,
    visitedNodesSet,
    helperOptions
  )
}

/**
 * Recursively traverses the node tree to determine if any node satisfies the test function.
 *
 * @template TChildrenKey - The key used to access child nodes.
 * @template TCurrentNode - The current node type during traversal.
 *
 * @param node - The current node being visited.
 * @param parent - The parent of the current node.
 * @param depth - Current depth in the tree.
 * @param visited - A set to track visited nodes and prevent circular references.
 * @param options - Helper options including children key and test function.
 * @returns true if any node matches the condition, false otherwise.
 * @throws Error if a circular reference is detected.
 */
function containsHelper<
  TChildrenKey extends string,
  TCurrentNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  node: TCurrentNode,
  parent: TCurrentNode | null,
  depth: number,
  visited: WeakSet<object>,
  options: ContainsHelperOptions<TChildrenKey, TCurrentNode>
): boolean {
  const { childrenKey, testFn } = options

  if (visited.has(node)) throw new Error("Circular reference detected")
  visited.add(node)

  if (testFn(node, parent, depth)) {
    return true
  }

  const childrenArray = node[childrenKey] as TCurrentNode[] | undefined
  for (const childNode of childrenArray ?? []) {
    if (containsHelper(childNode, node, depth + 1, visited, options)) {
      return true
    }
  }

  visited.delete(node)
  return false
}
