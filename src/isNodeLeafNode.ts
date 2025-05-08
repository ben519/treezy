import { LeafNode, Node } from "./types.js"

interface Options<TChildrenKey extends string> {
  childrenKey: TChildrenKey
}

export function isNodeLeafNode<
  TChildrenKey extends string,
  TExtraProps extends object = { [key: string]: unknown }
>(
  node: Node<TChildrenKey, TExtraProps>,
  options: Options<TChildrenKey>
): node is LeafNode<TChildrenKey, TExtraProps> {
  // Destructure options
  const { childrenKey } = options

  // Get the children
  const children = node[childrenKey]

  // Confirm children is undefined or an empty array
  return (
    children === undefined || (Array.isArray(children) && children.length === 0)
  )
}
