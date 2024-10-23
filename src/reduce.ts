import { Node, Tree } from "./types.js";

interface Options {
  reduceFn: (node: Node, initialVal: any) => any,
  initialVal: any,
}

// Apply a reducer function to a tree to calculate something
// This is useful for calculating a sum, min, or max of some attribute
// reducerFn should be a function like (node, prevVal) = { ... }
// For example, if you want to identify the max number of children in any node,
// reducerFn = (node, val) => { return Math.max(node.posts.length, val) } and initialVal = 0

/**
 * 
 * @param tree 
 * @param options 
 * @returns 
 */
export function reduce(tree: Tree, options: Options): Tree | null {

  // Check options
  if (!Object.hasOwn(options, "reduceFn")) {
    throw new Error("'reduceFn' must be given")
  }
  if (!Object.hasOwn(options, "initialVal")) {
    throw new Error("'initialVal' must be given")
  }

  // Destructure options
  const { reduceFn, initialVal } = options

  // Apply the reduceFn to this node 
  let val = reduceFn(tree, initialVal)

  for (const child of tree.children) {
    val = reduce(child, { reduceFn, initialVal: val })
  }

  return val
}