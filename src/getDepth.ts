import { Node } from "./types.js"

interface GenericNodeOptions<TChildrenKey extends string> {
  /** The property name used to access child nodes in the tree. */
  childrenKey: TChildrenKey
}

interface HelperOptions<TChildrenKey extends string> {
  /** The resolved property name used to access child nodes. */
  childrenKey: TChildrenKey
}

export function getDepth<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(tree: TInputNode, options: GenericNodeOptions<TChildrenKey>): number {
  // Resolve defaults
  const childrenKey = options.childrenKey

  // Prepare options for the recursive helper
  const helperOptions: HelperOptions<TChildrenKey> = {
    childrenKey,
  }

  return getDepthHelper<TChildrenKey>(tree, 0, helperOptions)
}

function getDepthHelper<
  TChildrenKey extends string,
  TCurrentNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  node: TCurrentNode,
  depth: number,
  options: HelperOptions<TChildrenKey>
): number {
  const { childrenKey } = options

  // Get the children array
  const childrenArray = node[childrenKey] as TCurrentNode[] | undefined

  // If this is a leaf node
  if (!childrenArray || childrenArray.length === 0) {
    return depth
  }

  // Get the depth of each child subtree
  const childDepths = childrenArray.map((child) =>
    getDepthHelper(child, depth + 1, options)
  )

  // Return the maximum depth found
  return Math.max(...childDepths)
}
