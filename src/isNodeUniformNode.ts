import { UniformNode } from "./types.js"

/**
 * Configuration options for tree traversal and type guards.
 *
 * @template TChildrenKey - The string literal type representing the key where children are stored.
 */
interface Options<TChildrenKey extends string> {
  /** The property key used to access child nodes. */
  childrenKey: TChildrenKey
}

/**
 * Checks if a given value is a UniformNode structure.
 *
 * A UniformNode is a recursive structure where the root node and all its descendants
 * have the same set of properties (excluding the childrenKey) and the value of
 * each property has the same typeof result across all nodes in the subtree.
 *
 * @template TChildrenKey The key used to identify the children property in a node.
 * @template TProps The expected type of the properties (excluding the childrenKey) that should be consistent across all nodes.
 * @param {unknown} value The value to check.
 * @param {Options<TChildrenKey>} options An object containing options, specifically the `childrenKey`.
 * @returns {value is UniformNode<TChildrenKey, TProps>} True if the value is a valid UniformNode structure, false otherwise.
 * @throws {Error} If a circular reference is detected within the structure.
 */
export function isNodeUniformNode<
  TChildrenKey extends string,
  TProps extends object = { [key: string]: unknown }
>(
  value: unknown,
  options: Options<TChildrenKey>
): value is UniformNode<TChildrenKey, TProps> {
  const { childrenKey } = options
  // Use a WeakSet to track visited objects and detect circular references.
  const visitedNodesSet = new WeakSet()

  /**
   * Internal recursive helper function to check if a value and its children
   * form a UniformNode structure with consistent properties and types.
   * @param {unknown} val The current value being checked.
   * @param {WeakSet<object>} visited A WeakSet tracking objects already visited in the current path.
   * @returns {val is UniformNode<TChildrenKey, TProps>} True if the value and its subtree are uniform.
   * @throws {Error} If a circular reference is detected.
   */
  function check(
    val: unknown,
    visited: WeakSet<object>
  ): val is UniformNode<TChildrenKey, TProps> {
    // A UniformNode must be an object and not null.
    if (typeof val !== "object" || val === null) return false

    // Check for circular references.
    if (visited.has(val)) throw new Error("Circular reference detected")
    visited.add(val)

    const obj = val as Record<string, unknown>
    const children = obj[childrenKey]

    // Extract non-children keys and their types from the current node.
    const keys = Object.keys(obj).filter((key) => key !== childrenKey)
    const keyTypes: Record<string, string> = Object.fromEntries(
      keys.map((key) => [key, typeof obj[key]])
    )
    const keySet = new Set(keys)

    // If the children property is undefined, this node is a leaf in the structure.
    // It is considered uniform if it meets the structural requirements up to this point.
    if (children === undefined) {
      visited.delete(val) // Remove from visited as we backtrack
      return true
    }

    // If children exists, it must be an array for the structure to be valid.
    if (!Array.isArray(children)) {
      visited.delete(val) // Remove from visited before returning false
      return false
    }

    // If children is an array, validate each child recursively.
    for (const child of children) {
      // Each child must also be an object and not null to be part of a Node structure.
      if (typeof child !== "object" || child === null) {
        visited.delete(val) // Remove from visited before returning false
        return false
      }

      const childObj = child as Record<string, unknown>
      // Extract non-children keys from the child node.
      const childKeys = Object.keys(childObj).filter(
        (key) => key !== childrenKey
      )

      // Check if the number of non-children keys is the same as the parent.
      if (childKeys.length !== keys.length) {
        visited.delete(val) // Remove from visited before returning false
        return false
      }

      // Check if each non-children key exists in the parent's keys
      // and if the type of the property value is the same.
      for (const key of childKeys) {
        if (!keySet.has(key) || typeof childObj[key] !== keyTypes[key]) {
          visited.delete(val) // Remove from visited before returning false
          return false
        }
      }

      // Recursively check the child and its subtree for uniformity.
      if (!check(child, visited)) {
        visited.delete(val) // Remove from visited before returning false
        return false
      }
    }

    // If all children were successfully checked, this node and its subtree are uniform.
    visited.delete(val) // Remove from visited as we backtrack
    return true
  }

  // Start the validation process with the initial value.
  return check(value, visitedNodesSet)
}
