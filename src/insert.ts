import { Node } from "./types.js"

/**
 * Configuration options for inserting a subtree
 */
interface Options {
  /**
   * The tree structure to insert
   */
  subtree: Node

  /**
   * Function to identify the target node
   * @param node - The current node being tested
   * @param parent - The parent node of the current node, if any
   * @param depth - The depth of the current node in the tree (0-based)
   * @returns boolean indicating whether this is the target node
   */
  testFn: (node: Node, parent?: Node | null, depth?: number) => boolean

  /**
   * Where to insert the subtree relative to the matching node
   * @default "below"
   */
  direction?: "after" | "before" | "below"

  /**
   * Whether to create deep copies of both trees before modifying.
   * Set to false to modify the original trees.
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
 * Inserts a subtree into a tree at a position relative to a node matching the given test condition.
 *
 * @param tree - The root node of the tree to modify
 * @param options - Configuration options for inserting the subtree
 * @param options.subtree - The tree structure to insert
 * @param options.testFn - Function to identify the target node
 * @param options.direction - Where to insert relative to the matching node:
 *   - "below": As last child of the matching node (default)
 *   - "before": As previous sibling of the matching node
 *   - "after": As next sibling of the matching node
 * @param options.copy - Whether to create deep copies of both trees before modifying (defaults to true)
 *
 * @returns The modified tree structure
 *
 * @throws {Error} If subtree or testFn is not provided in options
 * @throws {Error} If attempting to insert before/after the root node
 *
 * @example
 * const tree = {
 *   id: 1,
 *   children: [{
 *     id: 2,
 *     children: []
 *   }]
 * };
 *
 * const newSubtree = {
 *   id: 3,
 *   children: []
 * };
 *
 * // Insert as child of node with id 2
 * const result1 = insert(tree, {
 *   subtree: newSubtree,
 *   testFn: node => node.id === 2,
 *   direction: "below"
 * });
 *
 * // Insert before node with id 2
 * const result2 = insert(tree, {
 *   subtree: newSubtree,
 *   testFn: node => node.id === 2,
 *   direction: "before"
 * });
 *
 * // Insert without copying (modifies original tree)
 * const result3 = insert(tree, {
 *   subtree: newSubtree,
 *   testFn: node => node.id === 2,
 *   copy: false
 * });
 */
export function insert(tree: Node, options: Options): Node {
  // Check options
  if (!Object.hasOwn(options, "subtree")) {
    throw new Error("options is missing the 'subtree' property")
  }
  if (!Object.hasOwn(options, "testFn")) {
    throw new Error("options is missing the 'testFn' property")
  }

  // Destructure options
  const { copy = true, subtree } = options ?? {}

  // Run the helper function
  const result = copy
    ? insertHelper(
        structuredClone(tree),
        { ...options, subtree: structuredClone(subtree) },
        null,
        0
      )
    : insertHelper(tree, options, null, 0)

  // Return
  return result ?? (copy ? structuredClone(tree) : tree)
}

/**
 * Helper function that recursively traverses the tree to find the insertion point
 * and perform the insertion.
 *
 * @param tree - Current node being examined
 * @param options - Insertion configuration options
 * @param parent - Parent of the current node
 * @param depth - Current depth in the tree (0-based)
 * @returns The modified tree if insertion occurred in this subtree, null otherwise
 *
 * @internal
 * This is an internal helper function and should not be called directly.
 */
function insertHelper(
  tree: Node,
  options: Options,
  parent: Node | null,
  depth: number
): Node | null {
  // Destructure options
  const {
    subtree,
    testFn,
    direction = "below",
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

  if (direction === "below") {
    // If this node is a match, append subtree to this node's children and return
    if (testFn(tree, parent, depth)) {
      tree[childrenKey].push(subtree)
      return tree
    }

    // Check each child of this node for the matching value
    for (const [idx, child] of tree[childrenKey].entries()) {
      // Recursively call insertHelper() on this child node
      const newChild = insertHelper(child, options, tree, depth + 1)

      if (newChild !== null) {
        // Found the subtree with the matching node

        tree[childrenKey].splice(idx, 1, newChild)
        return tree
      }
    }
  } else if (direction === "before") {
    // If this node has the matching value...
    if (testFn(tree, parent, depth)) {
      throw new Error("Cannot insert subtree before the root of tree")
    }

    // Check each child of this node for the matching value
    for (const [idx, child] of tree[childrenKey].entries()) {
      if (testFn(child, tree, depth + 1)) {
        // Found the matching node

        tree[childrenKey].splice(idx, 0, subtree)
        return tree
      } else {
        // Recursively call insertHelper() on this child node
        const newChild = insertHelper(child, options, tree, depth + 1)

        if (newChild !== null) {
          // Found the subtree with the matching node
          return tree
        }
      }
    }
  } else if (direction === "after") {
    // If this node has the matching value...
    if (testFn(tree, parent, depth)) {
      throw new Error("Cannot insert subtree after the root of tree")
    }

    for (const [idx, child] of tree[childrenKey].entries()) {
      if (testFn(child, tree, depth + 1)) {
        // Found the matching node

        tree[childrenKey].splice(idx + 1, 0, subtree)
        return tree
      } else {
        // Recursively call insertHelper() on this child node
        const newChild = insertHelper(child, options, tree, depth + 1)

        if (newChild !== null) {
          // Found the subtree with the matching node

          return tree
        }
      }
    }
  }

  return null
}
