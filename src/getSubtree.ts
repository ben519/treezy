import { Node, Tree } from "./types.js";

/**
* Configuration options for finding a subtree
*/
interface Options {
  /**
   * Function to test each node in the tree
   * @param node - The current node being tested
   * @param parent - The parent node of the current node, if any
   * @param depth - The depth of the current node in the tree (0-based)
   * @returns boolean indicating whether this is the target node
   */
  testFn: (node: Node, parent?: Node | null, depth?: number) => boolean;

  /**
   * Whether to create a deep copy of the tree before searching.
   * Set to false if you want to modify the original tree.
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
export function getSubtree(tree: Tree, options: Options): Tree | null {

  // Check options
  if (!Object.hasOwn(options, "testFn")) {
    throw new Error("'testFn' must be given")
  }

  // Destructure options
  const { copy = true } = options

  // Call the helper function
  const result = getSubtreeHelper(
    copy ? structuredClone(tree) : tree,
    options ?? {},
    null,
    0
  )

  // Return
  return result
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
function getSubtreeHelper(
  tree: Tree,
  options: Options,
  parent: Node | null,
  depth: number
): Tree | null {

  // Destructure options
  const { testFn, childrenProp = "children" } = options

  // Check for children nodes
  if (!Object.hasOwn(tree, childrenProp)) {
    throw new Error(`Children property '${ childrenProp }' is missing from at least one node`)
  } else if (!Array.isArray(tree[childrenProp])) {
    throw new Error(`Children property '${ childrenProp }' should be an array`)
  }

  // Check if this node passes testFn
  if (testFn(tree, parent, depth)) {
    return tree
  }

  // Recursively check this node's children
  for (const child of tree[childrenProp]) {
    const subtree = getSubtreeHelper(child, options, tree, depth + 1)
    if (subtree) return subtree
  }

  // If we made it here, no nodes have the condition
  return null
}