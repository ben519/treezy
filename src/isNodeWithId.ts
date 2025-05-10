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
  const { childrenKey, idKey } = options
  const visitedNodesSet = new WeakSet()

  function check(
    val: unknown,
    visited: WeakSet<object>
  ): val is NodeWithId<TChildrenKey, TIdKey, TId, TExtraProps> {
    if (typeof val !== "object" || val === null) return false

    // Check if this node has already been visited
    if (visited.has(val)) {
      throw new Error("Circular reference detected")
    }
    visited.add(val)

    // Check if idKey exists in this node
    if (!(idKey in val)) return false

    // Make sure children is undefined or an array
    const obj = val as Record<string, unknown>
    const maybeChildren = obj[childrenKey]
    if (maybeChildren === undefined) return true
    if (!Array.isArray(maybeChildren)) return false

    // Recursively check the children
    const result = maybeChildren.every((child) => check(child, visited))

    // Remove this node from visited
    visited.delete(val)

    return result
  }

  return check(value, visitedNodesSet)
}
