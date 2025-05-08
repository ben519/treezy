import { InternalNode, Node } from "./types.js"

interface Options<TChildrenKey extends string> {
  childrenKey: TChildrenKey
}

export function isNodeInternalNode<TChildrenKey extends string>(
  node: Node<TChildrenKey>,
  options: Options<TChildrenKey>
): node is InternalNode<TChildrenKey> {
  // Destructure options
  const { childrenKey } = options

  // Get the children
  const children = node[childrenKey]

  // Confirm children is a non empty array
  return Array.isArray(children) && children.length > 0
}
