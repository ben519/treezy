import { isNode } from "./isNode.js"
import { isNodeUniformNode } from "./isNodeUniformNode.js"
import { UniformNode } from "./types.js"

interface Options<TChildrenKey extends string> {
  childrenKey: TChildrenKey
}

export function isUniformNode<TChildrenKey extends string>(
  value: unknown,
  options: Options<TChildrenKey>
): value is UniformNode<TChildrenKey> {
  return isNode(value, options) && isNodeUniformNode(value, options)
}
