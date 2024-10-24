import { Node, Tree } from "./types.js";

interface Options {
  testFn: (node: Node) => boolean,
  copy?: boolean,
}

interface Result {
  tree: Tree | null,
  subtree: Tree | null,
}

// Delete the subtree starting at id
// Returns an object like { tree, subtree }
// tree is input tree after bifurcation
// subtree is the subtree that was chopped off
// If id is the root, newtree will be null
// If no matching node is found, subtree will be null

/**
 * 
 * @param tree 
 * @param options 
 * @returns 
 */
export function bifurcate(tree: Tree, options: Options): Result {

  // Destructure options
  const { copy = true, testFn } = options

  if (testFn(tree)) {
    // This node is a match

    return {
      tree: null,
      subtree: copy ? structuredClone(tree) : tree
    }

  } else {
    // This node is not a match

    // Check each child
    for (const child of tree.children) {
      const result = bifurcate(child, options)

      // If this child subtree was biforcated, return
      if (result.tree || result.subtree) {
        return result
      }
    }

    // If we made it this far, a matching node was not found
    return { tree: null, subtree: null }
  }
}