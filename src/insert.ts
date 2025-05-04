import { Node } from "./types.js"

/**
 * Configuration options for inserting a subtree
 */
interface Options<
  TChildrenKey extends string = "children",
  TExtraProps extends Record<string, unknown> = {},
  TNode extends Node<TChildrenKey, TExtraProps> = Node<
    TChildrenKey,
    TExtraProps
  >
> {
  /**
   * The tree structure to insert
   */
  subtree?: TNode

  /**
   * Function to identify the target node
   * @param node - The current node being tested
   * @param parent - The parent node of the current node, if any
   * @param depth - The depth of the current node in the tree (0-based)
   * @returns boolean indicating whether this is the target node
   */
  testFn: (
    node: Node<TChildrenKey, TExtraProps>,
    parent?: Node<TChildrenKey, TExtraProps> | null,
    depth?: number
  ) => boolean

  /**
   * Where to insert the subtree relative to the matching node
   * @default "below"
   */
  direction?: "after" | "before" | "below"

  /**
   * Whether to create deep copies of both trees before modifying.
   * Set to false to modify the original trees.
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
 * Inserts a subtree into a tree at a position relative to a node matching the given test condition.
 *
 * @param tree - The root node of the tree to modify
 * @param options - Configuration options for inserting the subtree
 * @param options.subtree - The tree structure to insert
 * @param options.testFn - Function to identify the target node
 * @param options.direction - Where to insert relative to the matching node:
 *   - "below": As last child of the matching node (default)
 *   - "before": As previous sibling of the matching node
 *   - "after": As next sibling of the matching node
 * @param options.copy - Whether to create deep copies of both trees before modifying (defaults to true)
 *
 * @returns The modified tree structure
 *
 * @throws {Error} If subtree or testFn is not provided in options
 * @throws {Error} If attempting to insert before/after the root node
 *
 * @example
 * const tree = {
 *   id: 1,
 *   children: [{
 *     id: 2,
 *     children: []
 *   }]
 * };
 *
 * const newSubtree = {
 *   id: 3,
 *   children: []
 * };
 *
 * // Insert as child of node with id 2
 * const result1 = insert(tree, {
 *   subtree: newSubtree,
 *   testFn: node => node.id === 2,
 *   direction: "below"
 * });
 *
 * // Insert before node with id 2
 * const result2 = insert(tree, {
 *   subtree: newSubtree,
 *   testFn: node => node.id === 2,
 *   direction: "before"
 * });
 *
 * // Insert without copying (modifies original tree)
 * const result3 = insert(tree, {
 *   subtree: newSubtree,
 *   testFn: node => node.id === 2,
 *   copy: false
 * });
 */
export function insert<
  TChildrenKey extends string = "children",
  TExtraProps extends Record<string, unknown> = {},
  TNode extends Node<TChildrenKey, TExtraProps> = Node<
    TChildrenKey,
    TExtraProps
  >
>(tree: TNode, options: Options<TChildrenKey, TExtraProps, TNode>): TNode {
  const node = options?.copy === false ? tree : structuredClone(tree)
  const subtree =
    options?.copy === false
      ? options.subtree ?? tree
      : structuredClone(options.subtree ?? tree)
  const result = insertHelper<TChildrenKey, TExtraProps, TNode>(node, null, 0, {
    childrenKey: "children" as TChildrenKey,
    direction: "below",
    ...options,
    copy: true,
    subtree,
  })
  return result ?? node
}

/**
 * Helper function that recursively traverses the tree to find the insertion point
 * and perform the insertion.
 *
 * @param tree - Current node being examined
 * @param options - Insertion configuration options
 * @param parent - Parent of the current node
 * @param depth - Current depth in the tree (0-based)
 * @returns The modified tree if insertion occurred in this subtree, null otherwise
 *
 * @internal
 * This is an internal helper function and should not be called directly.
 */
function insertHelper<
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
  options: Required<Options<TChildrenKey, TExtraProps, TNode>>
): TNode | null {
  // Destructure options
  const { subtree, testFn, direction, childrenKey } = options

  if (direction === "below") {
    // If this node is a match, append subtree to this node's children and return
    if (testFn(node, parent, depth)) {
      node[childrenKey].push(subtree)
      return node
    }

    // Check each child of this node for the matching value
    for (const [idx, child] of node[childrenKey].entries()) {
      // Recursively call insertHelper() on this child node
      const newChild = insertHelper(child, node, depth + 1, options)

      if (newChild !== null) {
        // Found the subtree with the matching node

        node[childrenKey].splice(idx, 1, newChild)
        return node
      }
    }
  } else if (direction === "before") {
    // If this node has the matching value...
    if (testFn(node, parent, depth)) {
      throw new Error("Cannot insert subtree before the root of tree")
    }

    // Check each child of this node for the matching value
    for (const [idx, child] of node[childrenKey].entries()) {
      if (testFn(child, node, depth + 1)) {
        // Found the matching node

        node[childrenKey].splice(idx, 0, subtree)
        return node
      } else {
        // Recursively call insertHelper() on this child node
        const newChild = insertHelper(child, node, depth + 1, options)

        if (newChild !== null) {
          // Found the subtree with the matching node
          return node
        }
      }
    }
  } else if (direction === "after") {
    // If this node has the matching value...
    if (testFn(node, parent, depth)) {
      throw new Error("Cannot insert subtree after the root of tree")
    }

    for (const [idx, child] of node[childrenKey].entries()) {
      if (testFn(child, node, depth + 1)) {
        // Found the matching node

        node[childrenKey].splice(idx + 1, 0, subtree)
        return node
      } else {
        // Recursively call insertHelper() on this child node
        const newChild = insertHelper(child, node, depth + 1, options)

        if (newChild !== null) {
          // Found the subtree with the matching node

          return node
        }
      }
    }
  }

  return null
}
