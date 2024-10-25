import { Node, Tree } from "./types.js";

interface Options {
  getFn: (node: Node, parent?: Node | null, depth?: number | null) => any;
  testFn?: (node: Node, parent?: Node | null, depth?: number | null) => boolean;
  filter?: "ancestors" | "descendants" | "inclusiveAncestors" | "inclusiveDescendants" | "matches";
  firstOnly?: boolean;
  copy?: boolean;
}

export function getValues(tree: Tree, options: Options): any[] {

  // Check options
  if (!Object.hasOwn(options, "getFn")) {
    throw new Error("'getFn' must be given")
  }

  // Destructure options
  const { copy = true } = options ?? {}

  // Call helper function
  const result = getValuesHelper(
    copy ? structuredClone(tree) : tree,
    options,
    null,
    0
  )

  // Return
  return result ?? []
}

function getValuesHelper(
  tree: Tree,
  options: Options,
  parent: Node | null,
  depth: number
): any[] | null {

  // Destructure options
  const {
    getFn,
    testFn = () => true,
    filter = "matches",
    firstOnly = false,
  } = options

  if (testFn(tree, parent, depth)) {
    // The current node passes the test function

    // Exit early?
    if (filter === "ancestors" && firstOnly) {
      return []
    }

    // Exit early?
    if (["inclusiveAncestors", "matches"].includes(filter) && firstOnly) {
      return [getFn(tree, parent, depth)]
    }

    // Array to store values
    const result = []

    if (["inclusiveAncestors", "inclusiveDescendants", "matches"].includes(filter)) {
      result.push(getFn(tree, parent, depth))
    }

    // Iterate over each child of the current node
    for (const child of tree.children) {

      // Recursively call getValuesHelper on this child
      if (["descendants", "inclusiveDescendants"].includes(filter)) {
        const vals = getValuesHelper(child, { ...options, testFn: () => true, filter: "inclusiveDescendants" }, tree, depth + 1)
        if (vals) result.push(...vals)
      } else if (["ancestors", "inclusiveAncestors"].includes(filter)) {
        const vals = getValuesHelper(child, { ...options, filter: "inclusiveAncestors" }, tree, depth + 1)
        if (vals) result.push(...vals)
      } else if (filter === "matches") {
        const vals = getValuesHelper(child, options, tree, depth + 1)
        if (vals) result.push(...vals)
      }
    }

    return result

  } else {
    // The current node doesn't pass the test function

    let foundMatch = false

    // Iterate over each child of the current node
    for (const child of tree.children) {

      // Recursively call getNodesHelper on this child
      const vals = getValuesHelper(child, options, tree, depth + 1)

      // If there was a match..
      if (vals) {
        foundMatch = true
        if (firstOnly) {
          if (["ancestors", "inclusiveAncestors"].includes(filter)) {
            return [getFn(tree, parent, depth), ...vals]
          } else {
            return vals
          }
        }
      }
    }

    return foundMatch ? [getFn(tree, parent, depth)] : null
  }
}
