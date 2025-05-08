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
  childrenKey?: TChildrenKey
}

// --- Helper Options for contains ---
interface ContainsHelperOptions<
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

// --- contains Function Overloads ---

// Overload 1: For UniformNode
// When 'tree' is a UniformNode, 'options' should be UniformNodeOptions.
export function contains<
  TChildrenKey extends string = "children",
  TExtraProps extends object = {},
  TInputNode extends UniformNode<TChildrenKey, TExtraProps> = UniformNode<
    TChildrenKey,
    TExtraProps
  >
>(
  tree: TInputNode,
  options: UniformNodeOptions<TChildrenKey, TExtraProps, TInputNode>
): boolean

// Overload 2: For generic Node
// When 'tree' is a generic Node, 'options' should be GenericNodeOptions.
export function contains<
  TChildrenKey extends string = "children",
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(tree: TInputNode, options: GenericNodeOptions<TChildrenKey>): boolean

// --- contains Implementation ---
// This single implementation handles both overload cases.
// TInputNode captures the type of the 'tree' argument (e.g., MyUniformNodeType or SomeGenericNodeType).
export function contains<
  TChildrenKey extends string = "children",
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  tree: TInputNode,
  options:
    | GenericNodeOptions<TChildrenKey, TInputNode>
    | UniformNodeOptions<TChildrenKey, any, TInputNode>
): boolean {
  // Resolve defaults
  const childrenKey: TChildrenKey =
    options.childrenKey ?? ("children" as TChildrenKey)
  const testFn = options.testFn

  // Prepare options for the internal recursive helper.
  const helperOptions: ContainsHelperOptions<TChildrenKey, TInputNode> = {
    childrenKey,
    testFn,
  }

  // Initial call to the recursive helper. TInputNode is the type of the root.
  return containsHelper<TChildrenKey, TInputNode>(tree, null, 0, helperOptions)
}

// --- containsHelper (Recursive Part) ---
function containsHelper<
  TChildrenKey extends string = "children",
  TCurrentNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  node: TCurrentNode,
  parent: TCurrentNode | null,
  depth: number,
  options: ContainsHelperOptions<TChildrenKey, TCurrentNode>
): boolean {
  const { childrenKey, testFn } = options

  if (testFn(node, parent, depth)) {
    return true
  }

  const childrenArray = node[childrenKey] as TCurrentNode[] | undefined

  if (!childrenArray || childrenArray.length === 0) {
    return false
  }

  for (const childNode of childrenArray) {
    if (containsHelper(childNode, node, depth + 1, options)) {
      return true
    }
  }

  return false
}
