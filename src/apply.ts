import { Node, Tree } from "./types.js";

interface Options {
  applyFn: (node: Node, parent?: Node | null, depth?: number | null) => any,
  testFn?: (node: Node, parent?: Node | null, depth?: number | null) => boolean,
  filter?: "ancestors" | "descendants" | "inclusiveAncestors" | "inclusiveDescendants" | "matches",
  firstOnly?: boolean,
  copy?: boolean,
}

/**
 * 
 * @param tree 
 * @param options 
 * @returns 
 */
export function apply(tree: Tree, options: Options): Tree {

  // Check options
  if (!Object.hasOwn(options, "applyFn")) {
    throw new Error("'applyFn' must be given")
  }

  // Destructure options
  const { copy = true } = options

  // Call the helper function
  const result = copy ? structuredClone(tree) : tree
  applyHelper(result, options, null, 0)

  // Return
  return result
}

function applyHelper(
  tree: Tree,
  options: Options,
  parent: Node | null,
  depth: number,
): boolean {

  // Destructure options
  const {
    applyFn,
    testFn = () => true,
    filter = "matches",
    firstOnly = false,
  } = options

  if (testFn(tree)) {
    // The current node passes the test function

    if (filter === "ancestors") {
      return true
    }

    // Apply the modifier function
    if (filter !== "descendants") {
      applyFn(tree, parent, depth)
    }

    // Exit early?
    if ((filter === "matches" && firstOnly) || filter === "inclusiveAncestors") {
      return true
    }

    // Iterate over each child of the current node
    for (const child of tree.children) {

      // Recursively call applyHelper on this child
      if (["descendants", "inclusiveDescendants"].includes(filter)) {
        applyHelper(child, { ...options, testFn: () => true, filter: "inclusiveDescendants" }, tree, depth + 1)
      } else if (filter === "matches") {
        applyHelper(child, options, tree, depth + 1)
      }
    }

    return true

  } else {
    // The current node doesn't pass the test function

    let foundMatch = false

    // Iterate over each child of the current node
    for (const child of tree.children) {

      // Recursively call applyHelper on this child
      const subtree = applyHelper(child, options, tree, depth + 1)

      // If there was a match..
      if (subtree) {
        foundMatch = true

        if (firstOnly) {
          return true
        }
      }
    }

    return foundMatch
  }
}