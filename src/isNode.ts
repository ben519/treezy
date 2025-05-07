import { Node } from "./types.js"

/**
 * Options interface for the isNode function.
 * @template TChildrenKey - The key used to access child nodes (default: "children")
 */
export interface Options<TChildrenKey extends string = "children"> {
  /** The property key used to access child nodes */
  childrenKey: TChildrenKey
}

/**
 * Type guard function to check if a value conforms to the Node interface.
 *
 * @template TChildrenKey - The key used to access child nodes (default: "children")
 * @param {unknown} value - The value to check
 * @param {Options<TChildrenKey>} options - Configuration options with childrenKey
 * @returns {boolean} True if the value is a valid Node, false otherwise
 *
 * @example
 * // Using default children key
 * if (isNode(someValue)) {
 *   // someValue is a Node with "children" key
 * }
 *
 * @example
 * // Using custom children key
 * if (isNode(someValue, { childrenKey: "items" })) {
 *   // someValue is a Node with "items" key
 * }
 */
export function isNode<TChildrenKey extends string = "children">(
  value: unknown,
  options?: Options<TChildrenKey>
): value is Node<TChildrenKey> {
  // Check if value is a non-null object
  if (typeof value !== "object" || value === null) return false

  const obj = value as Record<string, unknown>
  const childrenKey: TChildrenKey =
    options?.childrenKey ?? ("children" as TChildrenKey)
  const maybeChildren = obj[childrenKey]

  // If the children property doesn't exist, it's still a valid node (a leaf)
  if (maybeChildren === undefined) return true

  // If the children property exists but isn't an array, it's not a valid node
  if (!Array.isArray(maybeChildren)) return false

  // Recursively check that all children are valid nodes
  return maybeChildren.every((child) => isNode(child, options))
}
