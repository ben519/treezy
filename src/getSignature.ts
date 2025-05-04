import { Node } from "./types.js"

/**
 * Configuration options for signature generation
 */
interface Options<TChildrenKey extends string = "children"> {
  /**
   * Property name to use as the node identifier in the tree
   * Must exist on all nodes in the tree
   */
  idKey: string

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
  childrenKey?: TChildrenKey
}

/**
 * Generates a string signature representation of a tree structure where each node's ID
 * is concatenated with its children's signatures in a nested format.
 *
 * @param tree - The tree structure to generate a signature for
 * @param options - Configuration options for generating the signature
 * @param options.idKey - The property name to use as the node identifier
 * @param options.openChar - Character to open a group of children (defaults to "[")
 * @param options.closeChar - Character to close a group of children (defaults to "]")
 * @param options.separatorChar - Character to separate sibling nodes (defaults to ",")
 *
 * @returns A string signature representing the tree structure
 *
 * @throws {Error} If the specified idKey is missing from any node in the tree
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
 * getSignature(tree, { idKey: "id" });
 *
 * // Custom format: "1(2;3)"
 * getSignature(tree, {
 *   idKey: "id",
 *   openChar: "(",
 *   closeChar: ")",
 *   separatorChar: ";"
 * });
 */
export function getSignature<
  TChildrenKey extends string = "children",
  TExtraProps extends Record<string, unknown> = {},
  TNode extends Node<TChildrenKey, TExtraProps> = Node<
    TChildrenKey,
    TExtraProps
  >
>(tree: TNode, options: Options<TChildrenKey>): string {
  const childrenKey = options.childrenKey ?? ("children" as TChildrenKey)

  const {
    idKey,
    openChar = "[",
    closeChar = "]",
    separatorChar = ",",
  } = options

  let signature = "" + tree[idKey]

  if (tree[childrenKey] && tree[childrenKey].length > 0) {
    signature += openChar
    for (const child of tree[childrenKey]) {
      signature += getSignature(child, options) + separatorChar
    }
    signature = signature.replace(/,$/, closeChar)
  }

  return signature
}
