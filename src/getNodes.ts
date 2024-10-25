import { Node, Tree } from "./types.js";

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
  testFn?: (node: Node, parent?: Node | null, depth?: number | null) => boolean;

  /**
   * Determines which nodes to include in the results relative to matching nodes.
   * - ancestors: Only return ancestors of matching nodes
   * - descendants: Only return descendants of matching nodes
   * - inclusiveAncestors: Return matching nodes and their ancestors
   * - inclusiveDescendants: Return matching nodes and their descendants
   * - matches: Return only the matching nodes
   * @default "matches"
   */
  filter?: "ancestors" | "descendants" | "inclusiveAncestors" | "inclusiveDescendants" | "matches";

  /**
   * When true, stops traversal after finding the first match.
   * @default false
   */
  firstOnly?: boolean;

  /**
   * When true, creates a deep clone of the tree before processing.
   * This prevents modifications from affecting the original tree.
   * @default true
   */
  copy?: boolean;

  /**
   * When true, adds a `_depth` property to each node indicating its depth in the tree.
   * @default false
   */
  includeDepth?: boolean;

  /**
   * When true, adds a `_parent` reference to each node pointing to its parent node.
   * @default false
   */
  includeParent?: boolean;
}

/**
 * Traverses a tree structure and returns nodes based on specified criteria
 * 
 * @param {Tree} tree - The tree to traverse
 * @param {Options} [options] - Configuration options
 * @returns {Node[]} Array of nodes matching the criteria
 * 
 * @example
 * const tree = {
 *   children: [],
 *   value: 'root'
 * };
 * 
 * // Get all nodes
 * const allNodes = getNodes(tree);
 * 
 * // Get nodes with custom test function
 * const matchingNodes = getNodes(tree, {
 *   testFn: (node) => node.value === 'target',
 *   filter: 'descendants'
 * });
 * 
 * @description
 * Filter options:
 * - 'ancestors': Returns ancestors of matching nodes
 * - 'descendants': Returns descendants of matching nodes
 * - 'inclusiveAncestors': Returns matching nodes and their ancestors
 * - 'inclusiveDescendants': Returns matching nodes and their descendants
 * - 'matches': Returns only matching nodes
 */
export function getNodes(tree: Tree, options?: Options): Node[] {

  // Destructure options
  const { copy = true } = options ?? {}

  // Call the helper function
  const result = getNodesHelper(
    copy ? structuredClone(tree) : tree,
    options ?? {},
    null,
    0
  )

  return result?.filter(x => x !== null) ?? []
}


/**
* Helper function for getNodes that performs the recursive traversal
* 
* @private
* @param {Tree} tree - The tree or subtree to traverse
* @param {Options} options - Configuration options
* @param {Node|null} parent - Parent node of the current tree
* @param {number} depth - Current depth in the tree
* @returns {(Node|null)[]|null} Array of matching nodes or null if no matches
*/
function getNodesHelper(
  tree: Tree,
  options: Options,
  parent: Node | null,
  depth: number,
): (Node | null)[] | null {

  // Destructure options
  const {
    testFn = () => true,
    filter = "matches",
    firstOnly = false,
    includeDepth = false,
    includeParent = false
  } = options

  // Include depth and parent?
  if (includeDepth) tree["_depth"] = depth
  if (includeParent) tree["_parent"] = parent

  if (testFn(tree)) {
    // The current node passes the test function

    // Exit early?
    if (filter === "ancestors" && firstOnly) {
      return []
    }

    // Exit early?
    if (["inclusiveAncestors", "matches"].includes(filter) && firstOnly) {
      return [tree]
    }

    // Array to store nodes
    const result = []

    if (["inclusiveAncestors", "inclusiveDescendants", "matches"].includes(filter)) {
      result.push(tree)
    }

    // Iterate over each child of the current node
    for (const child of tree.children) {

      // Recursively call getNodesHelper on this child
      if (["descendants", "inclusiveDescendants"].includes(filter)) {
        const nodes = getNodesHelper(child, { ...options, testFn: () => true, filter: "inclusiveDescendants" }, tree, depth + 1)
        if (nodes) result.push(...nodes)
      } else if (["ancestors", "inclusiveAncestors"].includes(filter)) {
        const nodes = getNodesHelper(child, { ...options, filter: "inclusiveAncestors" }, tree, depth + 1)
        if (nodes) result.push(...nodes)
      } else if (filter === "matches") {
        const nodes = getNodesHelper(child, options, tree, depth + 1)
        if (nodes) result.push(...nodes)
      }
    }

    return result

  } else {
    // The current node doesn't pass the test function

    let foundMatch = false

    // Iterate over each child of the current node
    for (const child of tree.children) {

      // Recursively call getNodesHelper on this child
      const nodes = getNodesHelper(child, options, tree, depth + 1)

      // If there was a match..
      if (nodes) {
        foundMatch = true
        if (firstOnly) {
          if (["ancestors", "inclusiveAncestors"].includes(filter)) {
            return [tree, ...nodes]
          } else {
            return nodes
          }
        }
      }
    }

    return foundMatch ? [tree] : null
  }
}