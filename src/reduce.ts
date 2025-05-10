import { Node, UniformNode } from "./types.js"

// Options for when the input tree is a generic Node
interface GenericNodeOptions<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
> {
  childrenKey: TChildrenKey
  initialVal: any
  reduceFn: (
    node: TInputNode,
    initialVal: any,
    parent: TInputNode | null,
    depth: number
  ) => any
}

// Options specifically for when the input tree is a UniformNode
interface UniformNodeOptions<
  TChildrenKey extends string,
  TExtraProps extends object = { [key: string]: unknown },
  TInputNode extends UniformNode<TChildrenKey, TExtraProps> = UniformNode<
    TChildrenKey,
    TExtraProps
  >
> {
  childrenKey: TChildrenKey
  initialVal: any
  reduceFn: (
    node: TInputNode,
    initialVal: any,
    parent: TInputNode | null,
    depth: number
  ) => any
}

// --- Helper Options ---
// This interface defines the shape of options the recursive helper will use.
// TCurrentNode represents the type of the node currently being processed by the helper.
interface HelperOptions<
  TChildrenKey extends string,
  TCurrentNode extends Node<TChildrenKey> = Node<TChildrenKey>
> {
  childrenKey: TChildrenKey
  initialVal: any
  reduceFn: (
    node: TCurrentNode,
    initialVal: any,
    parent: TCurrentNode | null,
    depth: number
  ) => any
}

// --- reduce Function Overloads ---

// Overload 1: For UniformNode
// When 'tree' is a UniformNode, 'options' should be UniformNodeOptions.
export function reduce<
  TChildrenKey extends string,
  TExtraProps extends object = { [key: string]: unknown },
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
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(tree: TInputNode, options: GenericNodeOptions<TChildrenKey>): number

// --- reduce Implementation ---

export function reduce<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  tree: TInputNode,
  options:
    | GenericNodeOptions<TChildrenKey, TInputNode>
    | UniformNodeOptions<TChildrenKey, any, TInputNode>
): any {
  // Resolve defaults
  const childrenKey = options.childrenKey
  const initialVal = options.initialVal
  const reduceFn = options.reduceFn

  // Make a Weak Set to keep track of nodes for circular reference
  const visitedNodesSet = new WeakSet()

  // Prepare options for the internal recursive helper.
  const helperOptions: HelperOptions<TChildrenKey, TInputNode> = {
    childrenKey,
    initialVal,
    reduceFn,
  }

  // Initial call to the recursive helper. TInputNode is the type of the root.
  return reduceHelper<TChildrenKey, TInputNode>(
    tree,
    null,
    0,
    visitedNodesSet,
    helperOptions
  )
}

// --- reduceHelper (Recursive Part) ---
// TCurrentNode is the type of the node being processed in *this specific recursive step*.
function reduceHelper<
  TChildrenKey extends string,
  TCurrentNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  node: TCurrentNode,
  parent: TCurrentNode | null,
  depth: number,
  visited: WeakSet<object>,
  options: HelperOptions<TChildrenKey, TCurrentNode>
): any {
  const { reduceFn, initialVal, childrenKey } = options

  // Check if this node has already been visited
  if (visited.has(node)) throw new Error("Circular reference detected")
  visited.add(node)

  // Apply the reduceFn to this node
  let val = reduceFn(node, initialVal, parent, depth)

  // Get the children array.
  const childrenArray = node[childrenKey] as TCurrentNode[] | undefined

  // Recursion
  for (const child of childrenArray ?? []) {
    val = reduceHelper(child, node, depth + 1, visited, {
      ...options,
      initialVal: val,
    })
  }

  visited.delete(node)
  return val
}
