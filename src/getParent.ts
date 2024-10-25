import { Node, Tree } from "./types.js";

interface Options {
  testFn: (node: Node, parent?: Node | null, depth?: number | null) => boolean;
  copy?: boolean,
}

export function getParent(tree: Tree, options: Options): Node | null {

  // Check options
  if (!Object.hasOwn(options, "testFn")) {
    throw new Error("'testFn' must be given")
  }

  // Destructure options
  const { copy = true } = options

  // Call the helper
  const result = getParentHelper(
    copy ? structuredClone(tree) : tree,
    options,
    null,
    0
  )

  // If a matching node could not be found, throw an error
  if (result === undefined) {
    throw new Error("Node with condition could not be found")
  }

  // Return
  return result
}


function getParentHelper(
  tree: Tree,
  options: Options,
  parent: Node | null,
  depth: number
): Node | null | undefined {

  // Destructure options
  const { testFn } = options

  // If this is the matching node, return null
  if (testFn(tree, parent, depth)) {
    return null
  }

  // If any of this node's children passes the condition, return this node
  if (tree.children.some((x) => testFn(x, parent, depth + 1))) {
    return tree
  }

  // Recursively check each child subtree
  for (const child of tree.children) {
    const parent = getParentHelper(child, options, tree, depth + 1)
    if (parent) return parent
  }
}