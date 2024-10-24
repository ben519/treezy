import { Node, Tree } from "./types.js";

interface Options {
  copy?: boolean,
  includeDepth?: boolean,
  includeParentFields?: string[] | null,
}

type TreeLike = {
  [key: string]: any;
  children?: Node[];
}

/**
 * Given a tree, flatten it into a 1-D array of nodes 
 * Traverse the tree using depth first search pre-order
 * 
 * @param tree A tree
 * @param options 
 * @returns Array of nodes
 */
export function getNodes(tree: Tree, options?: Options): Object[] {
  return getNodesHelper(tree, options ?? {})
}

function getNodesHelper(
  tree: Tree | TreeLike,
  options: Options,
  depth: number = 0,
  parent: { [key: string]: any } | null = null
): Object[] {

  // Destructure options
  const { copy = true, includeDepth = false, includeParentFields = null } = options

  // Build the current node
  const currentNode = { ...tree }
  delete currentNode["children"]

  // Include depth?
  if (includeDepth) currentNode["_depth"] = depth

  // Include parent fields?
  if (includeParentFields) {
    if (parent === null) {
      currentNode["_parent"] = null
    } else {
      currentNode["_parent"] = {}
      for (const field of includeParentFields) {
        currentNode._parent[field] = parent[field]
      }
    }
  }

  // Recursion
  if (!tree.children || tree.children.length === 0) {
    return [currentNode]
  } else {
    return [
      currentNode,
      ...tree.children.map((x) => getNodesHelper(x, options, depth + 1, currentNode)).flat(1),
    ]
  }
}