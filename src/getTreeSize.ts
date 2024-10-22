import { Tree } from "./types.js"


/**
 * Get the size of a tree
 * @param tree A tree object
 * @returns The total number of nodes in the tree
 */
export function getTreeSize(tree: Tree): number {

  // Return 1 + the collective size of each of this tree's children
  return tree.children.map((x) => getTreeSize(x)).reduce((a, b) => a + b, 1)
}