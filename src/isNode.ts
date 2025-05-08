import { Node } from "./types.js"

interface Options<TChildrenKey extends string> {
  childrenKey: TChildrenKey
  checkForCircularReference?: boolean
}

export function isNode<
  TChildrenKey extends string,
  TExtraProps extends object = { [key: string]: unknown }
>(
  value: unknown,
  options: Options<TChildrenKey>
): value is Node<TChildrenKey, TExtraProps> {
  const { childrenKey, checkForCircularReference = true } = options
  const seen = checkForCircularReference ? new WeakSet() : undefined

  function check(
    val: unknown,
    visited?: WeakSet<object>
  ): val is Node<TChildrenKey> {
    if (typeof val !== "object" || val === null) return false

    if (visited) {
      if (visited.has(val)) {
        throw new Error("Circular reference detected in tree.")
      }
      visited.add(val)
    }

    const obj = val as Record<string, unknown>
    const maybeChildren = obj[childrenKey]

    if (maybeChildren === undefined) return true
    if (!Array.isArray(maybeChildren)) return false

    return maybeChildren.every((child) => check(child, visited))
  }

  return check(value, seen)
}
