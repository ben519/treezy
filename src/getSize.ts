import { Node, Tree } from "./types.js"

interface Options {
  testFn?: (node: Node, parent?: Node | null, depth?: number | null) => boolean
}

export function getSize(tree: Tree, options?: Options): number {
  return getSizeHelper(tree, null, 0, options ?? {})
}

function getSizeHelper(
  tree: Tree,
  parent: Node | null,
  depth: number,
  options: Options,
): number {

  // Destructure
  const { testFn = () => true } = options ?? {}

  // Count this node?
  const addend = testFn(tree, parent, depth) ? 1 : 0

  // Return addend + the collective size of each of this tree's children
  const counts = tree.children.map((x) => getSizeHelper(x, tree, depth + 1, options))
  return counts.reduce((a, b) => a + b, addend)
}