import { NodeWithId } from "./types.js"

/**
 * Configuration options for `getSignature`.
 *
 * @template TChildrenKey - The string literal type of the key used to access children in the node.
 * @template TIdKey - The string literal type of the key used to access the node's unique ID.
 */
interface Options<TChildrenKey extends string, TIdKey extends string> {
  /** Key used to access child nodes */
  childrenKey: TChildrenKey

  /** Optional character used to denote the end of a group of children (default: "]") */
  closeChar?: string

  /** Key used to access the node's ID */
  idKey: TIdKey

  /** Optional character used to denote the start of a group of children (default: "[") */
  openChar?: string

  /** Optional character used to separate child node signatures (default: ",") */
  separatorChar?: string
}

/**
 * Fully resolved helper options for internal use, with all characters required.
 *
 * @template TChildrenKey - The key to access children.
 * @template TIdKey - The key to access IDs.
 */
interface HelperOptions<TChildrenKey extends string, TIdKey extends string> {
  childrenKey: TChildrenKey
  closeChar: string
  idKey: TIdKey
  openChar: string
  separatorChar: string
}

/**
 * Generates a string signature that represents the structure of a tree.
 *
 * The signature is constructed by recursively appending each node's ID,
 * followed by its children enclosed in customizable delimiters. Circular
 * references are detected and will throw an error.
 *
 * @template TChildrenKey - The key used to access child nodes.
 * @template TIdKey - The key used to access node IDs.
 * @template TId - The type of the node ID.
 * @template TInputNode - The type of the input node, extending NodeWithId.
 *
 * @param tree - The root node of the tree.
 * @param options - Options for customizing the signature format.
 * @returns A string representing the tree's signature.
 *
 * @throws Will throw an error if a circular reference is detected in the tree.
 */
export function getSignature<
  TChildrenKey extends string,
  TIdKey extends string,
  TId,
  TInputNode extends NodeWithId<TChildrenKey, TIdKey, TId>
>(tree: TInputNode, options: Options<TChildrenKey, TIdKey>): string {
  const childrenKey = options.childrenKey
  const closeChar = options?.closeChar ?? "]"
  const idKey = options.idKey
  const openChar = options?.openChar ?? "["
  const separatorChar = options?.separatorChar ?? ","

  const visitedNodesSet = new WeakSet()

  const helperOptions: HelperOptions<TChildrenKey, TIdKey> = {
    childrenKey,
    closeChar,
    idKey,
    openChar,
    separatorChar,
  }

  return getSignatureHelper<TChildrenKey, TIdKey, TId, TInputNode>(
    tree,
    visitedNodesSet,
    helperOptions
  )
}

/**
 * Recursive helper function that builds the signature string for a tree.
 *
 * @template TChildrenKey - The key used to access child nodes.
 * @template TIdKey - The key used to access node IDs.
 * @template TId - The type of the node ID.
 * @template TCurrentNode - The current node type in the recursion.
 *
 * @param node - The current node to process.
 * @param visited - A WeakSet used to track visited nodes for circular reference detection.
 * @param options - Resolved helper options including delimiters and keys.
 * @returns A partial or full signature string for the given node and its children.
 *
 * @throws Will throw an error if a circular reference is detected.
 */
function getSignatureHelper<
  TChildrenKey extends string,
  TIdKey extends string,
  TId,
  TCurrentNode extends NodeWithId<TChildrenKey, TIdKey, TId>
>(
  node: TCurrentNode,
  visited: WeakSet<object>,
  options: HelperOptions<TChildrenKey, TIdKey>
): string {
  const { childrenKey, closeChar, idKey, openChar, separatorChar } = options

  if (visited.has(node)) throw new Error("Circular reference detected")
  visited.add(node)

  let signature = String(node[idKey])
  const childrenArray = node[childrenKey] as TCurrentNode[] | undefined

  if (!childrenArray || childrenArray.length === 0) {
    return signature
  }

  const helperOptions: HelperOptions<TChildrenKey, TIdKey> = {
    childrenKey,
    closeChar,
    idKey,
    openChar,
    separatorChar,
  }

  signature += openChar

  for (const [i, child] of childrenArray.entries()) {
    signature += getSignatureHelper<TChildrenKey, TIdKey, TId, TCurrentNode>(
      child,
      visited,
      helperOptions
    )
    if (i < childrenArray.length - 1) {
      signature += separatorChar
    }
  }

  signature += closeChar

  visited.delete(node)
  return signature
}
