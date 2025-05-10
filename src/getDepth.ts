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

  // Make a Weak Set to keep track of nodes for circular reference
  const visitedNodesSet = new WeakSet()

  // Prepare options for the recursive helper
  const helperOptions: HelperOptions<TChildrenKey> = {
    childrenKey,
  }

  return getDepthHelper<TChildrenKey>(tree, 0, visitedNodesSet, helperOptions)
}

function getDepthHelper<
  TChildrenKey extends string,
  TCurrentNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  node: TCurrentNode,
  depth: number,
  visited: WeakSet<object>,
  options: HelperOptions<TChildrenKey>
): number {
  const { childrenKey } = options

  // Check if this node has already been visited
  if (visited.has(node)) throw new Error("Circular reference detected")
  visited.add(node)

  // Get the children array
  const childrenArray = node[childrenKey] as TCurrentNode[] | undefined

  // If this is a leaf node
  if (!childrenArray || childrenArray.length === 0) {
    visited.delete(node)
    return depth
  }

  // Get the depth of each child subtree
  const childDepths = childrenArray.map((child) =>
    getDepthHelper(child, depth + 1, visited, options)
  )

  // Return the maximum depth found
  visited.delete(node)
  return Math.max(...childDepths)
}
