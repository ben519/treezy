import { Node } from "./types.js"

/**
 * Configuration options for tree traversal.
 */
interface Options<TChildrenKey extends string = "children"> {
  /**
   * Name of the array property in tree that stores the child nodes
   * @default "children"
   */
  childrenKey?: TChildrenKey
}

/**
 * Calculates the maximum depth (height) of a tree.
 * The root node has depth 0, its children have depth 1, and so on.
 *
 * @param tree - The tree to measure
 * @param options - Configuration options containing the test function
 * @param options.childrenKey - Optional name of the array property in tree that stores the child nodes
 * @returns The maximum depth of any leaf node in the tree
 *
 * @example
 * const tree = {           // depth 0
 *   children: [
 *     { children: [] },    // depth 1
 *     { children: [        // depth 1
 *       { children: [] }   // depth 2
 *     ]}
 *   ]
 * };
 *
 * const depth = getDepth(tree); // returns 2
 */
export function getDepth<
  TChildrenKey extends string = "children",
  TNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(tree: TNode, options?: Options<TChildrenKey>): number {
  return getDepthHelper<TChildrenKey>(tree, 0, {
    childrenKey: "children" as TChildrenKey,
    ...options,
  })
}

/**
 * Recursive helper function that calculates tree depth.
 * Traverses the tree depth-first, tracking the current depth
 * and finding the maximum depth among all paths.
 *
 * @param tree - The current tree or subtree being measured
 * @param depth - The current depth in the traversal
 * @returns The maximum depth found in this subtree
 *
 * @private This is an internal helper function not meant for direct use
 */
function getDepthHelper<
  TChildrenKey extends string = "children",
  TNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  tree: TNode,
  depth: number = 0,
  options: Required<Options<TChildrenKey>>
): number {
  // Destructure options
  const { childrenKey } = options

  // Get the depth of each child subtree
  const childDepths = tree[childrenKey].map((x) =>
    getDepthHelper(x, depth + 1, options)
  )

  // Return the depth of the tallest child subtree, or the current depth
  return Math.max(...childDepths, depth)
}
