import { isNode } from "./isNode.js"
import { isNodeLeafNode } from "./isNodeLeafNode.js"
import { LeafNode } from "./types.js"

interface Options<TChildrenKey extends string> {
  childrenKey: TChildrenKey
}

export function isLeafNode<TChildrenKey extends string>(
  value: unknown,
  options: Options<TChildrenKey>
): value is LeafNode<TChildrenKey> {
  return isNode(value, options) && isNodeLeafNode(value, options)
}
