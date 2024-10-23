import { Tree } from "./types.js"

interface Options {
  idProp: string,
  openChar?: string,
  closeChar?: string,
  separatorChar?: string,
}

/**
 * Generate a string signature for this tree
 * 
 * @param tree 
 * @param options 
 * @returns 
 */
export function getSignature(tree: Tree, options: Options): string {

  const { idProp, openChar = "[", closeChar = "]", separatorChar = "," } = options

  if (!Object.hasOwn(tree, idProp)) {
    throw new Error(`idProp '${ idProp }' is missing from a node in tree`)
  }

  let signature = "" + tree[idProp]

  if (tree.children && tree.children.length > 0) {
    signature += openChar

    for (const child of tree.children) {
      signature += getSignature(child, options) + separatorChar
    }

    signature = signature.replace(/,$/, closeChar)
  }

  return signature
}