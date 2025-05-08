import { NodeWithId } from "./types.js"

interface Options<TChildrenKey extends string, TIdKey extends string> {
  childrenKey: TChildrenKey
  idKey: TIdKey
  checkForCircularReference?: boolean
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
  const { checkForCircularReference = true, childrenKey, idKey } = options
  const seen = checkForCircularReference ? new WeakSet() : undefined

  function check(
    val: unknown,
    visited?: WeakSet<object>
  ): val is NodeWithId<TChildrenKey, TIdKey, TId, TExtraProps> {
    if (typeof val !== "object" || val === null) return false

    const obj = val as Record<string, unknown>

    // Check if idKey exists in this node
    if (!(idKey in obj)) return false

    const maybeChildren = obj[childrenKey]

    // If the children property doesn't exist, it's still a valid node (a leaf)
    if (maybeChildren === undefined) return true

    // If the children property exists but isn't an array, it's not a valid node
    if (!Array.isArray(maybeChildren)) return false

    if (visited) {
      if (visited.has(val)) {
        throw new Error("Circular reference detected in tree.")
      }
      visited.add(val)
    }

    // Recursively check that all children are valid nodes
    return maybeChildren.every((child) => check(child, visited))
  }

  return check(value, seen)
}
