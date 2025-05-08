import { isNode } from "./isNode.js"
import { isNodeLeafNode } from "./isNodeLeafNode.js"
import { LeafNode } from "./types.js"

interface Options<TChildrenKey extends string> {
  childrenKey: TChildrenKey
}

export function isLeafNode<
  TChildrenKey extends string,
  TExtraProps extends object = { [key: string]: unknown }
>(
  value: unknown,
  options: Options<TChildrenKey>
): value is LeafNode<TChildrenKey, TExtraProps> {
  return (
    isNode<TChildrenKey, TExtraProps>(value, {
      ...options,
      checkForCircularReference: false,
    }) && isNodeLeafNode<TChildrenKey, TExtraProps>(value, options)
  )
}
