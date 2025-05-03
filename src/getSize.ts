import { Node, Tree } from "./types.js"

/**
 * Configuration options for counting nodes
 */
interface Options<TChildrenKey extends string = "children"> {
  /**
   * Function to test whether a node should be counted
   * @param node - The current node being tested
   * @param parent - The parent node of the current node, if any
   * @param depth - The depth of the current node in the tree (0-based)
   * @returns boolean indicating whether this node should be counted
   * @default () => true - counts all nodes if not specified
   */
  testFn?: (
    node: Node<TChildrenKey>,
    parent?: Node<TChildrenKey> | null,
    depth?: number
  ) => boolean

  /**
   * Name of the array property in tree that stores the child nodes
   * @default "children"
   */
  childrenProp?: TChildrenKey
}

/**
 * Counts the number of nodes in a tree that match an optional test condition.
 * If no test condition is provided, counts all nodes.
 *
 * @param tree - The root node of the tree to measure
 * @param options - Configuration options for counting nodes
 * @param options.testFn - Optional function to filter which nodes should be counted
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
export function getSize<TChildrenKey extends string = "children">(
  tree: Node<TChildrenKey>,
  options?: Options<TChildrenKey>
): number {
  return getSizeHelper(tree, null, 0, options ?? {})
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
function getSizeHelper<TChildrenKey extends string>(
  tree: Tree<TChildrenKey>,
  parent: Node<TChildrenKey> | null,
  depth: number,
  options: Options<TChildrenKey>
): number {
  const { testFn = () => true, childrenProp = "children" as TChildrenKey } =
    options ?? {}

  const children: Node<TChildrenKey>[] = tree[childrenProp]

  if (!Array.isArray(children)) {
    throw new Error(`Children property '${childrenProp}' should be an array`)
  }

  // Count this node?
  const addend = testFn(tree, parent, depth) ? 1 : 0

  const childCounts = children.map((child) =>
    getSizeHelper(child, tree, depth + 1, options)
  )

  return childCounts.reduce((sum, count) => sum + count, addend)
}
