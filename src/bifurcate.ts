import { Node } from "./types.js"

/**
 * Configuration options for tree traversal and node filtering.
 */
interface Options {
  /**
   * Function to test each node during traversal.
   * @param node - The current node being tested
   * @param parent - The parent of the current node (if any)
   * @param depth - The depth of the current node in the tree
   * @returns True if the node passes the test, false otherwise
   * @default () => true
   */
  testFn: (node: Node, parent?: Node | null, depth?: number) => boolean

  /**
   * Whether to create a deep copy of the tree before modifying.
   * Set to false to modify the original tree.
   * @default true
   */
  copy?: boolean

  /**
   * Name of the array property in tree that stores the child nodes
   * @default "children"
   */
  childrenKey?: string
}

/**
 * Result of a tree bifurcation operation.
 */
interface Result {
  /** The remaining tree after removing the matching subtree */
  tree: Node | null
  /** The first subtree that matches the test criteria */
  subtree: Node | null
}

/**
 * Separates a tree into two parts based on a test function.
 * Traverses the tree depth-first, pre-order until finding a node that matches the test function,
 * then bifurcates the tree at that node and returns and object with the resulting two subtrees.
 *
 * @param tree - The tree to bifurcate
 * @param options - Configuration options for the bifurcation
 * @returns An object containing the remaining tree and the matching subtree (one may be null)
 *
 * @example
 * const tree = {
 *   value: 'root',
 *   children: [
 *     { value: 'A', children: [] },
 *     { value: 'B', children: [] }
 *   ]
 * };
 *
 * const result = bifurcate(tree, {
 *   testFn: (node) => node.value === 'B',
 *   copy: true
 * });
 * // result.subtree will be the node with value 'B'
 * // result.tree will be tree excluding the node with value 'B'
 */
export function bifurcate(tree: Node, options: Options): Result {
  // Destructure options
  const { copy = true } = options ?? {}

  // Call the helper function
  const result = bifurcateHelper(
    copy ? structuredClone(tree) : tree,
    options,
    null,
    0
  )

  // Return
  return result
}

/**
 * Helper function that performs the recursive bifurcation operation.
 *
 * @param tree - The current tree or subtree being processed
 * @param options - Configuration options for the bifurcation
 * @param parent - The parent node of the current tree (null for root)
 * @param depth - The current depth in the tree (0 for root)
 * @returns Result object containing the split tree parts
 *
 * @private This is an internal helper function not meant for direct use
 */
function bifurcateHelper(
  tree: Node,
  options: Options,
  parent: Node | null,
  depth: number
): Result {
  // Destructure options
  const { testFn, childrenKey = "children" } = options

  // Check for children nodes
  if (!Object.hasOwn(tree, childrenKey)) {
    throw new Error(
      `Children property '${childrenKey}' is missing from at least one node`
    )
  } else if (!Array.isArray(tree[childrenKey])) {
    throw new Error(`Children property '${childrenKey}' should be an array`)
  }

  if (testFn(tree, parent, depth)) {
    // This node is a match

    return { tree: null, subtree: tree }
  } else {
    // This node is not a match

    // Check each child
    for (const [idx, child] of tree[childrenKey].entries()) {
      const result = bifurcateHelper(child, options, tree, depth + 1)

      // If this child subtree was bifurcated, return
      if (result.subtree) {
        tree[childrenKey].splice(idx, 1)
        result.tree = tree
        return result
      }
    }

    // If we made it this far, a matching node was not found
    return { tree: null, subtree: null }
  }
}
