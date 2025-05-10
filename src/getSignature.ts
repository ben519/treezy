import { NodeWithId } from "./types.js"

interface Options<TChildrenKey extends string, TIdKey extends string> {
  childrenKey: TChildrenKey
  closeChar?: string
  idKey: TIdKey
  openChar?: string
  separatorChar?: string
}

interface HelperOptions<TChildrenKey extends string, TIdKey extends string> {
  childrenKey: TChildrenKey
  closeChar: string
  idKey: TIdKey
  openChar: string
  separatorChar: string
}

export function getSignature<
  TChildrenKey extends string,
  TIdKey extends string,
  TId,
  TInputNode extends NodeWithId<TChildrenKey, TIdKey, TId>
>(tree: TInputNode, options: Options<TChildrenKey, TIdKey>): string {
  // Resolve defaults
  const childrenKey = options.childrenKey
  const closeChar = options?.closeChar ?? "]"
  const idKey = options.idKey
  const openChar = options?.openChar ?? "["
  const separatorChar = options?.separatorChar ?? ","

  // Make a Weak Set to keep track of nodes for circular reference
  const visitedNodesSet = new WeakSet()

  // Prepare options for the recursive helper
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

  // Check if this node has already been visited
  if (visited.has(node)) throw new Error("Circular reference detected")
  visited.add(node)

  // Get the id of this node
  let signature = String(node[idKey])

  // Get the children array.
  const childrenArray = node[childrenKey] as TCurrentNode[] | undefined

  // If this is a leaf node, return its signature
  if (!childrenArray || childrenArray.length === 0) {
    return signature
  }

  // Prepare options for the internal recursive helper.
  const helperOptions: HelperOptions<TChildrenKey, TIdKey> = {
    childrenKey,
    closeChar,
    idKey,
    openChar,
    separatorChar,
  }

  // Append openChar
  signature += openChar

  // Recursively get the signature of each child, then append them
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

  // Append closeChar
  signature += closeChar

  visited.delete(node)
  return signature
}
