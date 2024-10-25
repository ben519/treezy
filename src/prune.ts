import { Node, Tree } from "./types.js";

interface Options {
  testFn: (node: Node, parent?: Node | null, depth?: number | null) => boolean,
  copy?: boolean,
}

export function prune(tree: Tree, options: Options): Tree | null {

  // Check options
  if (!Object.hasOwn(options, "testFn")) {
    throw new Error("'testFn' must be given")
  }

  // Destructure options
  const { copy = true } = options

  // Call the helper function
  const result = pruneHelper(
    copy ? structuredClone(tree) : tree,
    options ?? {},
    null,
    0
  )

  // Return
  return result
}

function pruneHelper(tree: Tree, options: Options, parent: Node | null, depth: number): Tree | null {

  // Destructure options
  const { testFn } = options

  // Check if this node passes testFn
  if (testFn(tree, parent, depth)) {
    return null
  }

  // Prune each child of this node
  for (const [idx, child] of tree.children.reverse().entries()) {
    const newChild = pruneHelper(child, options, tree, depth + 1)

    // If the returned value is null, delete the child from tree.children
    if (newChild === null) {
      tree.children.splice(idx, 1)
    }
  }

  return tree
}