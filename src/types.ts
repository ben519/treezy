/**
 * Represents a generic tree node with customizable properties and children.
 *
 * @template TChildrenKey - String literal type for the property name that will hold the children
 * @template TProps - Object type containing properties for the node (optionally excluding TChildrenKey)
 *
 * @remarks
 * This type provides a flexible foundation for building tree structures where:
 * - You can specify which property name will hold the children (e.g., 'children', 'items', 'subnodes')
 * - You can add any additional properties to the node through TProps
 * - Children property can be undefined (no children yet initialized) or an array of nodes
 * - Each child node follows the same structure, allowing for recursive tree composition
 *
 * @example
 * ```typescript
 * // Tree with 'children' as the children key and additional 'name' property
 * type MyTreeNode = Node<'children', { name: string }>;
 *
 * const tree: MyTreeNode = {
 *   name: 'Root',
 *   children: [
 *     { name: 'Child 1' },
 *     { name: 'Child 2', children: [{ name: 'Grandchild' }] }
 *   ]
 * };
 * ```
 */
export type Node<
  TChildrenKey extends string,
  TProps extends object = { [key: string]: unknown }
> = Omit<TProps, TChildrenKey> & {
  [K in TChildrenKey]?: Node<TChildrenKey, { [key: string]: unknown }>[]
}

/**
 * Represents a leaf node in a tree structure that explicitly has no children.
 *
 * @template TChildrenKey - String literal type for the property name that would hold children
 * @template TProps - Object type containing additional properties for the node
 *
 * @remarks
 * A LeafNode is a specialized Node that:
 * - Has its children key set to either undefined or an empty array
 * - Is typically used to represent terminal nodes in a tree (nodes with no children)
 * - Maintains the same property structure as other node types
 *
 * This type is useful for explicitly declaring that a node cannot have children,
 * providing additional type safety for terminal nodes in your tree structure.
 *
 * @example
 * ```typescript
 * // Define a leaf node with 'children' key and a 'name' property
 * type MyLeafNode = LeafNode<'children', { name: string }>;
 *
 * const leaf: MyLeafNode = {
 *   name: 'Leaf Node',
 *   children: [] // Must be empty array or undefined
 * };
 * ```
 */
export type LeafNode<
  TChildrenKey extends string,
  TProps extends object = { [key: string]: unknown }
> = Omit<TProps, TChildrenKey> & {
  [K in TChildrenKey]?: []
}

/**
 * Represents an internal node in a tree structure that must have at least one child.
 *
 * @template TChildrenKey - String literal type for the property name that holds children
 * @template TProps - Object type containing additional properties for the node
 *
 * @remarks
 * An InternalNode is a specialized Node that:
 * - Must have at least one child (enforced by the type system)
 * - Cannot be a leaf node
 * - Uses tuple syntax with rest parameters to ensure non-empty children array
 *
 * This type is useful when you need to guarantee that certain nodes in your tree
 * always have children, providing additional type safety and semantic clarity.
 *
 * @example
 * ```typescript
 * // Define an internal node with 'items' as children key and 'title' property
 * type MyInternalNode = InternalNode<'items', { title: string }>;
 *
 * const internalNode: MyInternalNode = {
 *   title: 'Internal Node',
 *   items: [{ title: 'Child Node' }] // Must have at least one child
 * };
 * ```
 */
export type InternalNode<
  TChildrenKey extends string,
  TProps extends object = { [key: string]: unknown }
> = Omit<TProps, TChildrenKey> & {
  [K in TChildrenKey]: [Node<TChildrenKey>, ...Node<TChildrenKey>[]]
}

/**
 * Represents a node in a uniform tree where all nodes have the same shape.
 *
 * @template TChildrenKey - String literal type for the property name that holds children
 * @template TProps - Object type containing additional properties for the node
 *
 * @remarks
 * A UniformNode ensures that:
 * - All nodes in the tree have exactly the same shape and property types
 * - Children have the same structure as their parent
 * - The extra properties are consistently applied throughout the tree
 *
 * This type is useful for homogeneous tree structures where every node
 * has the same capabilities and property requirements, regardless of its
 * position in the tree.
 *
 * @example
 * ```typescript
 * // Define a uniform node with consistent properties throughout the tree
 * type MyUniformNode = UniformNode<'children', {
 *   name: string;
 *   modified: Date;
 * }>;
 *
 * const uniformTree: MyUniformNode = {
 *   name: 'Root',
 *   modified: new Date(),
 *   children: [
 *     {
 *       name: 'Child',
 *       modified: new Date(),
 *       // Children would also have name and modified properties
 *     }
 *   ]
 * };
 * ```
 */
export type UniformNode<
  TChildrenKey extends string,
  TProps extends object
> = Omit<TProps, TChildrenKey> & {
  [K in TChildrenKey]?: UniformNode<TChildrenKey, TProps>[]
}

/**
 * Represents a node in a tree structure that requires a unique identifier.
 *
 * @template TChildrenKey - String literal type for the property name that holds children
 * @template TIdKey - String literal type for the property name that holds the identifier
 * @template TId - Type of the identifier value (defaults to string | number | symbol)
 * @template TProps - Object type containing additional properties for the node
 *
 * @remarks
 * A NodeWithId extends the base Node type by:
 * - Requiring a specific key to hold a unique identifier
 * - Allowing customization of both the identifier property name and value type
 * - Maintaining the recursive tree structure where all children also have IDs
 *
 * This type is particularly useful for trees that need stable references to nodes,
 * such as those used in UI components, databases, or any system where nodes need
 * to be uniquely identified and tracked.
 *
 * @example
 * ```typescript
 * // Define a node with ID using 'id' as the ID key and 'items' as children key
 * type MyNodeWithId = NodeWithId<'items', 'id', string, {
 *   name: string;
 *   createdAt: Date;
 * }>;
 *
 * const treeWithIds: MyNodeWithId = {
 *   id: 'root-1',
 *   name: 'Root Node',
 *   createdAt: new Date(),
 *   items: [
 *     {
 *       id: 'child-1',
 *       name: 'First Child',
 *       createdAt: new Date()
 *     }
 *   ]
 * };
 * ```
 */
export type NodeWithId<
  TChildrenKey extends string,
  TIdKey extends string,
  TId = string | number | symbol,
  TProps extends object = { [key: string]: unknown }
> = Omit<TProps, TChildrenKey | TIdKey> & {
  [K in TIdKey]: TId
} & {
  [K in TChildrenKey]?: NodeWithId<
    TChildrenKey,
    TIdKey,
    TId,
    { [key: string]: unknown }
  >[]
}
