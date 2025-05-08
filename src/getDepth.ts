import { Node } from "./types.js"

/**
 * Options for processing a generic Node tree structure.
 * @template TChildrenKey - The key used to access children nodes (defaults to "children").
 */
interface GenericNodeOptions<TChildrenKey extends string = "children"> {
  /** The property name used to access child nodes in the tree. */
  childrenKey: TChildrenKey
}

/**
 * Internal options used by recursive helper functions.
 * @template TChildrenKey - The key used to access children nodes.
 */
interface HelperOptions<TChildrenKey extends string = "children"> {
  /** The resolved property name used to access child nodes. */
  childrenKey: TChildrenKey
}

/**
 * Calculates the maximum depth of a tree structure.
 *
 * @template TChildrenKey - The key used to access children nodes (defaults to "children").
 * @template TInputNode - The type of node being processed.
 * @param tree - The root node of the tree.
 * @param options - Optional configuration for tree traversal.
 * @returns The maximum depth of the tree (a leaf node at depth 0 returns 0).
 *
 * @example
 * const tree = {
 *   value: "root",
 *   children: [
 *     { value: "child1", children: [] },
 *     { value: "child2", children: [{ value: "grandchild", children: [] }] }
 *   ]
 * };
 * const depth = getDepth(tree); // Returns 2
 */
export function getDepth<
  TChildrenKey extends string = "children",
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(tree: TInputNode, options?: GenericNodeOptions<TChildrenKey>): number {
  // Resolve default options
  const childrenKey: TChildrenKey =
    options?.childrenKey ?? ("children" as TChildrenKey)

  // Prepare options for the recursive helper
  const helperOptions: HelperOptions<TChildrenKey> = {
    childrenKey,
  }

  return getDepthHelper<TChildrenKey>(tree, 0, helperOptions)
}

/**
 * Recursive helper function that calculates the depth of a tree.
 *
 * @template TChildrenKey - The key used to access children nodes.
 * @template TCurrentNode - The type of node being processed in this recursive step.
 * @param node - The current node being processed.
 * @param depth - The current depth in the tree.
 * @param options - Configuration for tree traversal.
 * @returns The maximum depth of the subtree rooted at the current node.
 * @private
 */
function getDepthHelper<
  TChildrenKey extends string = "children",
  TCurrentNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  node: TCurrentNode,
  depth: number,
  options: HelperOptions<TChildrenKey>
): number {
  const { childrenKey } = options

  // Get the children array
  const childrenArray = node[childrenKey] as TCurrentNode[] | undefined

  // If this is a leaf node
  if (!childrenArray || childrenArray.length === 0) {
    return depth
  }

  // Get the depth of each child subtree
  const childDepths = childrenArray.map((child) =>
    getDepthHelper(child, depth + 1, options)
  )

  // Return the maximum depth found
  return Math.max(...childDepths)
}
