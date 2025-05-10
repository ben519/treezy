import { isNode } from "./isNode.js"
import { isNodeLeafNode } from "./isNodeLeafNode.js"
import { LeafNode } from "./types.js"

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
 * Checks if a given value is a LeafNode.
 *
 * A LeafNode is a Node that explicitly has an empty array for its children property,
 * identified by the `childrenKey`.
 *
 * @template TChildrenKey The key used to identify the children property in a node.
 * @template TProps The type of the properties of the node (excluding the children property).
 * @param {unknown} value The value to check.
 * @param {Options<TChildrenKey>} options An object containing options, specifically the `childrenKey`.
 * @returns {value is LeafNode<TChildrenKey, TProps>} True if the value is a LeafNode, false otherwise.
 */
export function isLeafNode<
  TChildrenKey extends string,
  TProps extends object = { [key: string]: unknown }
>(
  value: unknown,
  options: Options<TChildrenKey>
): value is LeafNode<TChildrenKey, TProps> {
  return (
    isNode<TChildrenKey, TProps>(value, options) &&
    isNodeLeafNode<TChildrenKey, TProps>(value, options)
  )
}
