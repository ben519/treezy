import { Tree } from "./types.js";

interface Options {
  prop: string,
}

/**
 * Retrieve the value of some specified property in each node
 * of a tree and return the values in an array.
 * 
 * @param tree 
 * @param options 
 */
export function getValuesInTree(tree: Tree, options: Options): any[] {
  return getValuesHelper(tree, options, [])
}


function getValuesHelper(tree: Tree, options: Options, result: any[]): any[] {

  // Check options
  if (!Object.hasOwn(options, "prop")) {
    throw new Error("options is missing the 'prop' property")
  }

  // Destructure options
  const { prop } = options

  // Append this value
  result.push(tree[prop])

  // Recursively append data from this node's children
  for (const child of tree.children) {
    getValuesHelper(child, options, result)
  }

  return result
}