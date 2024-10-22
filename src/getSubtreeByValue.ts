import { Tree } from "./types.js"

interface Options {
  prop: string,
  value: any,
  strict?: boolean,
  copy?: boolean,
}

/**
 *  Given a tree, extract the subtree starting some node X
 * 
 *  This function can find X in either of two methods:
 *  Scan the tree using Depth First Search Pre-order
 *  At each node
 *  1) Check if the node contains a property with a specific value or
 *  2) Check if the node matches some condition by applying a boolean
 *     function to the node
 * 
 *  If copy is true, return a copy of the subtree; Otherwise return 
 *  the subtree in-place.
 * 
 * @param tree 
 * @param options 
 * @returns 
 */
export function getSubtreeByValue(tree: Tree, options: Options): Tree | null {

  // Check options
  if (!Object.hasOwn(options, "prop")) {
    throw new Error("options is missing the 'prop' property")
  }

  // Destructure options
  const {
    prop,
    value,
    strict = true,
    copy = true,
  } = options

  // Check if this node has the specified property and value
  if (
    (strict && tree[prop as keyof Tree] === value) ||
    (!strict && tree[prop as keyof Tree] == value)
  ) {
    return copy ? structuredClone(tree) : tree
  }

  // Recursively check this node's children
  for (const child of tree.children) {
    const subtree = getSubtreeByValue(child, options)
    if (subtree) return subtree
  }

  // If we made it here, no nodes contain the specified property and value
  return null
}