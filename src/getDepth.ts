import { Tree } from "./types.js"

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
export function getDepth(tree: Tree): number {
  return getDepthHelper(tree, 0)
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
function getDepthHelper(tree: Tree, depth: number = 0): number {

  // Get the depth of each child subtree
  const childDepths = tree.children.map((x) => getDepthHelper(x, depth + 1))

  // Return the depth of the tallest child subtree, or the current depth
  return Math.max(...childDepths, depth)
}