import { InternalNode, Node } from "./types.js"

interface Options<TChildrenKey extends string> {
  childrenKey: TChildrenKey
}

export function isNodeInternalNode<
  TChildrenKey extends string,
  TExtraProps extends object = { [key: string]: unknown }
>(
  node: Node<TChildrenKey, TExtraProps>,
  options: Options<TChildrenKey>
): node is InternalNode<TChildrenKey, TExtraProps> {
  // Destructure options
  const { childrenKey } = options

  // Get the children
  const children = node[childrenKey]

  // Confirm children is a non empty array
  return Array.isArray(children) && children.length > 0
}
