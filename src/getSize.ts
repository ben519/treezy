import { Node, Tree } from "./types.js"

interface Options {
  testFn?: (node: Node) => boolean,
}

/**
 * Get the number of nodes in a tree. 
 * Optionally, only count nodes matching a condition
 * 
 * @param tree A tree object
 * @param options
 * @returns The total number of nodes in the tree
 */
export function getSize(tree: Tree, options?: Options): number {

  const addend = options?.testFn
    ? (options.testFn(tree) ? 1 : 0)
    : 1

  // Return addend + the collective size of each of this tree's children
  const counts = tree.children.map((x) => getSize(x, options))
  return counts.reduce((a, b) => a + b, addend)
}