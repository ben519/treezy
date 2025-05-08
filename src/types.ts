// Base node type with generic children key and customizable props
export type Node<
  TChildrenKey extends string,
  TExtraProps extends object = { [key: string]: unknown }
> = Omit<TExtraProps, TChildrenKey> & {
  [K in TChildrenKey]?: Node<TChildrenKey, { [key: string]: unknown }>[]
}

// A leaf node explicitly has an empty array (or undefined) for its children key
export type LeafNode<
  TChildrenKey extends string,
  TExtraProps extends object = { [key: string]: unknown }
> = Omit<TExtraProps, TChildrenKey> & {
  [K in TChildrenKey]?: []
}

// Internal node must have at least one child
export type InternalNode<
  TChildrenKey extends string,
  TExtraProps extends object = { [key: string]: unknown }
> = Omit<TExtraProps, TChildrenKey> & {
  [K in TChildrenKey]: [Node<TChildrenKey>, ...Node<TChildrenKey>[]]
}

// A Uniform node is a Node whose children have the same shape as their parent
export type UniformNode<
  TChildrenKey extends string,
  TExtraProps extends object
> = Omit<TExtraProps, TChildrenKey> & {
  [K in TChildrenKey]?: UniformNode<TChildrenKey, TExtraProps>[]
}

// NodeWithId includes a required ID key>
export type NodeWithId<
  TChildrenKey extends string,
  TIdKey extends string,
  TId = string | number | symbol,
  TExtraProps extends object = { [key: string]: unknown }
> = Omit<TExtraProps, TChildrenKey | TIdKey> & {
  [K in TIdKey]: TId
} & {
  [K in TChildrenKey]?: NodeWithId<
    TChildrenKey,
    TIdKey,
    TId,
    { [key: string]: unknown }
  >[]
}
