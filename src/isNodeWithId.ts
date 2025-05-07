import { NodeWithId } from "./types.js"

interface Options<
  TChildrenKey extends string = "children",
  TIdKey extends string = "id"
> {
  childrenKey: TChildrenKey
  idKey: TIdKey
}

export function isNodeWithId<
  TChildrenKey extends string = "children",
  TIdKey extends string = "id",
  TId = string | number | symbol
>(
  value: unknown,
  options?: Options<TChildrenKey, TIdKey>
): value is NodeWithId<TChildrenKey, TIdKey, TId> {
  // Check if value is a non-null object
  if (typeof value !== "object" || value === null) return false

  const obj = value as Record<string, unknown>

  // Check if idKey exists in this node
  const idKey: TIdKey = options?.idKey ?? ("id" as TIdKey)
  if (!(idKey in obj)) return false

  // Get the children of this node
  const childrenKey: TChildrenKey =
    options?.childrenKey ?? ("children" as TChildrenKey)

  const maybeChildren = obj[childrenKey]

  // If the children property doesn't exist, it's still a valid node (a leaf)
  if (maybeChildren === undefined) return true

  // If the children property exists but isn't an array, it's not a valid node
  if (!Array.isArray(maybeChildren)) return false

  // Recursively check that all children are valid nodes
  return maybeChildren.every((child) => isNodeWithId(child, options))
}
