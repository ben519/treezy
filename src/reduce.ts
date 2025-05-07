import { Node, UniformNode } from "./types.js"

// Options for when the input tree is a generic Node
interface GenericNodeOptions<
  TChildrenKey extends string = "children",
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
> {
  reduceFn: (
    node: TInputNode,
    initialVal: any,
    parent?: TInputNode | null,
    depth?: number
  ) => any
  initialVal: any
  childrenKey?: TChildrenKey
}

// Options specifically for when the input tree is a UniformNode
interface UniformNodeOptions<
  TChildrenKey extends string = "children",
  TExtraProps extends object = {},
  TInputNode extends UniformNode<TChildrenKey, TExtraProps> = UniformNode<
    TChildrenKey,
    TExtraProps
  >
> {
  reduceFn: (
    node: TInputNode,
    initialVal: any,
    parent?: TInputNode | null,
    depth?: number
  ) => any
  initialVal: any
  childrenKey?: TChildrenKey
}

// --- Helper Options ---
// This interface defines the shape of options the recursive helper will use.
// TCurrentNode represents the type of the node currently being processed by the helper.
interface HelperOptions<
  TChildrenKey extends string = "children",
  TCurrentNode extends Node<TChildrenKey> = Node<TChildrenKey>
> {
  childrenKey: TChildrenKey
  reduceFn: (
    node: TCurrentNode,
    initialVal: any,
    parent?: TCurrentNode | null,
    depth?: number
  ) => any
  initialVal: any
}

// --- reduce Function Overloads ---

// Overload 1: For UniformNode
// When 'tree' is a UniformNode, 'options' should be UniformNodeOptions.
export function reduce<
  TChildrenKey extends string = "children",
  TExtraProps extends object = {},
  TInputNode extends UniformNode<TChildrenKey, TExtraProps> = UniformNode<
    TChildrenKey,
    TExtraProps
  >
>(
  tree: TInputNode,
  options: UniformNodeOptions<TChildrenKey, TExtraProps, TInputNode>
): number

// Overload 2: For generic Node (this comes after more specific overloads)
// When 'tree' is a generic Node, 'options' should be GenericNodeOptions.
export function reduce<
  TChildrenKey extends string = "children",
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(tree: TInputNode, options: GenericNodeOptions<TChildrenKey>): number

// --- reduce Implementation ---

export function reduce<
  TChildrenKey extends string = "children",
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  tree: TInputNode,
  options:
    | GenericNodeOptions<TChildrenKey, TInputNode>
    | UniformNodeOptions<TChildrenKey, any, TInputNode>
): any {
  // Resolve defaults
  const childrenKey: TChildrenKey =
    options.childrenKey ?? ("children" as TChildrenKey)
  const reduceFn = options.reduceFn
  const initialVal = options.initialVal

  // Prepare options for the internal recursive helper.
  const helperOptions: HelperOptions<TChildrenKey, TInputNode> = {
    childrenKey,
    reduceFn,
    initialVal,
  }

  // Initial call to the recursive helper. TInputNode is the type of the root.
  return reduceHelper<TChildrenKey, TInputNode>(tree, null, 0, helperOptions)
}

// --- reduceHelper (Recursive Part) ---
// TCurrentNode is the type of the node being processed in *this specific recursive step*.
function reduceHelper<
  TChildrenKey extends string = "children",
  TCurrentNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  node: TCurrentNode,
  parent: TCurrentNode | null,
  depth: number,
  options: HelperOptions<TChildrenKey, TCurrentNode>
): any {
  const { reduceFn, initialVal, childrenKey } = options

  // Apply the reduceFn to this node
  let val = reduceFn(node, initialVal, parent, depth)

  // Get the children array.
  const childrenArray = node[childrenKey] as TCurrentNode[] | undefined

  if (!childrenArray || childrenArray.length === 0) {
    return val
  }

  // Recursion
  for (const child of childrenArray) {
    val = reduceHelper(child, node, depth + 1, {
      ...options,
      initialVal: val,
    })
  }

  return val
}
