import { Node } from "./types.js"

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
 * Checks if a given value is a valid Node structure.
 *
 * A Node structure is an object where the property identified by `childrenKey`
 * is either undefined or an array of values that are themselves valid Node structures.
 * This function recursively checks the children and includes a circular reference detection mechanism.
 *
 * @template TChildrenKey The key used to identify the children property in a node.
 * @template TProps The type of the properties of the node (excluding the children property). Defaults to any object.
 * @param {unknown} value The value to check.
 * @param {Options<TChildrenKey>} options An object containing options, specifically the `childrenKey`.
 * @returns {value is Node<TChildrenKey, TProps>} True if the value is a valid Node structure, false otherwise.
 * @throws {Error} If a circular reference is detected within the structure.
 */
export function isNode<
  TChildrenKey extends string,
  TProps extends object = { [key: string]: unknown }
>(
  value: unknown,
  options: Options<TChildrenKey>
): value is Node<TChildrenKey, TProps> {
  const { childrenKey } = options
  // Use a WeakSet to keep track of visited objects during traversal
  // This allows for garbage collection if references are removed,
  // but importantly prevents infinite loops on circular structures.
  const visitedNodesSet = new WeakSet()

  /**
   * Internal recursive helper function to check if a value is a Node.
   * @param {unknown} val The current value being checked.
   * @param {WeakSet<object>} visited A WeakSet tracking objects already visited in the current path.
   * @returns {val is Node<TChildrenKey>} True if the value is a valid Node structure.
   * @throws {Error} If a circular reference is detected.
   */
  function check(
    val: unknown,
    visited: WeakSet<object>
  ): val is Node<TChildrenKey> {
    // A Node must be an object and not null.
    if (typeof val !== "object" || val === null) return false

    // Check if this object has already been visited in the current traversal path.
    // If it has, we have detected a circular reference.
    if (visited.has(val)) throw new Error("Circular reference detected")
    // Mark the current object as visited.
    visited.add(val)

    // Access the potential children property using the provided childrenKey.
    const obj = val as Record<string, unknown>
    const maybeChildren = obj[childrenKey]

    // The children property can be undefined (leaf node in terms of structure)
    // or an array.
    if (maybeChildren === undefined) {
      // If children is undefined, it's a valid part of a Node structure.
      // Before returning, remove the current node from the visited set
      // as we are backtracking up the recursion tree.
      visited.delete(val)
      return true
    }

    // If children is not undefined, it must be an array.
    if (!Array.isArray(maybeChildren)) {
      // If it's not an array, it's not a valid Node structure.
      // Remove from visited before returning false.
      visited.delete(val)
      return false
    }

    // If children is an array, recursively check every element in the array.
    // The .every() method short-circuits if any element fails the check.
    const result = maybeChildren.every((child) => check(child, visited))

    // After checking all children (or failing early), remove the current
    // node from the visited set as we return from this level of recursion.
    visited.delete(val)

    return result
  }

  // Start the validation process with the initial value and an empty visited set.
  return check(value, visitedNodesSet)
}
