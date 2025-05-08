import { Node } from "./types.js"

interface Options<TChildrenKey extends string> {
  childrenKey: TChildrenKey
}

export function isNode<TChildrenKey extends string>(
  value: unknown,
  options: Options<TChildrenKey>
): value is Node<TChildrenKey> {
  if (typeof value !== "object" || value === null) return false

  // Destructure options
  const { childrenKey } = options

  const obj = value as Record<string, unknown>
  const maybeChildren = obj[childrenKey]

  // If the children property doesn't exist, it's still a valid node (a leaf)
  if (maybeChildren === undefined) return true

  // If the children property exists but isn't an array, it's not a valid node
  if (!Array.isArray(maybeChildren)) return false

  // Recursively check that all children are valid nodes
  return maybeChildren.every((child) => isNode(child, options))
}
