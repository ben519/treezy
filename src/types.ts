/**
 * Represents a tree node with optional children.
 *
 * @template TChildrenKey - String literal type for the children property key, defaults to "children"
 *
 * This base node type:
 * - Allows any arbitrary properties via index signature
 * - Has an optional array of child nodes under the specified children key
 */
export type Node<TChildrenKey extends string = "children"> = {
  [key: string]: unknown
} & {
  [K in TChildrenKey]?: Node<TChildrenKey>[]
}

/**
 * Represents a leaf node in a tree structure (a node with no children).
 *
 * @template TChildrenKey - String literal type for the children property key, defaults to "children"
 *
 * A leaf node:
 * - Inherits all properties of the base Node type
 * - Explicitly constrains the children property to be either undefined or an empty array
 */
export type LeafNode<TChildrenKey extends string = "children"> =
  Node<TChildrenKey> & {
    [K in TChildrenKey]?: []
  }

/**
 * Represents an internal node in a tree structure (a node with at least one child).
 *
 * @template TChildrenKey - String literal type for the children property key, defaults to "children"
 *
 * An internal node:
 * - Inherits all properties of the base Node type
 * - Requires at least one child node in its children array (non-empty array)
 */
export type InternalNode<TChildrenKey extends string = "children"> =
  Node<TChildrenKey> & {
    children: [Node<TChildrenKey>, ...Node<TChildrenKey>[]]
  }

/**
 * Represents a node in a uniform tree structure where all nodes share the same extra properties.
 *
 * @template TChildrenKey - String literal type for the children property key, defaults to "children"
 * @template TExtraProps - Record type containing additional properties that all nodes in the tree will have
 *
 * A uniform node:
 * - Includes all properties specified in TExtraProps
 * - Has an optional array of child nodes with the same structure and properties
 * - Creates a consistent tree where all nodes have the same shape
 */
export type UniformNode<
  TChildrenKey extends string = "children",
  TExtraProps extends object = {}
> = TExtraProps & {
  [K in TChildrenKey]?: UniformNode<TChildrenKey, TExtraProps>[]
}

/**
 * Represents a tree node structure with a unique identifier and optional children.
 *
 * This type is designed for creating tree-like data structures where each node:
 * - Has a unique identifier of type TId (defaults to string)
 * - Can contain any additional properties as key-value pairs
 * - Can optionally contain children of the same node type
 *
 * @template TChildrenKey - The property name for the children array (defaults to "children")
 * @template TIdKey - The property name for the identifier (defaults to "id")
 * @template TId - The type of the identifier (defaults to string | number | symbol)
 */
export type NodeWithId<
  TChildrenKey extends string = "children",
  TIdKey extends string = "id",
  TId = string | number | symbol
> = {
  [key: string]: unknown
} & {
  [K in TIdKey]: TId
} & {
  [K in TChildrenKey]?: NodeWithId<TChildrenKey, TIdKey, TId>[]
}
