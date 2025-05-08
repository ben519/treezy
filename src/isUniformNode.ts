import { isNode } from "./isNode.js"
import { isNodeUniformNode } from "./isNodeUniformNode.js"
import { Node, UniformNode } from "./types.js"

interface Options<TChildrenKey extends string> {
  childrenKey: TChildrenKey
  checkForCircularReference?: boolean
}

export function isUniformNode<
  TChildrenKey extends string,
  TExtraProps extends object
>(
  value: unknown,
  options: Options<TChildrenKey>
): value is UniformNode<TChildrenKey, TExtraProps> {
  const { checkForCircularReference = true, childrenKey } = options

  return (
    isNode<TChildrenKey, TExtraProps>(value, {
      childrenKey,
      checkForCircularReference,
    }) &&
    isNodeUniformNode<
      TChildrenKey,
      TExtraProps,
      Node<TChildrenKey, TExtraProps>
    >(value, { childrenKey })
  )
}
