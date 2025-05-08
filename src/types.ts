export type Node<
  TChildrenKey extends string = "children",
  TExtraProps = { [key: string]: any }
> = Omit<TExtraProps, TChildrenKey> & {
  [K in TChildrenKey]?: Node<TChildrenKey, TExtraProps>[]
}

export type LeafNode<
  TChildrenKey extends string = "children",
  TNode extends Node<TChildrenKey> = Node<TChildrenKey>
> = TNode & {
  [K in TChildrenKey]?: []
}

export type InternalNode<TChildrenKey extends string = "children"> =
  Node<TChildrenKey> & {
    children: [Node<TChildrenKey>, ...Node<TChildrenKey>[]]
  }

export type UniformNode<
  TChildrenKey extends string = "children",
  TExtraProps extends object = {}
> = TExtraProps & {
  [K in TChildrenKey]?: UniformNode<TChildrenKey, TExtraProps>[]
}

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

// const node1: Node = { id: 1, children: [] }
// const node2: Node = { id: 1, children: [{ id: "a", children: [] }] }
// const node3: Node = { id: 1, children: [{ name: "a", children: [] }] }
// const node3: Node = { id: 1, children: [{ name: "a", children: [] }] }
