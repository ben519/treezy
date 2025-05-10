import { Node, UniformNode } from "./types.js"

/**
 * Configuration options for bifurcating generic tree nodes.
 * @template TChildrenKey - The property key used to access a node's children
 * @template TInputNode - The type of input nodes in the tree (defaults to Node<TChildrenKey>)
 */
interface GenericNodeOptions<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
> {
  /**
   * Property key used to access a node's children
   */
  childrenKey: TChildrenKey
  /**
   * Whether to create a deep copy of the tree before bifurcating
   * @default false
   */
  copy?: boolean
  /**
   * Function to test if a node should be extracted during bifurcation
   * @param node - The current node being tested
   * @param parent - The parent node (null for root node)
   * @param depth - Current depth in the tree (0 for root)
   * @returns Boolean indicating whether this node should be extracted
   */
  testFn: (
    node: TInputNode,
    parent: TInputNode | null,
    depth: number
  ) => boolean
}

/**
 * Configuration options for bifurcating uniform tree nodes
 * (nodes with consistent property shapes).
 * @template TChildrenKey - The property key used to access a node's children
 * @template TProps - The shape of properties consistent across all nodes (defaults to generic object)
 * @template TInputNode - The type of input nodes in the tree (defaults to UniformNode<TChildrenKey, TProps>)
 */
interface UniformNodeOptions<
  TChildrenKey extends string,
  TProps extends object = { [key: string]: unknown },
  TInputNode extends UniformNode<TChildrenKey, TProps> = UniformNode<
    TChildrenKey,
    TProps
  >
> {
  /**
   * Property key used to access a node's children
   */
  childrenKey: TChildrenKey
  /**
   * Whether to create a deep copy of the tree before bifurcating
   * @default false
   */
  copy?: boolean
  /**
   * Function to test if a node should be extracted during bifurcation
   * @param node - The current node being tested
   * @param parent - The parent node (null for root node)
   * @param depth - Current depth in the tree (0 for root)
   * @returns Boolean indicating whether this node should be extracted
   */
  testFn: (
    node: TInputNode,
    parent: TInputNode | null,
    depth: number
  ) => boolean
}

/**
 * Internal options used by the helper function
 * @template TChildrenKey - The property key used to access a node's children
 * @template TCurrentNode - The type of the current node being processed (defaults to Node<TChildrenKey>)
 */
interface HelperOptions<
  TChildrenKey extends string,
  TCurrentNode extends Node<TChildrenKey> = Node<TChildrenKey>
> {
  /**
   * Property key used to access a node's children
   */
  childrenKey: TChildrenKey
  /**
   * Function to test if a node should be extracted
   */
  testFn: (
    node: TCurrentNode,
    parent: TCurrentNode | null,
    depth: number
  ) => boolean
}

/**
 * Bifurcates (splits) a tree by extracting the first node that matches the test condition.
 * This version handles uniform nodes with consistent property shapes.
 *
 * @template TChildrenKey - The property key used to access a node's children
 * @template TProps - The shape of properties consistent across all nodes
 * @template TInputNode - The type of input nodes in the tree
 *
 * @param tree - The root node of the tree to bifurcate
 * @param options - Configuration options for the bifurcation
 * @returns An object containing the parent tree (with matching node removed) and the extracted child node,
 *          or null for either if no match was found or if the root itself matched
 */
export function bifurcate<
  TChildrenKey extends string,
  TProps extends object = { [key: string]: unknown },
  TInputNode extends UniformNode<TChildrenKey, TProps> = UniformNode<
    TChildrenKey,
    TProps
  >
>(
  tree: TInputNode,
  options: UniformNodeOptions<TChildrenKey, TProps, TInputNode>
):
  | { parent: TInputNode; child: TInputNode }
  | { parent: null; child: TInputNode }
  | { parent: TInputNode; child: null }

/**
 * Bifurcates (splits) a tree by extracting the first node that matches the test condition.
 * This version handles generic nodes.
 *
 * @template TChildrenKey - The property key used to access a node's children
 * @template TInputNode - The type of input nodes in the tree
 *
 * @param tree - The root node of the tree to bifurcate
 * @param options - Configuration options for the bifurcation
 * @returns An object containing the parent tree (with matching node removed) and the extracted child node,
 *          or null for either if no match was found or if the root itself matched
 */
