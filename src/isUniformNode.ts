import { isNode } from "./isNode.js"
import { isNodeUniformNode } from "./isNodeUniformNode.js"
import { UniformNode } from "./types.js"

interface Options<TChildrenKey extends string = "children"> {
  childrenKey: TChildrenKey
}

export function isUniformNode<TChildrenKey extends string = "children">(
  value: unknown,
  options?: Options<TChildrenKey>
): value is UniformNode<TChildrenKey> {
  return isNode(value, options) && isNodeUniformNode(value, options)
}
