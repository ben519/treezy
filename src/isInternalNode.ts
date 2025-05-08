import { isNode } from "./isNode.js"
import { isNodeInternalNode } from "./isNodeInternalNode.js"
import { InternalNode } from "./types.js"

interface Options<TChildrenKey extends string> {
  childrenKey: TChildrenKey
  checkForCircularReference?: boolean
}

export function isInternalNode<
  TChildrenKey extends string,
  TExtraProps extends object = { [key: string]: unknown }
>(
  value: unknown,
  options: Options<TChildrenKey>
): value is InternalNode<TChildrenKey, TExtraProps> {
  const { checkForCircularReference = true, childrenKey } = options

  return (
    isNode<TChildrenKey, TExtraProps>(value, {
      childrenKey,
      checkForCircularReference,
    }) && isNodeInternalNode<TChildrenKey, TExtraProps>(value, { childrenKey })
  )
}
