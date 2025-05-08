import { Node, UniformNode } from "./types.js"

// Options for when the input tree is a generic Node
interface GenericNodeOptions<
  TChildrenKey extends string = "children",
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
> {
  applyFn: (node: TInputNode, parent: TInputNode | null, depth: number) => any
  testFn?: (
    node: TInputNode,
    parent: TInputNode | null,
    depth: number
  ) => boolean
  copy?: boolean
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
  applyFn: (node: TInputNode, parent: TInputNode | null, depth: number) => any
  testFn?: (
    node: TInputNode,
    parent: TInputNode | null,
    depth: number
  ) => boolean
  copy?: boolean
  childrenKey?: TChildrenKey
}

// --- Helper Options ---
// This interface defines the shape of options the recursive helper will use.
// TCurrentNode represents the type of the node currently being processed by the helper.
interface HelperOptions<
  TChildrenKey extends string = "children",
  TCurrentNode extends Node<TChildrenKey> = Node<TChildrenKey>
> {
  applyFn: (
    node: TCurrentNode,
    parent: TCurrentNode | null,
    depth: number
  ) => any
  childrenKey: TChildrenKey
  testFn: (
    node: TCurrentNode,
    parent: TCurrentNode | null,
    depth: number
  ) => boolean
}

// --- apply Function Overloads ---

// Overload 1: For UniformNode
// When 'tree' is a UniformNode, 'options' should be UniformNodeOptions.
export function apply<
  TChildrenKey extends string = "children",
  TExtraProps extends object = {},
  TInputNode extends UniformNode<TChildrenKey, TExtraProps> = UniformNode<
    TChildrenKey,
    TExtraProps
  >
>(
  tree: TInputNode,
  options: UniformNodeOptions<TChildrenKey, TExtraProps, TInputNode>
): TInputNode

// Overload 2: For generic Node (this comes after more specific overloads)
// When 'tree' is a generic Node, 'options' should be GenericNodeOptions.
export function apply<
  TChildrenKey extends string = "children",
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(tree: TInputNode, options: GenericNodeOptions<TChildrenKey>): TInputNode

// --- apply Implementation ---
// This single implementation handles both overload cases.
// TInputNode captures the type of the 'tree' argument (e.g., MyUniformNodeType or SomeGenericNodeType).
export function apply<
  TChildrenKey extends string = "children",
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  tree: TInputNode,
  options:
    | GenericNodeOptions<TChildrenKey, TInputNode>
    | UniformNodeOptions<TChildrenKey, any, TInputNode>
): TInputNode {
  // Resolve defaults
  const childrenKey: TChildrenKey =
    options.childrenKey ?? ("children" as TChildrenKey)
  const applyFn = options.applyFn
  const testFn = options.testFn ?? (() => true)
  const copy = options.copy ?? false

  // Prepare options for the internal recursive helper.
  // The 'testFn' passed to the helper is the one provided by the user (or the default),
  // which has been correctly typed by the overload resolution based on 'tree'.
  // We assert its type to match what `applyHelper` expects for its `TCurrentNode`.
  const helperOptions: HelperOptions<TChildrenKey, TInputNode> = {
    childrenKey,
    applyFn,
    testFn,
  }

  // Initial call to the recursive helper. TInputNode is the type of the root.
  return applyHelper<TChildrenKey, TInputNode>(
    copy ? structuredClone(tree) : tree,
    null,
    0,
    helperOptions
  )
}

function applyHelper<
  TChildrenKey extends string = "children",
  TCurrentNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  node: TCurrentNode,
  parent: TCurrentNode | null,
  depth: number,
  options: HelperOptions<TChildrenKey, TCurrentNode>
): TCurrentNode {
  const { applyFn, testFn, childrenKey } = options

  // If the current node passes the test function
  // apply the modifier function
  if (testFn(node, parent, depth)) {
    applyFn(node, parent, depth)
  }

  // Get the children array.
  const childrenArray = node[childrenKey] as TCurrentNode[] | undefined

  // If this is a leaf node...
  if (!childrenArray || childrenArray.length === 0) {
    return node
  }

  // Iterate over each child of the current node
  for (const child of childrenArray) {
    applyHelper(child, node, depth + 1, options)
  }

  return node
}
