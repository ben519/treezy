import { Tree } from "./types.js"


/**
 * Get the depth of a tree
 * 
 * @param tree A tree object
 * @returns The maximum number of edges from the root node to any leaf node in the tree
 */
export function getTreeDepth(tree: Tree): number {
  return getTreeDepthHelper(tree, 0)
}

/**
* Get the depth of a tree
 * @param tree A tree object
 * @param depth (For internal use) Initial depth of the given subtree
 * @returns The maximum number of edges from the root node to any leaf node in the tree
 */
function getTreeDepthHelper(tree: Tree, depth: number = 0): number {

  // Get the depth of each child subtree
  const childDepths = tree.children.map((x) => getTreeDepthHelper(x, depth + 1))

  // Return the depth of the tallest child subtree, or the current depth
  return Math.max(...childDepths, depth)
}