export function bifurcate<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  tree: TInputNode,
  options: GenericNodeOptions<TChildrenKey>
):
  | { parent: TInputNode; child: TInputNode }
  | { parent: null; child: TInputNode }
  | { parent: TInputNode; child: null }

/**
 * Implementation of the bifurcate function that handles all variants.
 * Bifurcates (splits) a tree by extracting the first node that matches the test condition.
 *
 * @template TChildrenKey - The property key used to access a node's children
 * @template TInputNode - The type of input nodes in the tree
 *
 * @param tree - The root node of the tree to bifurcate
 * @param options - Configuration options for the bifurcation
 * @returns An object containing:
 *          - parent: The original tree with the matching node removed (null if the root matched)
 *          - child: The extracted node that matched the condition (null if no match was found)
 */
export function bifurcate<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  tree: TInputNode,
  options:
    | GenericNodeOptions<TChildrenKey, TInputNode>
    | UniformNodeOptions<TChildrenKey, any, TInputNode>
):
  | { parent: TInputNode; child: TInputNode }
  | { parent: null; child: TInputNode }
  | { parent: TInputNode; child: null } {
  // Resolve defaults
  const childrenKey = options.childrenKey
  const copy = options.copy ?? false
  const testFn = options.testFn

  // Make a Weak Set to keep track of nodes for circular reference
  const visitedNodesSet = new WeakSet()

  // Prepare options for the internal recursive helper.
  const helperOptions: HelperOptions<TChildrenKey, TInputNode> = {
    childrenKey,
    testFn,
  }

  // Initial call to the recursive helper. TInputNode is the type of the root.
  return bifurcateHelper<TChildrenKey, TInputNode>(
    copy ? structuredClone(tree) : tree,
    null,
    0,
    visitedNodesSet,
    helperOptions
  )
}

/**
 * Internal recursive helper function that performs the actual tree bifurcation.
 *
 * @template TChildrenKey - The property key used to access a node's children
 * @template TCurrentNode - The type of the current node being processed
 *
 * @param node - The current node being processed
 * @param parent - The parent node (null for the root)
 * @param depth - Current depth in the tree (0 for the root node)
 * @param visited - Set to track visited nodes and detect circular references
 * @param options - Helper options for bifurcation
 * @returns An object containing:
 *          - parent: The modified tree with the matching node removed (null if the current node matched)
 *          - child: The extracted node that matched the condition (null if no match was found in this subtree)
 * @throws Error if a circular reference is detected
 */
function bifurcateHelper<
  TChildrenKey extends string,
  TCurrentNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  node: TCurrentNode,
  parent: TCurrentNode | null,
  depth: number,
  visited: WeakSet<object>,
  options: HelperOptions<TChildrenKey, TCurrentNode>
):
  | { parent: TCurrentNode; child: TCurrentNode }
  | { parent: null; child: TCurrentNode }
  | { parent: TCurrentNode; child: null } {
  // Destructure options
  const { testFn, childrenKey } = options

  // Check if this node has already been visited
  if (visited.has(node)) throw new Error("Circular reference detected")
  visited.add(node)

  // This node is a match, exit early
  if (testFn(node, parent, depth)) {
    return { parent: null, child: node }
  }

  // Get the children array
  const childrenArray = node[childrenKey] as TCurrentNode[] | undefined

  // If this is a leaf node...
  if (!childrenArray || childrenArray.length === 0) {
    visited.delete(node)
    return { parent: node, child: null }
  }

  // Check each child
  for (const [i, child] of childrenArray.entries()) {
    const result = bifurcateHelper(child, node, depth + 1, visited, options)

    // If this child was successfully bifurcated, return
    if (result.child) {
      return {
        // If result.parent is null, just chop of this child from node
        // Otherwise replace this child with result.parent
        parent: {
          ...node,
          [childrenKey]:
            result.parent === null
              ? childrenArray.filter((_, j) => j !== i)
              : childrenArray.map((x, j) => (j === i ? result.parent : x)),
        },
        child: result.child,
      }
    }
  }

  // If we made it this far, a matching node was not found
  visited.delete(node)
  return { parent: node, child: null }
}
