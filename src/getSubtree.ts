import { Node, Tree } from "./types.js"

interface Options {
  testFn: (node: Node, parent?: Node | null, depth?: number | null) => boolean,
  copy?: boolean,
}

export function getSubtree(tree: Tree, options: Options): Tree | null {

  // Check options
  if (!Object.hasOwn(options, "testFn")) {
    throw new Error("'testFn' must be given")
  }

  // Destructure options
  const { copy = true } = options

  // Call the helper function
  const result = getSubtreeHelper(
    copy ? structuredClone(tree) : tree,
    options ?? {},
    null,
    0
  )

  // Return
  return result
}


function getSubtreeHelper(
  tree: Tree,
  options: Options,
  parent: Node | null,
  depth: number
): Tree | null {

  // Destructure options
  const { testFn } = options

  // Check if this node passes testFn
  if (testFn(tree, parent, depth)) {
    return tree
  }

  // Recursively check this node's children
  for (const child of tree.children) {
    const subtree = getSubtreeHelper(child, options, tree, depth + 1)
    if (subtree) return subtree
  }

  // If we made it here, no nodes have the condition
  return null
}