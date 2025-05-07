import { LeafNode, Node } from "./types.js"

interface Options<TChildrenKey extends string = "children"> {
  childrenKey: TChildrenKey
}

export function isNodeLeafNode<TChildrenKey extends string = "children">(
  node: Node<TChildrenKey>,
  options?: Options<TChildrenKey>
): node is LeafNode<TChildrenKey> {
  const children = node[options?.childrenKey ?? ("children" as TChildrenKey)]
  return !Array.isArray(children) || children.length === 0
}
