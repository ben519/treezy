import { Node, Tree } from "./types.js"

interface Options {
  subtree: Tree,
  testFn: (node: Node, parent?: Node | null, depth?: number | null) => boolean,
  direction?: "after" | "before" | "below",
  copy?: boolean,
}

export function insert(tree: Tree, options: Options): Tree {

  // Check options
  if (!Object.hasOwn(options, "subtree")) {
    throw new Error("options is missing the 'subtree' property")
  }
  if (!Object.hasOwn(options, "testFn")) {
    throw new Error("options is missing the 'testFn' property")
  }

  // Destructure options
  const { copy = true, subtree } = options ?? {}

  // Run the helper function
  const result = copy
    ? insertHelper(structuredClone(tree), { ...options, subtree: structuredClone(subtree) }, null, 0)
    : insertHelper(tree, options, null, 0)

  // Return
  return result ?? (copy ? structuredClone(tree) : tree)
}

function insertHelper(
  tree: Tree,
  options: Options,
  parent: Node | null,
  depth: number
): Tree | null {

  // Destructure options
  const { subtree, testFn, direction = "below" } = options

  if (direction === "below") {

    // If this node is a match, append subtree to this node's children and return
    if (testFn(tree, parent, depth)) {
      tree.children.push(subtree)
      return tree
    }

    // Check each child of this node for the matching value
    for (const [idx, child] of tree.children.entries()) {

      // Recursively call insertHelper() on this child node
      const newChild = insertHelper(child, options, tree, depth + 1)

      if (newChild !== null) {
        // Found the subtree with the matching node

        tree.children.splice(idx, 1, newChild)
        return tree

      }
    }
  }

  else if (direction === "before") {

    // If this node has the matching value...
    if (testFn(tree, parent, depth)) {
      throw new Error("Cannot insert subtree before the root of tree")
    }

    // Check each child of this node for the matching value
    for (const [idx, child] of tree.children.entries()) {
      if (testFn(child, tree, depth + 1)) {
        // Found the matching node

        tree.children.splice(idx, 0, subtree)
        return tree

      } else {

        // Recursively call insertHelper() on this child node
        const newChild = insertHelper(child, options, tree, depth + 1)

        if (newChild !== null) {
          // Found the subtree with the matching node
          return tree
        }
      }
    }
  }

  else if (direction === "after") {

    // If this node has the matching value...
    if (testFn(tree, parent, depth)) {
      throw new Error("Cannot insert subtree after the root of tree")
    }

    for (const [idx, child] of tree.children.entries()) {

      if (testFn(child, tree, depth + 1)) {
        // Found the matching node

        tree.children.splice(idx + 1, 0, subtree)
        return tree

      } else {

        // Recursively call insertHelper() on this child node
        const newChild = insertHelper(child, options, tree, depth + 1)

        if (newChild !== null) {
          // Found the subtree with the matching node

          return tree
        }
      }
    }
  }

  return null
}