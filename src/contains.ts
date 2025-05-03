import { Node } from "./types.js"

/**
 * Configuration options for tree traversal and node filtering.
 */
interface Options<
  TChildrenKey extends string = "children",
  TExtraProps extends Record<string, unknown> = {}
> {
  /**
   * Function to test whether a node should be counted
   * @param node - The current node being tested
   * @param parent - The parent node of the current node, if any
   * @param depth - The depth of the current node in the tree (0-based)
   * @returns boolean indicating whether this node should be counted
   * @default () => true - counts all nodes if not specified
   */
  testFn: (
    node: Node<TChildrenKey, TExtraProps>,
    parent?: Node<TChildrenKey, TExtraProps> | null,
    depth?: number
  ) => boolean

  /**
   * Name of the array property in tree that stores the child nodes
   * @default "children"
   */
  childrenKey?: TChildrenKey
}

/**
 * Checks if a tree contains any nodes that match the given criteria.
 * Performs a depth-first search of the tree, testing each node against
 * the provided test function.
 *
 * @param tree - The tree to search
 * @param options - Configuration options containing the test function
 * @param options.childrenKey - Optional name of the array property in tree that stores the child nodes
 * @param options.testFn - Function to filter which nodes should be checked
 * @returns True if any node in the tree passes the test function, false otherwise
 * @throws Error if testFn is not provided in options
 *
 * @example
 * const tree = {
 *   value: 1,
 *   children: [
 *     { value: 2, children: [] },
 *     { value: 3, children: [] }
 *   ]
 * };
 *
 * // Check if tree contains a node with value 2
 * const hasTwo = contains(tree, {
 *   testFn: (node) => node.value === 2
 * }); // returns true
 *
 * // Check if tree contains a node with value 4
 * const hasFour = contains(tree, {
 *   testFn: (node) => node.value === 4
 * }); // returns false
 */
export function contains<
  TChildrenKey extends string = "children",
  TExtraProps extends Record<string, unknown> = {},
  TNode extends Node<TChildrenKey, TExtraProps> = Node<
    TChildrenKey,
    TExtraProps
  >
>(tree: TNode, options: Options<TChildrenKey, TExtraProps>): boolean {
  return containsHelper<TChildrenKey, TExtraProps, TNode>(tree, null, 0, {
    childrenKey: "children" as TChildrenKey,
    ...options,
  })
}

/**
 * Recursive helper function that traverses the tree to check matching nodes
 *
 * @param node - Current node being examined
 * @param parent - Parent of the current node
 * @param depth - Current depth in the tree (0-based)
 * @param options - Configuration options for counting nodes
 * @returns Boolean value indicating whether the tree contains X
 *
 * @internal
 * This is an internal helper function and should not be called directly.
 */
function containsHelper<
  TChildrenKey extends string = "children",
  TExtraProps extends Record<string, unknown> = {},
  TNode extends Node<TChildrenKey, TExtraProps> = Node<
    TChildrenKey,
    TExtraProps
  >
>(
  node: TNode,
  parent: TNode | null,
  depth: number,
  options: Required<Options<TChildrenKey, TExtraProps>>
): boolean {
  const { childrenKey, testFn } = options

  // If this node passes testFn, return true
  if (testFn(node, parent, depth)) {
    return true
  }

  // Recursively check this node's children
  for (const child of node[childrenKey]) {
    if (containsHelper(child, node, depth + 1, options)) {
      return true
    }
  }

  // If we made it here, no nodes pass testFn
  return false
}
