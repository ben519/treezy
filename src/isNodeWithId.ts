import { NodeWithId } from "./types.js"

/**
 * Options for node validation functions for structures with IDs.
 * @template TChildrenKey The key used to identify the children property in a node.
 * @template TIdKey The key used to identify the ID property in a node.
 */
interface Options<TChildrenKey extends string, TIdKey extends string> {
  /**
   * The key used to identify the children property in a node.
   */
  childrenKey: TChildrenKey
  /**
   * The key used to identify the ID property in a node.
   */
  idKey: TIdKey
}

/**
 * Checks if a given value is a valid NodeWithId structure.
 *
 * A NodeWithId structure is a recursive object structure where:
 * 1. Every object in the structure (including the root) must have a property identified by `idKey`.
 * 2. The property identified by `childrenKey` is either undefined or an array of values that are themselves valid NodeWithId structures.
 * This function recursively checks the children and includes a circular reference detection mechanism.
 *
 * @template TChildrenKey The key used to identify the children property in a node.
 * @template TIdKey The key used to identify the ID property in a node.
 * @template TId The expected type of the ID property. Defaults to string | number | symbol.
 * @template TProps The type of the properties of the node (excluding the childrenKey and idKey). Defaults to any object.
 * @param {unknown} value The value to check.
 * @param {Options<TChildrenKey, TIdKey>} options An object containing options, specifically the `childrenKey` and `idKey`.
 * @returns {value is NodeWithId<TChildrenKey, TIdKey, TId, TProps>} True if the value is a valid NodeWithId structure, false otherwise.
 * @throws {Error} If a circular reference is detected within the structure.
 */
export function isNodeWithId<
  TChildrenKey extends string,
  TIdKey extends string,
  TId = string | number | symbol,
  TProps extends object = { [key: string]: unknown }
>(
  value: unknown,
  options: Options<TChildrenKey, TIdKey>
): value is NodeWithId<TChildrenKey, TIdKey, TId, TProps> {
  const { childrenKey, idKey } = options
  // Use a WeakSet to track visited objects and detect circular references.
  const visitedNodesSet = new WeakSet()

  /**
   * Internal recursive helper function to check if a value is a NodeWithId.
   * @param {unknown} val The current value being checked.
   * @param {WeakSet<object>} visited A WeakSet tracking objects already visited in the current path.
   * @returns {val is NodeWithId<TChildrenKey, TIdKey, TId, TProps>} True if the value is a valid NodeWithId structure.
   * @throws {Error} If a circular reference is detected.
   */
  function check(
    val: unknown,
    visited: WeakSet<object>
  ): val is NodeWithId<TChildrenKey, TIdKey, TId, TProps> {
    // A NodeWithId must be an object and not null.
    if (typeof val !== "object" || val === null) return false

    // Check if this object has already been visited in the current traversal path.
    // If it has, we have detected a circular reference.
    if (visited.has(val)) {
      throw new Error("Circular reference detected")
    }
    // Mark the current object as visited.
    visited.add(val)

    // Crucially, check if the idKey exists directly on the current object.
    // Use 'in' operator as the ID value type is flexible.
    if (!(idKey in val)) {
      visited.delete(val) // Remove from visited before returning false
      return false
    }

    // Make sure children is undefined or an array, similar to a regular Node check.
    const obj = val as Record<string, unknown>
    const maybeChildren = obj[childrenKey]
    if (maybeChildren === undefined) {
      visited.delete(val) // Remove from visited as we backtrack
      return true
    }
    if (!Array.isArray(maybeChildren)) {
      visited.delete(val) // Remove from visited before returning false
      return false
    }

    // Recursively check each child in the array.
    const result = maybeChildren.every((child) => check(child, visited))

    // After checking all children (or failing early), remove the current
    // node from the visited set as we return from this level of recursion.
    visited.delete(val)

    return result
  }

  // Start the validation process with the initial value and an empty visited set.
  return check(value, visitedNodesSet)
}
