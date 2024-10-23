import { Node, Tree } from "./types.js"

/**
 * Check if tree contains at least one node with some condition
 * @param tree A tree
 * @param testFn A function that receives a node and returns true / false
 * @returns true / false
 */
export function contains(tree: Tree, testFn: (node: Node) => boolean): boolean {

  // If this node passes testFn, return true
  if (testFn(tree)) return true

  // Recursively check this node's children
  for (const child of tree.children) {
    if (contains(child, testFn)) {
      return true
    }
  }

  // If we made it here, no nodes pass testFn
  return false
}