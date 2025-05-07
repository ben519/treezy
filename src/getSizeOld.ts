import { Node } from "./types.js"

/**
 * Configuration options for counting nodes
 */
interface Options<
  TChildrenKey extends string = "children",
  TExtraProps extends Record<string, unknown> = {}
> {
  /**
   * Function to test whether a node should be counted
   * @param node - The current node being tested
   * @param parent - The parent node of the current node, if any
   * @param depth - The depth of the current node in the tree (0-based)
   * @returns boolean indicating whether this node should be counted
   * @default () => true - counts all nodes if not specified
   */
  testFn?: (
    node: Node<TChildrenKey, TExtraProps>,
    parent?: Node<TChildrenKey, TExtraProps> | null,
    depth?: number
  ) => boolean

  /**
   * Name of the array property in tree that stores the child nodes
   * @default "children"
   */
  childrenKey?: TChildrenKey
}

/**
 * Counts the number of nodes in a tree that match an optional test condition.
 * If no test condition is provided, counts all nodes.
 *
 * @param tree - The tree to search
 * @param options - Configuration options containing the test function
 * @param options.childrenKey - Optional name of the array property in tree that stores the child nodes
 * @param options.testFn - Optional function to filter which nodes should be checked
 * @returns The number of matching nodes in the tree
 *
 * @example
 * const tree = {
 *   value: 1,
 *   children: [
 *     { value: 2, children: [] },
 *     { value: 3, children: [] }
 *   ]
 * };
 *
 * // Count all nodes (returns 3)
 * getSize(tree);
 *
 * // Count nodes with even values (returns 1)
 * getSize(tree, {
 *   testFn: (node) => node.value % 2 === 0
 * });
 */
export function getSize<
  TChildrenKey extends string = "children",
  TExtraProps extends Record<string, unknown> = {},
  TNode extends Node<TChildrenKey, TExtraProps> = Node<
    TChildrenKey,
    TExtraProps
  >
>(tree: TNode, options?: Options<TChildrenKey, TExtraProps>): number {
  return getSizeHelper<TChildrenKey, TExtraProps, TNode>(tree, null, 0, {
    childrenKey: "children" as TChildrenKey,
    testFn: () => true,
    ...options,
  })
}

/**
 * Recursive helper function that traverses the tree to count matching nodes
 *
 * @param tree - Current node being examined
 * @param parent - Parent of the current node
 * @param depth - Current depth in the tree (0-based)
 * @param options - Configuration options for counting nodes
 * @returns The number of matching nodes in this subtree
 *
 * @internal
 * This is an internal helper function and should not be called directly.
 */
function getSizeHelper<
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
): number {
  const { childrenKey, testFn } = options
  const children = node[childrenKey]
  const count = testFn(node, parent, depth) ? 1 : 0
  return (
    count +
    children.reduce(
      (sum, child) => sum + getSizeHelper(child, node, depth + 1, options),
      0
    )
  )
}
