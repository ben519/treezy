import { UniformNode } from "./types.js"

interface Options<TChildrenKey extends string> {
  childrenKey: TChildrenKey
}

export function isNodeUniformNode<
  TChildrenKey extends string,
  TExtraProps extends object = { [key: string]: unknown }
>(
  value: unknown,
  options: Options<TChildrenKey>
): value is UniformNode<TChildrenKey, TExtraProps> {
  const { childrenKey } = options
  const visitedNodesSet = new WeakSet()

  function check(
    val: unknown,
    visited: WeakSet<object>
  ): val is UniformNode<TChildrenKey, TExtraProps> {
    if (typeof val !== "object" || val === null) return false

    // Check if this node has already been visited
    if (visited.has(val)) throw new Error("Circular reference detected")
    visited.add(val)

    const obj = val as Record<string, unknown>
    const children = obj[childrenKey]

    // Gather keys (excluding childrenKey) and their types
    const keys = Object.keys(obj).filter((key) => key !== childrenKey)
    const keyTypes = Object.fromEntries(
      keys.map((key) => [key, typeof obj[key]])
    )
    const keySet = new Set(keys)

    // If no children, consider the node uniform
    if (children === undefined) {
      visited.delete(val)
      return true
    }

    // This shouldn't happen, but if children is not an array, return false
    if (!Array.isArray(children)) {
      return false
    }

    // Validate each child
    for (const child of children) {
      if (typeof child !== "object" || child === null) {
        return false
      }

      const childObj = child as Record<string, unknown>
      const childKeys = Object.keys(childObj).filter(
        (key) => key !== childrenKey
      )

      if (childKeys.length !== keys.length) {
        return false
      }

      for (const key of childKeys) {
        if (!keySet.has(key) || typeof childObj[key] !== keyTypes[key]) {
          return false
        }
      }

      if (!check(child, visited)) {
        return false
      }
    }

    visited.delete(val)
    return true
  }

  return check(value, visitedNodesSet)
}
