import { Node, Tree } from "./types.js";


/**
* Configuration options for checking tree contents.
*/
interface Options {
  /** 
   * Function to test each node during traversal.
   * @param node - The current node being tested
   * @param parent - The parent of the current node (if any)
   * @param depth - The depth of the current node in the tree
   * @returns True if the node passes the test, false otherwise
   * @default () => true
   */
  testFn: (node: Node, parent?: Node | null, depth?: number) => boolean;

  /**
   * Name of the array property in tree that stores the child nodes
   * @default "children"
   */
  childrenProp?: string;
}

/**
* Checks if a tree contains any nodes that match the given criteria.
* Performs a depth-first search of the tree, testing each node against
* the provided test function.
* 
* @param tree - The tree to search
* @param options - Configuration options containing the test function
* @returns True if any node in the tree passes the test function, false otherwise
* @throws Error if testFn is not provided in options
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
* // Check if tree contains a node with value 2
* const hasTwo = contains(tree, {
*   testFn: (node) => node.value === 2
* }); // returns true
* 
* // Check if tree contains a node with value 4
* const hasFour = contains(tree, {
*   testFn: (node) => node.value === 4
* }); // returns false
*/
export function contains(tree: Tree, options: Options): boolean {

  // Check options
  if (!Object.hasOwn(options, "testFn")) {
    throw new Error("'testFn' must be given")
  }

  return containsHelper(tree, options, null, 0)
}

function containsHelper(tree: Tree, options: Options, parent: Node | null, depth: number): boolean {

  // Destructure options
  const { testFn, childrenProp = "children" } = options

  // Check for children nodes
  if (!Object.hasOwn(tree, childrenProp)) {
    throw new Error(`Children property '${ childrenProp }' is missing from at least one node`)
  } else if (!Array.isArray(tree[childrenProp])) {
    throw new Error(`Children property '${ childrenProp }' should be an array`)
  }

  // If this node passes testFn, return true
  if (testFn(tree, parent, depth)) {
    return true
  }

  // Recursively check this node's children
  for (const child of tree[childrenProp]) {
    if (containsHelper(child, options, tree, depth + 1)) {
      return true
    }
  }

  // If we made it here, no nodes pass testFn
  return false
}