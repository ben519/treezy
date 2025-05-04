import { Node } from "./types.js"

/**
 * Configuration options for pruning nodes from a tree
 */
interface Options<
  TChildrenKey extends string = "children",
  TExtraProps extends Record<string, unknown> = {}
> {
  /**
   * Function to identify nodes that should be removed
   * @param node - The current node being tested
   * @param parent - The parent node of the current node, if any
   * @param depth - The depth of the current node in the tree (0-based)
   * @returns boolean indicating whether this node should be removed
   */
  testFn: (
    node: Node<TChildrenKey, TExtraProps>,
    parent?: Node<TChildrenKey, TExtraProps> | null,
    depth?: number
  ) => boolean

  /**
   * Whether to create a deep copy of the tree before modifying.
   * Set to false to modify the original tree.
   * @default true
   */
  copy?: boolean

  /**
   * Name of the array property in tree that stores the child nodes
   * @default "children"
   */
  childrenKey?: TChildrenKey
}

/**
 * Removes (prunes) all nodes from a tree that match a given test condition.
 * When a node is pruned, all of its descendants are also removed.
 *
 * @param tree - The root node of the tree to prune
 * @param options - Configuration options for pruning
 * @param options.testFn - Function to identify nodes that should be removed
 * @param options.copy - Whether to create a deep copy of the tree before modifying (defaults to true)
 *
 * @returns The pruned tree, or null if the root node matches the test condition
 *
 * @throws {Error} If no testFn is provided in options
 *
 * @example
 * const tree = {
 *   id: 1,
 *   type: 'root',
 *   children: [{
 *     id: 2,
 *     type: 'temp',
 *     children: [{
 *       id: 3,
 *       type: 'permanent',
 *       children: []
 *     }]
 *   }]
 * };
 *
 * // Remove all temporary nodes
 * const result1 = prune(tree, {
 *   testFn: node => node.type === 'temp'
 * });
 * // Result keeps root and removes node 2 and its descendants
 *
 * // Prune without copying (modifies original tree)
 * const result2 = prune(tree, {
 *   testFn: node => node.type === 'temp',
 *   copy: false
 * });
 *
 * // If root matches condition, returns null
 * const result3 = prune(tree, {
 *   testFn: node => node.id === 1
 * }); // Returns null
 */
export function prune<
  TChildrenKey extends string = "children",
  TExtraProps extends Record<string, unknown> = {},
  TNode extends Node<TChildrenKey, TExtraProps> = Node<
    TChildrenKey,
    TExtraProps
  >
>(tree: TNode, options: Options<TChildrenKey, TExtraProps>): TNode | null {
  const node = options?.copy === false ? tree : structuredClone(tree)
  return pruneHelper(node, null, 0, {
    childrenKey: "children" as TChildrenKey,
    copy: false,
    ...options,
  })
}

/**
 * Helper function that recursively traverses the tree to remove matching nodes.
 *
 * @param tree - Current node being examined
 * @param options - Pruning configuration options
 * @param parent - Parent of the current node
 * @param depth - Current depth in the tree (0-based)
 * @returns The modified tree if this node should be kept, null if it should be removed
 *
 * @internal
 * This is an internal helper function and should not be called directly.
 */
function pruneHelper<
  TChildrenKey extends string = "children",
  TExtraProps extends Record<string, unknown> = {},
  TNode extends Node<TChildrenKey, TExtraProps> = Node<
    TChildrenKey,
    TExtraProps
  >
>(
  node: TNode,
  parent: TNode | null,
  depth: number,
  options: Required<Options<TChildrenKey, TExtraProps>>
): TNode | null {
  const { testFn, childrenKey } = options

  // Check if this node passes testFn
  if (testFn(node, parent, depth)) {
    return null
  }

  // Prune each child of this node
  for (const [idx, child] of node[childrenKey].reverse().entries()) {
    const newChild = pruneHelper(child, node, depth + 1, options)

    // If the returned value is null, delete the child from tree[childrenKey]
    if (newChild === null) {
      node[childrenKey].splice(idx, 1)
    }
  }

  return node
}
