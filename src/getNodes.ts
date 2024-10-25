import { Node, Tree } from "./types.js";

interface Options {
  testFn?: (node: Node, parent?: Node | null, depth?: number | null) => boolean,
  filter?: "ancestors" | "descendants" | "inclusiveAncestors" | "inclusiveDescendants" | "matches",
  firstOnly?: boolean,
  copy?: boolean,
  includeDepth?: boolean,
  includeParent?: boolean,
}

/**
 * Given a tree, flatten it into a 1-D array of nodes 
 * Traverse the tree using depth first search pre-order
 * 
 * @param tree A tree
 * @param options 
 * @returns Array of nodes
 */
export function getNodes(tree: Tree, options?: Options): Node[] {

  // Destructure options
  const { copy = true } = options ?? {}

  // Call the helper function
  const result = getNodesHelper(
    copy ? structuredClone(tree) : tree,
    options ?? {},
    null,
    0
  )

  return result?.filter(x => x !== null) ?? []
}

function getNodesHelper(
  tree: Tree,
  options: Options,
  parent: Node | null,
  depth: number,
): (Node | null)[] | null {

  // Destructure options
  const {
    testFn = () => true,
    filter = "matches",
    firstOnly = false,
    includeDepth = false,
    includeParent = false
  } = options

  // Include depth and parent?
  if (includeDepth) tree["_depth"] = depth
  if (includeParent) tree["_parent"] = parent

  if (testFn(tree)) {
    // The current node passes the test function

    // Exit early?
    if (filter === "ancestors" && firstOnly) {
      return []
    }

    // Exit early?
    if (["inclusiveAncestors", "matches"].includes(filter) && firstOnly) {
      return [tree]
    }

    // Array to store nodes
    const result = []

    if (["inclusiveAncestors", "inclusiveDescendants", "matches"].includes(filter)) {
      result.push(tree)
    }

    // Iterate over each child of the current node
    for (const child of tree.children) {

      // Recursively call getNodesHelper on this child
      if (["descendants", "inclusiveDescendants"].includes(filter)) {
        const nodes = getNodesHelper(child, { ...options, testFn: () => true, filter: "inclusiveDescendants" }, tree, depth + 1)
        if (nodes) result.push(...nodes)
      } else if (["ancestors", "inclusiveAncestors"].includes(filter)) {
        const nodes = getNodesHelper(child, { ...options, filter: "inclusiveAncestors" }, tree, depth + 1)
        if (nodes) result.push(...nodes)
      } else if (filter === "matches") {
        const nodes = getNodesHelper(child, options, tree, depth + 1)
        if (nodes) result.push(...nodes)
      }
    }

    return result

  } else {
    // The current node doesn't pass the test function

    let foundMatch = false

    // Iterate over each child of the current node
    for (const child of tree.children) {

      // Recursively call getNodesHelper on this child
      const nodes = getNodesHelper(child, options, tree, depth + 1)

      // If there was a match..
      if (nodes) {
        foundMatch = true
        if (firstOnly) {
          if (["ancestors", "inclusiveAncestors"].includes(filter)) {
            return [tree, ...nodes]
          } else {
            return nodes
          }
        }
      }
    }

    return foundMatch ? [tree] : null
  }
}