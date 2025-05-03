import { Node } from "./types.js"

/**
 * Configuration options for tree traversal, modification, and node filtering.
 */
interface Options {
  /**
   * Function to apply to matching nodes in the tree.
   * @param node - The current node being modified
   * @param parent - The parent of the current node (if any)
   * @param depth - The depth of the current node in the tree
   */
  applyFn: (node: Node, parent?: Node | null, depth?: number) => any

  /**
   * Function to test each node during traversal.
   * @param node - The current node being tested
   * @param parent - The parent of the current node (if any)
   * @param depth - The depth of the current node in the tree
   * @returns True if the node should be processed, false otherwise
   * @default () => true
   */
  testFn?: (node: Node, parent?: Node | null, depth?: number) => boolean

  /**
   * Determines which nodes to apply the function to relative to matching nodes.
   * - ancestors: Apply to ancestors of matching nodes
   * - descendants: Apply to descendants of matching nodes
   * - inclusiveAncestors: Apply to matching nodes and their ancestors
   * - inclusiveDescendants: Apply to matching nodes and their descendants
   * - matches: Apply only to matching nodes
   * @default "matches"
   */
  filter?:
    | "ancestors"
    | "descendants"
    | "inclusiveAncestors"
    | "inclusiveDescendants"
    | "matches"

  /**
   * When true, stops after applying to the first matching node or set of nodes.
   * @default false
   */
  firstOnly?: boolean

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
 * Applies a function to nodes in a tree based on specified criteria.
 * Traverses the tree and applies the given function to nodes that match
 * the test function, following the specified filter strategy.
 *
 * @param tree - The tree to process
 * @param options - Configuration options for applying the function
 * @returns The processed tree (either modified original or clone)
 * @throws Error if applyFn is not provided in options
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
 * // Double all values in the tree
 * const result = apply(tree, {
 *   applyFn: (node) => { node.value *= 2 },
 *   copy: true
 * });
 *
 * // Double values greater than 2
 * const result = apply(tree, {
 *   applyFn: (node) => { node.value *= 2 },
 *   testFn: (node) => node.value > 2,
 *   filter: "matches"
 * });
 */
export function apply(tree: Node, options: Options): Node {
  // Check options
  if (!Object.hasOwn(options, "applyFn")) {
    throw new Error("'applyFn' must be given")
  }

  // Destructure options
  const { copy = true } = options

  // Call the helper function
  const result = copy ? structuredClone(tree) : tree
  applyHelper(result, options, null, 0)

  // Return
  return result
}

/**
 * Helper function that performs the recursive application of functions to nodes.
 *
 * @param tree - The current tree or subtree being processed
 * @param options - Configuration options for the operation
 * @param parent - The parent node of the current tree (null for root)
 * @param depth - The current depth in the tree (0 for root)
 * @returns True if any modifications were made to this subtree
 *
 * @private This is an internal helper function not meant for direct use
 */
function applyHelper(
  tree: Node,
  options: Options,
  parent: Node | null,
  depth: number
): boolean {
  // Destructure options
  const {
    applyFn,
    testFn = () => true,
    filter = "matches",
    firstOnly = false,
    childrenKey = "children",
  } = options

  // Check for children nodes
  if (!Object.hasOwn(tree, childrenKey)) {
    throw new Error(
      `Children property '${childrenKey}' is missing from at least one node`
    )
  } else if (!Array.isArray(tree[childrenKey])) {
    throw new Error(`Children property '${childrenKey}' should be an array`)
  }

  if (testFn(tree)) {
    // The current node passes the test function

    if (filter === "ancestors") {
      return true
    }

    // Apply the modifier function
    if (filter !== "descendants") {
      applyFn(tree, parent, depth)
    }

    // Exit early?
    if (
      (filter === "matches" && firstOnly) ||
      filter === "inclusiveAncestors"
    ) {
      return true
    }

    // Iterate over each child of the current node
    for (const child of tree[childrenKey]) {
      // Recursively call applyHelper on this child
      if (["descendants", "inclusiveDescendants"].includes(filter)) {
        applyHelper(
          child,
          { ...options, testFn: () => true, filter: "inclusiveDescendants" },
          tree,
          depth + 1
        )
      } else if (filter === "matches") {
        applyHelper(child, options, tree, depth + 1)
      }
    }

    return true
  } else {
    // The current node doesn't pass the test function

    let foundMatch = false

    // Iterate over each child of the current node
    for (const child of tree[childrenKey]) {
      // Recursively call applyHelper on this child
      const subtree = applyHelper(child, options, tree, depth + 1)

      // If there was a match..
      if (subtree) {
        foundMatch = true

        if (firstOnly) {
          return true
        }
      }
    }

    return foundMatch
  }
}
