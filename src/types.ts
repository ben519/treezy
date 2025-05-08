// Base node type with generic children key and customizable props
// export type Node<
//   TChildrenKey extends string = "children",
//   TExtraProps extends Record<string, unknown> = Record<string, unknown>
// > = Omit<TExtraProps, TChildrenKey> & {
//   [K in TChildrenKey]?: Node<TChildrenKey, Record<string, unknown>>[]
// }

export type Node<
  TChildrenKey extends string,
  TExtraProps extends object = { [key: string]: unknown }
> = Omit<TExtraProps, TChildrenKey> & {
  [K in TChildrenKey]?: Node<TChildrenKey, { [key: string]: unknown }>[]
}

// const node1: Node = { id: 1, children: [] }
// const node2: Node = { id: 1, children: [{ id: "a", children: [] }] }
// const node3: Node = { id: 1, children: [{ name: "a", children: [] }] }
// const node4: Node = { id: 1, children: [{ name: "a", children: [] }] }
// const node5: Node = { kids: [{ kids: [] }] }
// const node6: Node = { kids: [{ kids: [] }] }
// const node7: Node<"kids"> = { id: 5, kids: [{ kids: [], foo: 11 }] }

// A leaf node explicitly has an empty array (or undefined) for its children key
export type LeafNode<
  TChildrenKey extends string,
  TExtraProps extends object = { [key: string]: unknown },
  TNode extends Node<TChildrenKey, TExtraProps> = Node<
    TChildrenKey,
    TExtraProps
  >
> = TNode & {
  [K in TChildrenKey]?: []
}

// Internal node must have at least one child
export type InternalNode<
  TChildrenKey extends string,
  TExtraProps extends object = { [key: string]: unknown },
  TNode extends Node<TChildrenKey, TExtraProps> = Node<
    TChildrenKey,
    TExtraProps
  >
> = TNode & {
  [K in TChildrenKey]: [Node<TChildrenKey>, ...Node<TChildrenKey>[]]
}

// UniformNode ensures each node has the same shape and recursive children structure
// export type UniformNode<
//   TChildrenKey extends string = "children",
//   TExtraProps extends object = { [key: string]: unknown },
//   TNode extends Node<TChildrenKey, TExtraProps> = Node<
//     TChildrenKey,
//     TExtraProps
//   >
// > = TNode & {
//   [K in TChildrenKey]?: UniformNode<TChildrenKey, TExtraProps, TNode>[]
// }
export type UniformNode<
  TChildrenKey extends string,
  TExtraProps extends object
> = Omit<TExtraProps, TChildrenKey> & {
  [K in TChildrenKey]?: UniformNode<TChildrenKey, TExtraProps>[]
}

// NodeWithId includes a required ID key and supports nested children with that same shape
export type NodeWithId<
  TChildrenKey extends string,
  TIdKey extends string,
  TId = string | number | symbol
> = {
  [K in TIdKey]: TId
} & {
  [K in TChildrenKey]?: NodeWithId<TChildrenKey, TIdKey, TId>[]
} & Record<Exclude<string, TChildrenKey | TIdKey>, unknown>
