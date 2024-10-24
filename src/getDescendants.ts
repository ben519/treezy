import { Node, Tree } from "./types.js"

interface Options {
  testFn: (node: Node) => boolean
  includeMatchingNode?: boolean,
  copy?: boolean,
}

// Return an array of objects representing the descendants of the specified node
// Each element will have all the attributes of a node EXCEPT the posts array
// If the id is not found in the tree, an error is thrown
// If includeThisPost is true, the target post is included in the result
// The resulting array is ordered like [target, child1, grandchild1, ...]

/**
 * 
 * @param tree 
 * @param options 
 * @returns 
 */
export function getDescendants(tree: Tree, options: Options): Node[] {

  const descendants = getDescendantsHelper(tree, options)

  if (!descendants) {
    throw new Error("Node with condition could not be found")
  }

  return descendants
}

function getDescendantsHelper(tree: Tree, options: Options): Node[] | null {

  // Destructure options
  const { copy = true, testFn, includeMatchingNode = false } = options

  // Is this node a match?
  if (testFn(tree)) {

    // This node is a match
    const descendants: Node[] = []

    // Should we include this node in the result?
    if (includeMatchingNode) {
      descendants.push(tree)
    }

    // Include every child
    for (const child of tree.children) {
      const descs = getDescendantsHelper(child, { ...options, testFn: () => true, includeMatchingNode: true })
      if (descs) descendants.push(...descs)
    }

    return descendants

  } else {

    // Check each child and when we get a non-null response, return early
    for (const child of tree.children) {
      const descs = getDescendantsHelper(child, options)
      if (descs) return descs
    }

    // If we made it here, a match in this tree couldn't be found
    return null
  }
}
