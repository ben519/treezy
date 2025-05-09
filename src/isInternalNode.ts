import { isNode } from "./isNode.js"
import { isNodeInternalNode } from "./isNodeInternalNode.js"
import { InternalNode } from "./types.js"

interface Options<TChildrenKey extends string> {
  childrenKey: TChildrenKey
}

export function isInternalNode<
  TChildrenKey extends string,
  TExtraProps extends object = { [key: string]: unknown }
>(
  value: unknown,
  options: Options<TChildrenKey>
): value is InternalNode<TChildrenKey, TExtraProps> {
  return (
    isNode<TChildrenKey, TExtraProps>(value, options) &&
    isNodeInternalNode<TChildrenKey, TExtraProps>(value, options)
  )
}
