import { Node } from "./types.js"

/**
 * Configuration options for tree traversal, modification, and node filtering.
 */
interface Options<
  TChildrenKey extends string = "children",
  TExtraProps extends Record<string, unknown> = {}
> {
  /**
   * Function to apply to matching nodes in the tree.
   * @param node - The current node being modified
   * @param parent - The parent of the current node (if any)
   * @param depth - The depth of the current node in the tree
   */
  applyFn: (
    node: Node<TChildrenKey, TExtraProps>,
    parent?: Node<TChildrenKey, TExtraProps> | null,
    depth?: number
  ) => any

  /**
   * Function to test each node during traversal.
   * @param node - The current node being tested
   * @param parent - The parent of the current node (if any)
   * @param depth - The depth of the current node in the tree
   * @returns True if the node should be processed, false otherwise
   * @default () => true
   */
  testFn?: (
    node: Node<TChildrenKey, TExtraProps>,
    parent?: Node<TChildrenKey, TExtraProps> | null,
    depth?: number
  ) => boolean

  /**
   * Determines which nodes to apply the function to relative to matching nodes.
   * - ancestors: Apply to ancestors of matching nodes
   * - descendants: Apply to descendants of matching nodes
   * - inclusiveAncestors: Apply to matching nodes and their ancestors
   * - inclusiveDescendants: Apply to matching nodes and their descendants
   * - matches: Apply only to matching nodes
   * @default "matches"
   */
  filter?:
    | "ancestors"
    | "descendants"
    | "inclusiveAncestors"
    | "inclusiveDescendants"
    | "matches"

  /**
   * When true, stops after applying to the first matching node or set of nodes.
   * @default false
   */
  firstOnly?: boolean

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
 * Applies a function to nodes in a tree based on specified criteria.
 * Traverses the tree and applies the given function to nodes that match
 * the test function, following the specified filter strategy.
 *
 * @param tree - The tree to process
 * @param options - Configuration options for applying the function
 * @returns The processed tree (either modified original or clone)
 * @throws Error if applyFn is not provided in options
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
 * // Double all values in the tree
 * const result = apply(tree, {
 *   applyFn: (node) => { node.value *= 2 },
 *   copy: true
 * });
 *
 * // Double values greater than 2
 * const result = apply(tree, {
 *   applyFn: (node) => { node.value *= 2 },
 *   testFn: (node) => node.value > 2,
 *   filter: "matches"
 * });
 */
export function apply<
  TChildrenKey extends string = "children",
  TExtraProps extends Record<string, unknown> = {},
  TNode extends Node<TChildrenKey, TExtraProps> = Node<
    TChildrenKey,
    TExtraProps
  >
>(tree: TNode, options: Options<TChildrenKey, TExtraProps>): TNode {
  const node = options?.copy === false ? tree : structuredClone(tree)
  applyHelper<TChildrenKey, TExtraProps>(node, null, 0, {
    childrenKey: "children" as TChildrenKey,
    copy: false,
    testFn: () => true,
    filter: "matches",
    firstOnly: false,
    ...options,
  })
  return node
}

/**
 * Helper function that performs the recursive application of functions to nodes.
 *
 * @param tree - The current tree or subtree being processed
 * @param options - Configuration options for the operation
 * @param parent - The parent node of the current tree (null for root)
 * @param depth - The current depth in the tree (0 for root)
 * @returns True if any modifications were made to this subtree
 *
 * @private This is an internal helper function not meant for direct use
 */
function applyHelper<
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
): boolean {
  const { applyFn, testFn, filter, firstOnly, childrenKey } = options

  if (testFn(node)) {
    // The current node passes the test function

    // Exit early?
    if (filter === "ancestors") {
      return true
    }

    // Apply the modifier function
    if (filter !== "descendants") {
      applyFn(node, parent, depth)
    }

    // Exit early?
    if (
      (filter === "matches" && firstOnly) ||
      filter === "inclusiveAncestors"
    ) {
      return true
    }

    // Iterate over each child of the current node
    for (const child of node[childrenKey]) {
      // Recursively call applyHelper on this child
      if (["descendants", "inclusiveDescendants"].includes(filter)) {
        applyHelper(child, node, depth + 1, {
          ...options,
          testFn: () => true,
          filter: "inclusiveDescendants",
        })
      } else if (filter === "matches") {
        applyHelper(child, node, depth + 1, options)
      }
    }

    return true
  } else {
    // The current node doesn't pass the test function

    let foundMatch = false

    // Iterate over each child of the current node
    for (const child of node[childrenKey]) {
      // Recursively call applyHelper on this child
      const subtree = applyHelper(child, node, depth + 1, options)

      // If there was a match..
      if (subtree) {
        foundMatch = true

        if (firstOnly) {
          return true
        }
      }
    }

    return foundMatch
  }
}
