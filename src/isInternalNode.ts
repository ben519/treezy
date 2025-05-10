import { isNode } from "./isNode.js"
import { isNodeInternalNode } from "./isNodeInternalNode.js"
import { InternalNode } from "./types.js"

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
 * Type guard that checks whether a given value conforms to the `InternalNode` type.
 * An `InternalNode` is a tree node that contains one or more children in the specified `childrenKey` field.
 *
 * This function first verifies that the value is a valid node and then confirms
 * that the node has a non-empty array of children under the specified key.
 *
 * @template TChildrenKey - The key name under which children are stored.
 * @template TProps - Additional properties expected in the node.
 *
 * @param value - The value to check.
 * @param options - An object containing the children key.
 * @returns `true` if the value is an `InternalNode`; otherwise, `false`.
 */
export function isInternalNode<
  TChildrenKey extends string,
  TProps extends object = { [key: string]: unknown }
>(
  value: unknown,
  options: Options<TChildrenKey>
): value is InternalNode<TChildrenKey, TProps> {
  return (
    isNode<TChildrenKey, TProps>(value, options) &&
    isNodeInternalNode<TChildrenKey, TProps>(value, options)
  )
}
