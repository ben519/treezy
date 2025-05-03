/**
 * Represents a node in a tree structure.
 * A node contains an array of child nodes and can have any additional string-keyed properties.
 *
 * @example
 * const node: Node = {
 *   children: [],
 *   id: "123",
 *   value: 42,
 *   metadata: { created: "2024-01-01" }
 * };
 */

export type Node<TChildrenKey extends string = "children"> = {
  [key: string]: any
} & {
  [K in TChildrenKey]: Node<TChildrenKey>[]
}

export type Tree<TChildrenKey extends string = "children"> = Node<TChildrenKey>
