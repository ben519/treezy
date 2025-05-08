import { isNode } from "./isNode.js"
import { isNodeInternalNode } from "./isNodeInternalNode.js"
import { InternalNode } from "./types.js"

interface Options<TChildrenKey extends string> {
  childrenKey: TChildrenKey
}

export function isInternalNode<TChildrenKey extends string>(
  value: unknown,
  options: Options<TChildrenKey>
): value is InternalNode<TChildrenKey> {
  return (
    isNode<TChildrenKey>(value, options) &&
    isNodeInternalNode<TChildrenKey>(value, options)
  )
}
