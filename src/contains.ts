import { Node, Tree } from "./types.js"

interface Options {
  testFn: (node: Node) => boolean
}

/**
 * Check if tree contains at least one node with some condition
 * @param tree A tree
 * @param testFn A function that receives a node and returns true / false
 * @returns true / false
 */
export function contains(tree: Tree, options: Options): boolean {

  // Check options
  if (!Object.hasOwn(options, "testFn")) {
    throw new Error("'testFn' must be given")
  }

  // Destructure options
  const { testFn } = options

  // If this node passes testFn, return true
  if (testFn(tree)) return true

  // Recursively check this node's children
  for (const child of tree.children) {
    if (contains(child, options)) {
      return true
    }
  }

  // If we made it here, no nodes pass testFn
  return false
}