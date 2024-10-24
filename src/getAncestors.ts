import { Node, Tree } from "./types.js"

interface Options {
  testFn: (node: Node) => boolean
  includeMatchingNode?: boolean,
  copy?: boolean,
}


/**
 * 
 * @param tree 
 * @param options 
 * @returns 
 */
export function getAncestors(tree: Tree, options: Options): Node[] {

  const ancestors = getAncestorsHelper(tree, options)

  if (!ancestors) {
    throw new Error("Node with condition could not be found")
  }

  return ancestors
}

function getAncestorsHelper(tree: Tree, options: Options): Node[] | null {

  // Destructure options
  const { copy = true, testFn, includeMatchingNode = false } = options

  if (testFn(tree)) {
    // This node is a match

    return includeMatchingNode
      ? [copy ? structuredClone(tree) : tree]
      : []

  } else {
    // This node is not a match

    // Check each child and when we get a non-null response, 
    // insert this node at the beginning of the array, then return it
    for (const child of tree.children) {
      const ancestors = getAncestorsHelper(child, options)
      if (ancestors) {
        ancestors.unshift(copy ? structuredClone(tree) : tree)
        return ancestors
      }
    }

    // If we made it here, a match in this tree couldn't be found
    return null
  }
}
