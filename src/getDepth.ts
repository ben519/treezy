import { Tree } from "./types.js";

/**
* Configuration options for tree traversal.
*/
interface Options {
  /**
   * Name of the array property in tree that stores the child nodes
   * @default "children"
   */
  childrenProp?: string;
}

/**
* Calculates the maximum depth (height) of a tree.
* The root node has depth 0, its children have depth 1, and so on.
* 
* @param tree - The tree to measure
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
export function getDepth(tree: Tree, options?: Options): number {
  return getDepthHelper(tree, options ?? {}, 0)
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
function getDepthHelper(tree: Tree, options: Options, depth: number = 0): number {

  // Destructure options
  const { childrenProp = "children" } = options

  // Check for children nodes
  if (!Object.hasOwn(tree, childrenProp)) {
    throw new Error(`Children property '${ childrenProp }' is missing from at least one node`)
  } else if (!Array.isArray(tree[childrenProp])) {
    throw new Error(`Children property '${ childrenProp }' should be an array`)
  }

  // Get the depth of each child subtree
  const childDepths = tree[childrenProp].map((x: Tree) => getDepthHelper(x, options, depth + 1))

  // Return the depth of the tallest child subtree, or the current depth
  return Math.max(...childDepths, depth)
}