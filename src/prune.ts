import { Node, UniformNode } from "./types.js"

// Options for when the input tree is a generic Node
interface GenericNodeOptions<
  TChildrenKey extends string = "children",
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
> {
  testFn: (
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
  testFn: (
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
  childrenKey: TChildrenKey
  testFn: (
    node: TCurrentNode,
    parent: TCurrentNode | null,
    depth: number
  ) => boolean
}

// --- prune Function Overloads ---

// Overload 1: For UniformNode
// When 'tree' is a UniformNode, 'options' should be UniformNodeOptions.
export function prune<
  TChildrenKey extends string = "children",
  TExtraProps extends object = {},
  TInputNode extends UniformNode<TChildrenKey, TExtraProps> = UniformNode<
    TChildrenKey,
    TExtraProps
  >
>(
  tree: TInputNode,
  options: UniformNodeOptions<TChildrenKey, TExtraProps, TInputNode>
): TInputNode | null

// Overload 2: For generic Node (this comes after more specific overloads)
// When 'tree' is a generic Node, 'options' should be GenericNodeOptions.
export function prune<
  TChildrenKey extends string = "children",
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  tree: TInputNode,
  options: GenericNodeOptions<TChildrenKey>
): TInputNode | null

// --- prune Implementation ---
// This single implementation handles both overload cases.
// TInputNode captures the type of the 'tree' argument (e.g., MyUniformNodeType or SomeGenericNodeType).
export function prune<
  TChildrenKey extends string = "children",
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  tree: TInputNode,
  options:
    | GenericNodeOptions<TChildrenKey, TInputNode>
    | UniformNodeOptions<TChildrenKey, any, TInputNode>
): TInputNode | null {
  // Resolve defaults
  const childrenKey: TChildrenKey =
    options.childrenKey ?? ("children" as TChildrenKey)
  const testFn = options.testFn
  const copy = options.copy ?? false

  // Prepare options for the internal recursive helper.
  // The 'testFn' passed to the helper is the one provided by the user (or the default),
  // which has been correctly typed by the overload resolution based on 'tree'.
  // We assert its type to match what `pruneHelper` expects for its `TCurrentNode`.
  const helperOptions: HelperOptions<TChildrenKey, TInputNode> = {
    childrenKey,
    testFn,
  }

  // Initial call to the recursive helper. TInputNode is the type of the root.
  return pruneHelper<TChildrenKey, TInputNode>(
    copy ? structuredClone(tree) : tree,
    null,
    0,
    helperOptions
  )
}

// --- pruneHelper (Recursive Part) ---
// TCurrentNode is the type of the node being processed in *this specific recursive step*.

function pruneHelper<
  TChildrenKey extends string = "children",
  TCurrentNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  node: TCurrentNode,
  parent: TCurrentNode | null,
  depth: number,
  options: HelperOptions<TChildrenKey, TCurrentNode>
): TCurrentNode | null {
  const { testFn, childrenKey } = options

  // Check if this node passes testFn
  if (testFn(node, parent, depth)) {
    return null
  }

  // Get the children array
  const childrenArray = node[childrenKey] as TCurrentNode[] | undefined

  // If this is a leaf node...
  if (!childrenArray || childrenArray.length === 0) {
    return node
  }

  // Prune each child of this node
  for (let i = childrenArray.length - 1; i >= 0; i--) {
    const child = childrenArray[i]
    const newChild = pruneHelper(child, node, depth + 1, options)
    if (newChild === null) childrenArray.splice(i, 1)
  }

  return node
}
