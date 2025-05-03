import { Node } from "./types.js"

/**
 * Configuration options for extracting values from nodes
 */
interface Options<
  TChildrenKey extends string = "children",
  TExtraProps extends Record<string, unknown> = {}
> {
  /**
   * Function to extract a value from each node
   * @param node - The current node being processed
   * @param parent - The parent node of the current node, if any
   * @param depth - The depth of the current node in the tree (0-based)
   * @returns The value to extract from this node
   * @default (x) => x - return each node if not specified
   */
  getFn?: (
    node: Node<TChildrenKey, TExtraProps>,
    parent?: Node<TChildrenKey, TExtraProps> | null,
    depth?: number
  ) => any

  /**
   * Function to filter which nodes should be processed
   * @param node - The current node being tested
   * @param parent - The parent node of the current node, if any
   * @param depth - The depth of the current node in the tree (0-based)
   * @returns boolean indicating whether this node should be processed
   * @default () => true - processes all nodes if not specified
   */
  testFn?: (
    node: Node<TChildrenKey, TExtraProps>,
    parent?: Node<TChildrenKey, TExtraProps> | null,
    depth?: number
  ) => boolean

  /**
   * Determines which related nodes to include in the results
   * @default "matches"
   */
  filter?:
    | "ancestors"
    | "descendants"
    | "inclusiveAncestors"
    | "inclusiveDescendants"
    | "matches"

  /**
   * Whether to stop after finding the first match
   * @default false
   */
  firstOnly?: boolean

  /**
   * Whether to create a deep copy of the tree before traversing
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
 * Extracts values from nodes in a tree based on various filtering criteria.
 *
 * @param tree - The root node of the tree to search
 * @param options - Configuration options for extracting values
 * @param options.getFn - Function to extract a value from each node (defaults to the node)
 * @param options.testFn - Function to filter which nodes to process (defaults to all nodes)
 * @param options.filter - Determines which related nodes to include:
 *   - "matches": Only nodes matching testFn (default)
 *   - "ancestors": Parent nodes of matches
 *   - "descendants": Child nodes of matches
 *   - "inclusiveAncestors": Matches and their parent nodes
 *   - "inclusiveDescendants": Matches and their child nodes
 * @param options.firstOnly - If true, stop after first match (defaults to false)
 * @param options.copy - Whether to create a deep copy of the tree before traversing (defaults to true)
 *
 * @returns Array of values extracted from the matching nodes
 *
 * @throws {Error} If no getFn is provided in options
 *
 * @example
 * const tree = {
 *   id: 1,
 *   value: 10,
 *   children: [{
 *     id: 2,
 *     value: 20,
 *     children: [{
 *       id: 3,
 *       value: 30,
 *       children: []
 *     }]
 *   }]
 * };
 *
 * // Get values of all nodes
 * getValues(tree, {
 *   getFn: node => node.value
 * }); // Returns [10, 20, 30]
 *
 * // Get values of nodes with even IDs and their ancestors
 * getValues(tree, {
 *   getFn: node => node.value,
 *   testFn: node => node.id % 2 === 0,
 *   filter: "inclusiveAncestors"
 * }); // Returns [10, 20]
 *
 * // Get first matching value only
 * getValues(tree, {
 *   getFn: node => node.value,
 *   testFn: node => node.value > 15,
 *   firstOnly: true
 * }); // Returns [20]
 */
export function getValues<
  TChildrenKey extends string = "children",
  TExtraProps extends Record<string, unknown> = {},
  TNode extends Node<TChildrenKey, TExtraProps> = Node<
    TChildrenKey,
    TExtraProps
  >
>(tree: TNode, options?: Options<TChildrenKey, TExtraProps>): any[] {
  const result = getValuesHelper<TChildrenKey, TExtraProps>(
    options?.copy ? structuredClone(tree) : tree,
    null,
    0,
    {
      childrenKey: "children" as TChildrenKey,
      copy: false,
      getFn: (x: Node<TChildrenKey, TExtraProps>) => x,
      testFn: () => true,
      filter: "matches",
      firstOnly: false,
      ...options,
    }
  )

  // Return
  return result ?? []
}

/**
 * Helper function that recursively traverses the tree to collect values
 *
 * @param tree - Current node being examined
 * @param options - Configuration options
 * @param parent - Parent of the current node
 * @param depth - Current depth in the tree (0-based)
 * @returns Array of collected values, or null if no matches in this subtree
 *
 * @internal
 * This is an internal helper function and should not be called directly.
 */
function getValuesHelper<
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
): any[] | null {
  const { getFn, testFn, filter, firstOnly, childrenKey } = options

  if (testFn(node, parent, depth)) {
    // The current node passes the test function

    // Exit early?
    if (filter === "ancestors" && firstOnly) {
      return []
    }

    // Exit early?
    if (["inclusiveAncestors", "matches"].includes(filter) && firstOnly) {
      return [getFn(node, parent, depth)]
    }

    // Array to store values
    const result = []

    if (
      ["inclusiveAncestors", "inclusiveDescendants", "matches"].includes(filter)
    ) {
      result.push(getFn(node, parent, depth))
    }

    // Iterate over each child of the current node
    for (const child of node[childrenKey]) {
      // Recursively call getValuesHelper on this child
      if (["descendants", "inclusiveDescendants"].includes(filter)) {
        const vals = getValuesHelper(child, node, depth + 1, {
          ...options,
          testFn: () => true,
          filter: "inclusiveDescendants",
        })
        if (vals) result.push(...vals)
      } else if (["ancestors", "inclusiveAncestors"].includes(filter)) {
        const vals = getValuesHelper(child, node, depth + 1, {
          ...options,
          filter: "inclusiveAncestors",
        })
        if (vals) result.push(...vals)
      } else if (filter === "matches") {
        const vals = getValuesHelper(child, node, depth + 1, options)
        if (vals) result.push(...vals)
      }
    }

    return result
  } else {
    // The current node doesn't pass the test function

    let foundMatch = false

    // Iterate over each child of the current node
    for (const child of node[childrenKey]) {
      // Recursively call getNodesHelper on this child
      const vals = getValuesHelper(child, node, depth + 1, options)

      // If there was a match..
      if (vals) {
        foundMatch = true
        if (firstOnly) {
          if (["ancestors", "inclusiveAncestors"].includes(filter)) {
            return [getFn(node, parent, depth), ...vals]
          } else {
            return vals
          }
        }
      }
    }

    return foundMatch ? [getFn(node, parent, depth)] : null
  }
}
