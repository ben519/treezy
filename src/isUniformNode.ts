import { isNode } from "./isNode.js"
import { isNodeUniformNode } from "./isNodeUniformNode.js"
import { Node, UniformNode } from "./types.js"

interface Options<TChildrenKey extends string> {
  childrenKey: TChildrenKey
}

export function isUniformNode<
  TChildrenKey extends string,
  TExtraProps extends object
>(
  value: unknown,
  options: Options<TChildrenKey>
): value is UniformNode<TChildrenKey, TExtraProps> {
  return (
    isNode<TChildrenKey, TExtraProps>(value, options) &&
    isNodeUniformNode<
      TChildrenKey,
      TExtraProps,
      Node<TChildrenKey, TExtraProps>
    >(value, options)
  )
}
