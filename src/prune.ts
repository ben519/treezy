import { Node, Tree } from "./types.js";

/**
* Configuration options for pruning nodes from a tree
*/
interface Options {
  /**
   * Function to identify nodes that should be removed
   * @param node - The current node being tested
   * @param parent - The parent node of the current node, if any
   * @param depth - The depth of the current node in the tree (0-based)
   * @returns boolean indicating whether this node should be removed
   */
  testFn: (node: Node, parent?: Node | null, depth?: number) => boolean;

  /**
   * Whether to create a deep copy of the tree before modifying.
   * Set to false to modify the original tree.
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
* Removes (prunes) all nodes from a tree that match a given test condition.
* When a node is pruned, all of its descendants are also removed.
* 
* @param tree - The root node of the tree to prune
* @param options - Configuration options for pruning
* @param options.testFn - Function to identify nodes that should be removed
* @param options.copy - Whether to create a deep copy of the tree before modifying (defaults to true)
* 
* @returns The pruned tree, or null if the root node matches the test condition
* 
* @throws {Error} If no testFn is provided in options
* 
* @example
* const tree = {
*   id: 1,
*   type: 'root',
*   children: [{
*     id: 2,
*     type: 'temp',
*     children: [{
*       id: 3,
*       type: 'permanent',
*       children: []
*     }]
*   }]
* };
* 
* // Remove all temporary nodes
* const result1 = prune(tree, {
*   testFn: node => node.type === 'temp'
* });
* // Result keeps root and removes node 2 and its descendants
* 
* // Prune without copying (modifies original tree)
* const result2 = prune(tree, {
*   testFn: node => node.type === 'temp',
*   copy: false
* });
* 
* // If root matches condition, returns null
* const result3 = prune(tree, {
*   testFn: node => node.id === 1
* }); // Returns null
*/
export function prune(tree: Tree, options: Options): Tree | null {

  // Check options
  if (!Object.hasOwn(options, "testFn")) {
    throw new Error("'testFn' must be given")
  }

  // Destructure options
  const { copy = true } = options

  // Call the helper function
  const result = pruneHelper(
    copy ? structuredClone(tree) : tree,
    options ?? {},
    null,
    0
  )

  // Return
  return result
}


/**
* Helper function that recursively traverses the tree to remove matching nodes.
* 
* @param tree - Current node being examined
* @param options - Pruning configuration options
* @param parent - Parent of the current node
* @param depth - Current depth in the tree (0-based)
* @returns The modified tree if this node should be kept, null if it should be removed
* 
* @internal
* This is an internal helper function and should not be called directly.
*/
function pruneHelper(tree: Tree, options: Options, parent: Node | null, depth: number): Tree | null {

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
    return null
  }

  // Prune each child of this node
  for (const [idx, child] of tree[childrenProp].reverse().entries()) {
    const newChild = pruneHelper(child, options, tree, depth + 1)

    // If the returned value is null, delete the child from tree[childrenProp]
    if (newChild === null) {
      tree[childrenProp].splice(idx, 1)
    }
  }

  return tree
}