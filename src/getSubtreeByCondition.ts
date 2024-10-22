import { Node, Tree } from "./types.js"

interface Options {
  testFn: (node: Node) => boolean,
  copy?: boolean,
}

/**
 *  Given a tree, scan it using Depth First Search Pre-order
 *  and return the subtree starting at the first node that matches
 *  some condition. If no nodes match the condition, return null.
 * 
 *  If copy is true, return a copy of the subtree; Otherwise return 
 *  the subtree in-place.
 * 
 * @param tree 
 * @param options 
 * @returns 
 */
export function getSubtreeByCondition(tree: Tree, options: Options): Tree | null {

  // Check options
  if (!Object.hasOwn(options, "testFn")) {
    throw new Error("'testFn' must be given")
  }

  // Destructure options
  const { testFn, copy = true } = options

  // Check if this node passes testFn
  if (testFn(tree)) {
    return copy ? structuredClone(tree) : tree
  }

  // Recursively check this node's children
  for (const child of tree.children) {
    const subtree = getSubtreeByCondition(child, options)
    if (subtree) return subtree
  }

  // If we made it here, no nodes have the condition
  return null
}