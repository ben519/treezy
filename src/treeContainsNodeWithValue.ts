import { Tree } from "./types.js";

interface Options {
  prop: string,
  value: any,
  strict?: boolean;
}

/**
 * Check if tree contains at least one node with a specified property and value
 * @param tree A tree
 * @param options An object containing the prop name and value
 * @returns true / false
 */
export function treeContainsNodeWithValue(tree: Tree, options: Options): boolean {

  // Check options
  if (!Object.hasOwn(options, "prop")) {
    throw new Error("options is missing the 'prop' property")
  }

  // Destructure options
  const { prop, value, strict = true } = options

  // If this node has the matching id, return true
  if (
    (strict && tree[prop as keyof Tree] === value) ||
    (!strict && tree[prop as keyof Tree] == value)
  ) { return true }

  // Recursively check this node's children
  for (const child of tree.children) {
    if (treeContainsNodeWithValue(child, { prop, value, strict })) {
      return true
    }
  }

  // If we made it here, no nodes contain the specified property and value
  return false
}