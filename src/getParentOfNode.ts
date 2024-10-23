import { Node, Tree } from "./types.js"

interface Options {
  testFn: (node: Node) => boolean
  copy?: boolean,
}

export function getParentOfNode(tree: Tree, options: Options): Node | null {
  // Find the given id in tree and return the entire subtree starting at parent
  // If id is at the root, return null
  // If id is not found, throw an error

  const { testFn, copy = true } = options

  // If this is the matching node, return null
  if (testFn(tree)) {
    return null
  }

  // If any of this node's children passes the condition, return this node
  if (tree.children.some((x) => testFn(x))) {
    return copy ? { ...tree } : tree
  }

  // Recursively check each child subtree
  for (const child of tree.children) {
    const parent = getParentOfNode(child, options)
    if (parent) return parent
  }

  // If a matching node could not be found, throw an error
  throw new Error("node with condition could not be found")
}
