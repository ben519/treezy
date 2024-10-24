import { Node, Tree } from "./types.js";

interface Options {
  applyFn: (node: Node, parent?: Node | null) => any,
  testFn?: (node: Node) => boolean,
  filter?: "all" | "first" | "allSubtrees" | "firstSubtree",
  copy?: boolean,
}

export function apply(tree: Tree, options: Options): Tree {

  // Check options
  if (!Object.hasOwn(options, "applyFn")) {
    throw new Error("'applyFn' must be given")
  }

  // Destructure options
  const { copy = true } = options

  // Call the helper function
  const result = applyHelper(copy ? structuredClone(tree) : tree, options, null)

  // Return
  return result ?? (copy ? structuredClone(tree) : tree)
}

function applyHelper(tree: Tree, options: Options, parent: Node | null): Tree | null {

  // Destructure options
  const { applyFn, testFn = () => true, filter = "all" } = options

  if (testFn(tree)) {
    // The current node passes the test function

    // Apply the modifier function
    applyFn(tree, parent)

    // Exit early if filter is "first"
    if (filter === "first") return tree

    // Iterate over each child of the current node
    for (const [idx, child] of tree.children.entries()) {

      // Recursively call applyHelper on this child
      const subtree = ["firstSubtree", "allSubtrees"].includes(filter)
        ? applyHelper(child, { ...options, testFn: () => true }, tree)
        : applyHelper(child, options, tree)

      // If the subtree was modified, update this child of tree
      if (subtree) tree.children[idx] = subtree
    }

    return tree

  } else {
    // The current node doesn't pass the test function

    let foundMatch = false

    // Iterate over each child of the current node
    for (const [idx, child] of tree.children.entries()) {

      // Recursively call apply on this child
      const subtree = applyHelper(child, options, tree)

      // If there was a match..
      if (subtree) {

        // Update stuff
        foundMatch = true
        tree.children[idx] = subtree

        // Exit early?
        if (["first", "firstSubtree"].includes(filter)) {
          return tree
        }
      }
    }

    return foundMatch ? tree : null
  }
}