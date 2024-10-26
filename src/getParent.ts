import { Node, Tree } from "./types.js";

/**
 * Options for finding a parent node in a tree structure.
 */
interface Options {
  /**
   * Function to test each node in the tree.
   * @param node - The current node being tested
   * @param parent - The parent node of the current node, if any
   * @param depth - The depth of the current node in the tree (0-based)
   * @returns boolean indicating whether this is the target node
   */
  testFn: (node: Node, parent?: Node | null, depth?: number) => boolean;

  /**
   * Whether to create a deep copy of the tree before traversing.
   * @default true
   */
  copy?: boolean;

  /**
   * Name of the array property in tree that stores the child nodes
   * @default "children"
   */
  childrenProp?: string;
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
export function getParent(tree: Tree, options: Options): Node | null {

  // Check options
  if (!Object.hasOwn(options, "testFn")) {
    throw new Error("'testFn' must be given")
  }

  // Destructure options
  const { copy = true } = options

  // Call the helper
  const result = getParentHelper(
    copy ? structuredClone(tree) : tree,
    options,
    null,
    0
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
function getParentHelper(
  tree: Tree,
  options: Options,
  parent: Node | null,
  depth: number
): Node | null | undefined {

  // Destructure options
  const { testFn, childrenProp = "children" } = options

  // Check for children nodes
  if (!Object.hasOwn(tree, childrenProp)) {
    throw new Error(`Children property '${ childrenProp }' is missing from at least one node`)
  } else if (!Array.isArray(tree[childrenProp])) {
    throw new Error(`Children property '${ childrenProp }' should be an array, but it is ${ tree[childrenProp] }`)
  }

  // If this is the matching node, return null
  if (testFn(tree, parent, depth)) {
    return null
  }

  // If any of this node's children passes the condition, return this node
  if (tree[childrenProp].some((x: Tree) => testFn(x, parent, depth + 1))) {
    return tree
  }

  // Recursively check each child subtree
  for (const child of tree[childrenProp]) {
    const parent = getParentHelper(child, options, tree, depth + 1)
    if (parent) return parent
  }
}