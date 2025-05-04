import { Node } from "./types.js"

/**
 * Configuration options for tree traversal and node filtering.
 */
interface Options<
  TChildrenKey extends string = "children",
  TExtraProps extends Record<string, unknown> = {}
> {
  /**
   * Function to test each node in the tree.
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
   * Whether to create a deep copy of the tree before traversing.
   * Set to false to return a reference to the parent node in the original tree.
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
 * Finds the parent node of a node matching the given test condition in a tree structure.
 *
 * @param tree - The root node of the tree to search
 * @param options - Configuration options for the search
 * @param options.testFn - Function to identify the target node
 * @param options.copy - Whether to create a deep copy of the tree before searching (defaults to true)
 *
 * @returns The parent node of the matching node, or null if the matching node is the root
 *
 * @throws {Error} If no testFn is provided in options
 * @throws {Error} If no node matching the test condition is found
 *
 * @example
 * const tree = {
 *   value: 'root',
 *   children: [{
 *     value: 'child',
 *     children: []
 *   }]
 * };
 *
 * // Find parent of node with value 'child'
 * const parent = getParent(tree, {
 *   testFn: (node) => node.value === 'child'
 * });
 */
export function getParent<
  TChildrenKey extends string = "children",
  TExtraProps extends Record<string, unknown> = {},
  TNode extends Node<TChildrenKey, TExtraProps> = Node<
    TChildrenKey,
    TExtraProps
  >
>(tree: TNode, options: Options<TChildrenKey, TExtraProps>): TNode | null {
  const node = options?.copy === false ? tree : structuredClone(tree)
  const result = getParentHelper<TChildrenKey, TExtraProps, TNode>(
    node,
    null,
    0,
    {
      childrenKey: "children" as TChildrenKey,
      copy: false,
      ...options,
    }
  )

  // If a matching node could not be found, throw an error
  if (result === undefined) {
    throw new Error("Node with condition could not be found")
  }

  // Return
  return result
}

/**
 * Helper function that recursively traverses the tree to find a parent node.
 *
 * @param tree - Current node being examined
 * @param options - Search configuration options
 * @param parent - Parent of the current node
 * @param depth - Current depth in the tree (0-based)
 *
 * @returns
 * - The parent node if found in this subtree
 * - null if the matching node is found (indicating it's the target node)
 * - undefined if no matching node is found in this subtree
 *
 * @internal
 * This is an internal helper function and should not be called directly.
 */
function getParentHelper<
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
): TNode | null | undefined {
  const { childrenKey, testFn } = options

  // If this is the matching node, return null
  if (testFn(node, parent, depth)) {
    return null
  }

  // If any of this node's children passes the condition, return this node
  if (node[childrenKey].some((x) => testFn(x, parent, depth + 1))) {
    return node
  }

  // Recursively check each child subtree
  for (const child of node[childrenKey]) {
    const parent = getParentHelper<TChildrenKey, TExtraProps, TNode>(
      child as TNode,
      node,
      depth + 1,
      options
    )
    if (parent) return parent
  }
}
