import { Node, UniformNode } from "./types.js"

interface Options<TChildrenKey extends string> {
  childrenKey: TChildrenKey
}

export function isNodeUniformNode<
  TChildrenKey extends string,
  TExtraProps extends object = {}
>(
  node: Node<TChildrenKey>,
  options: Options<TChildrenKey>
): node is UniformNode<TChildrenKey, TExtraProps> {
  // Destructure options
  const { childrenKey } = options

  // Get the expected keys from the first node (using Object.keys)
  const nodeKeys = Object.keys(node).filter((key) => key !== childrenKey)

  // Convert nodeKeys to a Set for more efficient lookups
  const nodeKeysSet = new Set(nodeKeys)

  // If there are no children, we can't validate further, so assume this node is uniform
  const children = node[childrenKey]
  if (!children || children.length === 0) {
    return true
  }

  // Create a map of property types from the parent node to compare with children
  const propertyTypes: Record<string, string> = {}
  for (const key of nodeKeys) {
    propertyTypes[key] = typeof node[key]
  }

  // Check each child
  for (const child of children) {
    // Each child should have the same keys as the parent (excluding children key)
    const childKeys = Object.keys(child).filter((key) => key !== childrenKey)

    // Check if child has exactly the same keys as parent
    if (childKeys.length !== nodeKeys.length) {
      return false
    }

    // Check that each key exists and has the same type
    for (const key of childKeys) {
      if (!nodeKeysSet.has(key) || typeof child[key] !== propertyTypes[key]) {
        return false
      }
    }

    // Recursively check if the child's children are also uniform
    if (!isNodeUniformNode<TChildrenKey, TExtraProps>(child, options)) {
      return false
    }
  }

  return true
}
