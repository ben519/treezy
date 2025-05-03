import { Node } from "./types.js"

/**
 * Configuration options for reducing a tree to a value.
 */
interface Options {
  /**
   * Function to execute on each node of the tree
   * @param node - Current node being processed
   * @param initialVal - Accumulated value from previous iterations
   * @param parent - Parent node of the current node, null for root
   * @param depth - Current depth level in the tree, starting at 0
   * @returns The accumulated value after processing the current node
   */
  reduceFn: (
    node: Node,
    initialVal: any,
    parent?: Node | null,
    depth?: number
  ) => any

  /**
   * Initial value to use for the reduction operation
   */
  initialVal: any

  /**
   * Whether to operate on a copy of the tree or the original
   * @defaultValue true
   */
  copy?: boolean

  /**
   * Name of the array property in tree that stores the child nodes
   * @default "children"
   */
  childrenKey?: string
}

/**
 * Performs a reduction operation on a tree structure, traversing it in a depth-first manner
 * and applying a reducer function to accumulate a value.
 *
 * @remarks
 * The function traverses the tree in a depth-first manner, applying the reducer function
 * to each node and accumulating a value. The reducer function receives the current node,
 * the accumulated value, the parent node, and the current depth as parameters.
 *
 * @param tree - The tree structure to reduce
 * @param options - Configuration options for the reduction operation
 * @param options.reduceFn - Function to execute on each node
 * @param options.initialVal - Initial value for the reduction
 * @param options.copy - Whether to operate on a copy of the tree (defaults to true)
 *
 * @returns The final accumulated value after processing all nodes
 *
 * @throws {Error} When reduceFn is not provided in options
 * @throws {Error} When initialVal is not provided in options
 *
 * @example
 * ```typescript
 * const tree = {
 *   value: 1,
 *   children: [
 *     { value: 2, children: [] },
 *     { value: 3, children: [] }
 *   ]
 * };
 *
 * const sum = reduce(tree, {
 *   reduceFn: (node, sum) => sum + node.value,
 *   initialVal: 0
 * }); // Returns 6
 * ```
 */
export function reduce(tree: Node, options: Options): any {
  // Check options
  if (!Object.hasOwn(options, "reduceFn")) {
    throw new Error("'reduceFn' must be given")
  }
  if (!Object.hasOwn(options, "initialVal")) {
    throw new Error("'initialVal' must be given")
  }

  // Destructure options
  const { copy = true } = options

  // Call the helper function
  const result = reduceHelper(
    copy ? structuredClone(tree) : tree,
    options,
    null,
    0
  )

  // Return
  return result
}

/**
 * Helper function that performs the actual recursive reduction operation
 *
 * @internal
 * @param tree - Current tree node being processed
 * @param options - Reduction options
 * @param parent - Parent node of the current tree node
 * @param depth - Current depth in the tree
 * @returns Accumulated value after processing the current subtree
 */
function reduceHelper(
  tree: Node,
  options: Options,
  parent: Node | null,
  depth: number
): any {
  // Destructure options
  const { reduceFn, initialVal, childrenKey = "children" } = options

  // Check for children nodes
  if (!Object.hasOwn(tree, childrenKey)) {
    throw new Error(
      `Children property '${childrenKey}' is missing from at least one node`
    )
  } else if (!Array.isArray(tree[childrenKey])) {
    throw new Error(`Children property '${childrenKey}' should be an array`)
  }

  // Apply the reduceFn to this node
  let val = reduceFn(tree, initialVal, parent, depth)

  // Recursion
  for (const child of tree[childrenKey]) {
    val = reduceHelper(child, { reduceFn, initialVal: val }, tree, depth + 1)
  }

  return val
}
