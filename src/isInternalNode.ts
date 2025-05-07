import { isNode } from "./isNode.js"
import { isNodeInternalNode } from "./isNodeInternalNode.js"
import { LeafNode } from "./types.js"

interface Options<TChildrenKey extends string = "children"> {
  childrenKey: TChildrenKey
}

export function isInternalNode<TChildrenKey extends string = "children">(
  value: unknown,
  options?: Options<TChildrenKey>
): value is LeafNode<TChildrenKey> {
  return isNode(value, options) && isNodeInternalNode(value, options)
}
