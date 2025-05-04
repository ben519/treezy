import { Node } from "./types.js"

/**
 * Configuration options for finding a subtree
 */
interface Options<
  TChildrenKey extends string = "children",
  TExtraProps extends Record<string, unknown> = {}
> {
  /**
   * Function to test each node in the tree
   * @param node - The current node being tested
   * @param parent - The parent node of the current node, if any
   * @param depth - The depth of the current node in the tree (0-based)
   * @returns boolean indicating whether this is the target node
   */
  testFn: (
    node: Node<TChildrenKey, TExtraProps>,
    parent?: Node<TChildrenKey, TExtraProps> | null,
    depth?: number
  ) => boolean

  /**
   * Whether to create a deep copy of the tree before searching.
   * Set to false to modify the original tree.
   * @default true
   */
  copy?: boolean

  /**
   * Name of the array property in tree that stores the child nodes
   * @default "children"
   */
  childrenKey?: TChildrenKey
}

/**
 * Finds and returns the first subtree in a tree structure where the root node matches
 * the given test condition.
 *
 * @param tree - The root node of the tree to search
 * @param options - Configuration options for finding the subtree
 * @param options.testFn - Function to identify the target node
 * @param options.copy - Whether to create a deep copy of the tree before searching (defaults to true)
 *
 * @returns The matching subtree, or null if no matching node is found
 *
 * @throws {Error} If no testFn is provided in options
 *
 * @example
 * const tree = {
 *   value: 'root',
 *   children: [{
 *     value: 'target',
 *     children: [{
 *       value: 'child',
 *       children: []
 *     }]
 *   }]
 * };
 *
 * // Find subtree with root value 'target'
 * const subtree = getSubtree(tree, {
 *   testFn: (node) => node.value === 'target'
 * });
 * // Returns the 'target' node and all its descendants
 *
 * // Use without copying (modifies original tree)
 * const subtree = getSubtree(tree, {
 *   testFn: (node) => node.value === 'target',
 *   copy: false
 * });
 */
export function getSubtree<
  TChildrenKey extends string = "children",
  TExtraProps extends Record<string, unknown> = {},
  TNode extends Node<TChildrenKey, TExtraProps> = Node<
    TChildrenKey,
    TExtraProps
  >
>(tree: TNode, options: Options<TChildrenKey, TExtraProps>): TNode | null {
  const node = options?.copy === false ? tree : structuredClone(tree)
  return getSubtreeHelper(node, null, 0, {
    childrenKey: "children" as TChildrenKey,
    copy: false,
    ...options,
  })
}

/**
 * Helper function that recursively traverses the tree to find a matching subtree.
 *
 * @param tree - Current node being examined
 * @param options - Search configuration options
 * @param parent - Parent of the current node
 * @param depth - Current depth in the tree (0-based)
 * @returns The matching subtree if found in this branch, null otherwise
 *
 * @internal
 * This is an internal helper function and should not be called directly.
 */
function getSubtreeHelper<
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
): TNode | null {
  const { testFn, childrenKey } = options

  // Check if this node passes testFn
  if (testFn(node, parent, depth)) {
    return node
  }

  // Recursively check this node's children
  for (const child of node[childrenKey]) {
    const subtree = getSubtreeHelper(child as TNode, node, depth + 1, options)
    if (subtree) return subtree
  }

  // If we made it here, no nodes have the condition
  return null
}
