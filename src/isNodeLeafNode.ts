import { LeafNode, Node } from "./types.js"

interface Options<TChildrenKey extends string> {
  childrenKey: TChildrenKey
}

export function isNodeLeafNode<TChildrenKey extends string>(
  node: Node<TChildrenKey>,
  options: Options<TChildrenKey>
): node is LeafNode<TChildrenKey> {
  // Destructure options
  const { childrenKey } = options

  // Get the children
  const children = node[childrenKey]

  // Confirm children is undefined or an empty array
  return (
    children === undefined || (Array.isArray(children) && children.length === 0)
  )
}
