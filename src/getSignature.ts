import { NodeWithId } from "./types.js"

/**
 * Configuration options for signature generation
 */
interface Options<
  TChildrenKey extends string = "children",
  TIdKey extends string = "id"
> {
  /**
   * Property name to use as the node identifier in the tree
   * Must exist on all nodes in the tree
   */
  idKey?: TIdKey

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

export function getSignature<
  TChildrenKey extends string = "children",
  TIdKey extends string = "id",
  TId = string | number | symbol,
  TInputNode extends NodeWithId<TChildrenKey, TIdKey, TId> = NodeWithId<
    TChildrenKey,
    TIdKey,
    TId
  >
>(tree: TInputNode, options?: Options<TChildrenKey, TIdKey>): string {
  // Resolve defaults
  const childrenKey: TChildrenKey =
    options?.childrenKey ?? ("children" as TChildrenKey)
  const idKey = options?.idKey ?? ("id" as TIdKey)
  const openChar = options?.openChar ?? "["
  const closeChar = options?.closeChar ?? "]"
  const separatorChar = options?.separatorChar ?? ","

  // Get the id of this node
  let signature = String(tree[idKey])

  // Get the children array.
  const childrenArray = tree[childrenKey] as TInputNode[] | undefined

  // If this is a leaf node, return its signature
  if (!childrenArray || childrenArray.length === 0) {
    return signature
  }

  // This node has children..

  // Prepare options for the internal recursive helper.
  const helperOptions: Options<TChildrenKey, TIdKey> = {
    childrenKey,
    idKey,
    openChar,
    closeChar,
    separatorChar,
  }

  // Append openChar
  signature += openChar

  // Append the signature of each child
  for (const [i, child] of childrenArray.entries()) {
    signature += getSignature<TChildrenKey, TIdKey, TId, TInputNode>(
      child,
      helperOptions
    )
    if (i < childrenArray.length - 1) {
      signature += separatorChar
    }
  }

  // Append closeChar
  signature += closeChar

  return signature
}
