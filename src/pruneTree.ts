import { Node, Tree } from "./types.js";

interface Options {
  testFn: (node: Node) => boolean,
  copy?: boolean,
}

// Return a pruned copy of the given tree by testing each node with the provided function
// If a node fails the test (i.e. the test is true), it and all of its children will be removed
// If the root is removed, return null


/**
 * 
 * @param tree 
 * @param options 
 * @returns 
 */
export function pruneTree(tree: Tree, options: Options): Tree | null {

  // Check options
  if (!Object.hasOwn(options, "testFn")) {
    throw new Error("'testFn' must be given")
  }

  // Destructure options
  const { testFn, copy = true } = options

  // Check if this node passes testFn
  if (testFn(tree)) {
    return null
  }

  // Build an array to store this node's children after pruning
  const newChildren = []

  // Prune each child of this node
  for (const child of tree.children) {
    const newChild = pruneTree(child, options)

    // If the returned value is not null, add it to newChildren
    if (newChild) {
      newChildren.push(newChild)
    }
  }

  if (copy) {
    return { ...tree, children: newChildren }
  } else {
    tree.children = newChildren
    return tree
  }
}