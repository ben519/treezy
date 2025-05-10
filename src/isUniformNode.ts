import { isNode } from "./isNode.js"
import { isNodeUniformNode } from "./isNodeUniformNode.js"
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
 * Checks if a given value is a UniformNode.
 *
 * A UniformNode is a node structure where all potential child nodes,
 * if they exist, are also UniformNodes with the same properties type.
 * This function verifies that the value conforms to the basic structure of a node
 * and that its children, if present, are also UniformNodes with the expected properties type.
 *
 * @template TChildrenKey The key name used for the children property in the node structure.
 * @template TProps The expected type of the properties for the UniformNode, excluding the children key.
 * @param {unknown} value The value to check.
 * @param {Options<TChildrenKey>} options An options object containing the key name for the children property.
 * @returns {value is UniformNode<TChildrenKey, TProps>} True if the value is a UniformNode with the specified children key and properties type, false otherwise.
 */
export function isUniformNode<
  TChildrenKey extends string,
  TProps extends object
>(
  value: unknown,
  options: Options<TChildrenKey>
): value is UniformNode<TChildrenKey, TProps> {
  return (
    isNode<TChildrenKey, TProps>(value, options) &&
    isNodeUniformNode<TChildrenKey, TProps>(value, options)
  )
}
