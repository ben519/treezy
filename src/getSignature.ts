import { Node } from "./types.js"

/**
 * Configuration options for signature generation
 */
interface Options {
  /**
   * Property name to use as the node identifier in the tree
   * Must exist on all nodes in the tree
   */
  idProp: string

  /**
   * Character used to open a group of child nodes
   * @default "["
   */
  openChar?: string

  /**
   * Character used to close a group of child nodes
   * @default "]"
   */
  closeChar?: string

  /**
   * Character used to separate sibling nodes
   * @default ","
   */
  separatorChar?: string

  /**
   * Name of the array property in tree that stores the child nodes
   * @default "children"
   */
  childrenKey?: string
}

/**
 * Generates a string signature representation of a tree structure where each node's ID
 * is concatenated with its children's signatures in a nested format.
 *
 * @param tree - The tree structure to generate a signature for
 * @param options - Configuration options for generating the signature
 * @param options.idProp - The property name to use as the node identifier
 * @param options.openChar - Character to open a group of children (defaults to "[")
 * @param options.closeChar - Character to close a group of children (defaults to "]")
 * @param options.separatorChar - Character to separate sibling nodes (defaults to ",")
 *
 * @returns A string signature representing the tree structure
 *
 * @throws {Error} If the specified idProp is missing from any node in the tree
 *
 * @example
 * const tree = {
 *   id: 1,
 *   children: [
 *     { id: 2, children: [] },
 *     { id: 3, children: [] }
 *   ]
 * };
 *
 * // Default format: "1[2,3]"
 * getSignature(tree, { idProp: "id" });
 *
 * // Custom format: "1(2;3)"
 * getSignature(tree, {
 *   idProp: "id",
 *   openChar: "(",
 *   closeChar: ")",
 *   separatorChar: ";"
 * });
 */
export function getSignature(tree: Node, options: Options): string {
  // Destructure options
  const { childrenKey = "children" } = options

  // Check for children nodes
  if (!Object.hasOwn(tree, childrenKey)) {
    throw new Error(
      `Children property '${childrenKey}' is missing from at least one node`
    )
  } else if (!Array.isArray(tree[childrenKey])) {
    throw new Error(`Children property '${childrenKey}' should be an array`)
  }

  const {
    idProp,
    openChar = "[",
    closeChar = "]",
    separatorChar = ",",
  } = options

  if (!Object.hasOwn(tree, idProp)) {
    throw new Error(`idProp '${idProp}' is missing from a node in tree`)
  }

  let signature = "" + tree[idProp]

  if (tree[childrenKey] && tree[childrenKey].length > 0) {
    signature += openChar

    for (const child of tree[childrenKey]) {
      signature += getSignature(child, options) + separatorChar
    }

    signature = signature.replace(/,$/, closeChar)
  }

  return signature
}
