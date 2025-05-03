import { Node } from "./types.js"

/**
 * Type guard to check if a value is a Node (Tree) with a specified children key.
 *
 * @param value - The value to check.
 * @param childrenKey - The key used to access child nodes (defaults to 'children').
 * @returns True if the value is a valid Node with the specified children key.
 */
export function isTree<TChildrenKey extends string = "children">(
  value: any,
  childrenKey: TChildrenKey = "children" as TChildrenKey
): value is Node<TChildrenKey> {
  if (typeof value !== "object" || value === null) return false

  const children = value[childrenKey]

  if (!Array.isArray(children)) return false

  return children.every((child) => isTree(child, childrenKey))
}
