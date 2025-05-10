import { LeafNode, Node } from "./types.js"

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
 * Checks if a given Node is a LeafNode based on its children property.
 *
 * A LeafNode, in the context of this check, is a Node where the property
 * identified by `childrenKey` is either `undefined` or an empty array `[]`.
 * This specifically checks the state of the children property on an already
 * validated `Node`.
 *
 * @template TChildrenKey The key used to identify the children property in a node.
 * @template TProps The type of the properties of the node (excluding the children property). Defaults to any object.
 * @param {Node<TChildrenKey, TProps>} node The node to check. It is assumed that `node` has already been validated as a `Node`.
 * @param {Options<TChildrenKey>} options An object containing options, specifically the `childrenKey`.
 * @returns {node is LeafNode<TChildrenKey, TProps>} True if the node's children property is undefined or an empty array, false otherwise.
 */
export function isNodeLeafNode<
  TChildrenKey extends string,
  TProps extends object = { [key: string]: unknown }
>(
  node: Node<TChildrenKey, TProps>,
  options: Options<TChildrenKey>
): node is LeafNode<TChildrenKey, TProps> {
  // Destructure options to get the key for the children property.
  const { childrenKey } = options

  // Access the children property of the node using the specified key.
  const children = node[childrenKey]

  // A LeafNode's children property should be either undefined
  // or an array that is empty.
  return (
    children === undefined || // Covers the case where the children property is omitted
    (Array.isArray(children) && children.length === 0) // Covers the case where children is explicitly an empty array
  )
}
