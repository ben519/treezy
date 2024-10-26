import { Node, Tree } from "./types.js";

/**
* Configuration options for extracting values from nodes
*/
interface Options {
  /**
   * Function to extract a value from each node
   * @param node - The current node being processed
   * @param parent - The parent node of the current node, if any
   * @param depth - The depth of the current node in the tree (0-based)
   * @returns The value to extract from this node
   */
  getFn: (node: Node, parent?: Node | null, depth?: number) => any;

  /**
   * Function to filter which nodes should be processed
   * @param node - The current node being tested
   * @param parent - The parent node of the current node, if any
   * @param depth - The depth of the current node in the tree (0-based)
   * @returns boolean indicating whether this node should be processed
   * @default () => true - processes all nodes if not specified
   */
  testFn?: (node: Node, parent?: Node | null, depth?: number) => boolean;

  /**
   * Determines which related nodes to include in the results
   * @default "matches"
   */
  filter?: "ancestors" | "descendants" | "inclusiveAncestors" | "inclusiveDescendants" | "matches";

  /**
   * Whether to stop after finding the first match
   * @default false
   */
  firstOnly?: boolean;

  /**
   * Whether to create a deep copy of the tree before traversing
   * @default true
   */
  copy?: boolean;

  /**
   * Name of the array property in tree that stores the child nodes
   * @default "children"
   */
  childrenProp?: string;
}


/**
* Extracts values from nodes in a tree based on various filtering criteria.
* 
* @param tree - The root node of the tree to search
* @param options - Configuration options for extracting values
* @param options.getFn - Function to extract a value from each node
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
export function getValues(tree: Tree, options: Options): any[] {

  // Check options
  if (!Object.hasOwn(options, "getFn")) {
    throw new Error("'getFn' must be given")
  }

  // Destructure options
  const { copy = true } = options ?? {}

  // Call helper function
  const result = getValuesHelper(
    copy ? structuredClone(tree) : tree,
    options,
    null,
    0
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
function getValuesHelper(
  tree: Tree,
  options: Options,
  parent: Node | null,
  depth: number
): any[] | null {

  // Destructure options
  const {
    getFn,
    testFn = () => true,
    filter = "matches",
    firstOnly = false,
    childrenProp = "children",
  } = options

  // Check for children nodes
  if (!Object.hasOwn(tree, childrenProp)) {
    throw new Error(`Children property '${ childrenProp }' is missing from at least one node`)
  } else if (!Array.isArray(tree[childrenProp])) {
    throw new Error(`Children property '${ childrenProp }' should be an array`)
  }

  if (testFn(tree, parent, depth)) {
    // The current node passes the test function

    // Exit early?
    if (filter === "ancestors" && firstOnly) {
      return []
    }

    // Exit early?
    if (["inclusiveAncestors", "matches"].includes(filter) && firstOnly) {
      return [getFn(tree, parent, depth)]
    }

    // Array to store values
    const result = []

    if (["inclusiveAncestors", "inclusiveDescendants", "matches"].includes(filter)) {
      result.push(getFn(tree, parent, depth))
    }

    // Iterate over each child of the current node
    for (const child of tree[childrenProp]) {

      // Recursively call getValuesHelper on this child
      if (["descendants", "inclusiveDescendants"].includes(filter)) {
        const vals = getValuesHelper(child, { ...options, testFn: () => true, filter: "inclusiveDescendants" }, tree, depth + 1)
        if (vals) result.push(...vals)
      } else if (["ancestors", "inclusiveAncestors"].includes(filter)) {
        const vals = getValuesHelper(child, { ...options, filter: "inclusiveAncestors" }, tree, depth + 1)
        if (vals) result.push(...vals)
      } else if (filter === "matches") {
        const vals = getValuesHelper(child, options, tree, depth + 1)
        if (vals) result.push(...vals)
      }
    }

    return result

  } else {
    // The current node doesn't pass the test function

    let foundMatch = false

    // Iterate over each child of the current node
    for (const child of tree[childrenProp]) {

      // Recursively call getNodesHelper on this child
      const vals = getValuesHelper(child, options, tree, depth + 1)

      // If there was a match..
      if (vals) {
        foundMatch = true
        if (firstOnly) {
          if (["ancestors", "inclusiveAncestors"].includes(filter)) {
            return [getFn(tree, parent, depth), ...vals]
          } else {
            return vals
          }
        }
      }
    }

    return foundMatch ? [getFn(tree, parent, depth)] : null
  }
}
