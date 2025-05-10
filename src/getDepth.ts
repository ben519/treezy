import { Node } from "./types.js"

/**
 * Options for configuring a generic node tree traversal.
 *
 * @template TChildrenKey - The key used to access children in a node.
 */
interface GenericNodeOptions<TChildrenKey extends string> {
  /**
   * The property key that contains the child nodes.
   */
  childrenKey: TChildrenKey
}

/**
 * Internal helper options used during recursive traversal.
 *
 * @template TChildrenKey - The key used to access children in a node.
 */
interface HelperOptions<TChildrenKey extends string> {
  /**
   * The property key that contains the child nodes.
   */
  childrenKey: TChildrenKey
}

/**
 * Calculates the maximum depth of a tree structure.
 *
 * This function supports trees with arbitrary child key names and guards against circular references.
 *
 * @template TChildrenKey - The key used to access children in the node.
 * @template TInputNode - The type of the input node, extending from `Node<TChildrenKey>`.
 *
 * @param tree - The root node of the tree to measure depth from.
 * @param options - Configuration options specifying the child key.
 *
 * @returns The maximum depth of the tree. A single node with no children returns a depth of 0.
 *
 * @throws Error if a circular reference is detected in the tree.
 */
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

/**
 * Recursively calculates the depth of a node and its descendants.
 *
 * @template TChildrenKey - The key used to access children in the node.
 * @template TCurrentNode - The type of the current node, extending from `Node<TChildrenKey>`.
 *
 * @param node - The current node being inspected.
 * @param depth - The current depth in the traversal.
 * @param visited - A set of previously visited nodes to detect circular references.
 * @param options - Options specifying the child key to use.
 *
 * @returns The maximum depth from the current node down.
 *
 * @throws Error if a circular reference is detected.
 */
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
