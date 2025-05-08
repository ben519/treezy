import { NodeWithId } from "./types.js"

interface Options<TChildrenKey extends string, TIdKey extends string> {
  childrenKey: TChildrenKey
  idKey: TIdKey
}

export function isNodeWithId<
  TChildrenKey extends string,
  TIdKey extends string,
  TId = string | number | symbol,
  TExtraProps extends object = { [key: string]: unknown }
>(
  value: unknown,
  options: Options<TChildrenKey, TIdKey>
): value is NodeWithId<TChildrenKey, TIdKey, TId, TExtraProps> {
  // Check if value is a non-null object
  if (typeof value !== "object" || value === null) return false

  const obj = value as Record<string, unknown>

  // Destructure options
  const { childrenKey, idKey } = options

  // Check if idKey exists in this node
  if (!(idKey in obj)) return false

  // Get the children of this node
  const maybeChildren = obj[childrenKey]

  // If the children property doesn't exist, it's still a valid node (a leaf)
  if (maybeChildren === undefined) return true

  // If the children property exists but isn't an array, it's not a valid node
  if (!Array.isArray(maybeChildren)) return false

  // Recursively check that all children are valid nodes
  return maybeChildren.every((child) => isNodeWithId(child, options))
}
