import { InternalNode, Node } from "./types.js"

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
 * Checks if a given Node is an InternalNode.
 *
 * An InternalNode is a Node that has a non-empty array assigned to its children property,
 * as identified by the `childrenKey`.
 *
 * @template TChildrenKey The key used to identify the children property in a node.
 * @template TProps The type of the properties of the node (excluding the children property). Defaults to any object.
 * @param {Node<TChildrenKey, TProps>} node The node to check. It is assumed that `node` has already been validated as a `Node`.
 * @param {Options<TChildrenKey>} options An object containing options, specifically the `childrenKey`.
 * @returns {node is InternalNode<TChildrenKey, TProps>} True if the node is an InternalNode (has non-empty children array), false otherwise.
 */
export function isNodeInternalNode<
  TChildrenKey extends string,
  TProps extends object = { [key: string]: unknown }
>(
  node: Node<TChildrenKey, TProps>,
  options: Options<TChildrenKey>
): node is InternalNode<TChildrenKey, TProps> {
  // Destructure options to get the key for the children property.
  const { childrenKey } = options

  // Access the children property of the node using the specified key.
  const children = node[childrenKey]

  // An InternalNode must have its children property as an array
  // and that array must contain at least one element.
  return Array.isArray(children) && children.length > 0
}
