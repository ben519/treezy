import { Node, UniformNode } from "./types.js"

// Options for when the input tree is a generic Node
interface GenericNodeOptions<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
> {
  childrenKey: TChildrenKey
  testFn: (
    node: TInputNode,
    parent: TInputNode | null,
    depth: number
  ) => boolean
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
  testFn: (
    node: TInputNode,
    parent: TInputNode | null,
    depth: number
  ) => boolean
}

// --- Helper Options for contains ---
interface ContainsHelperOptions<
  TChildrenKey extends string,
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
  TChildrenKey extends string,
  TExtraProps extends object = { [key: string]: unknown },
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
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(tree: TInputNode, options: GenericNodeOptions<TChildrenKey>): boolean

// --- contains Implementation ---
// This single implementation handles both overload cases.
// TInputNode captures the type of the 'tree' argument (e.g., MyUniformNodeType or SomeGenericNodeType).
export function contains<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  tree: TInputNode,
  options:
    | GenericNodeOptions<TChildrenKey, TInputNode>
    | UniformNodeOptions<TChildrenKey, any, TInputNode>
): boolean {
  // Resolve defaults
  const childrenKey = options.childrenKey
  const testFn = options.testFn

  // Make a Weak Set to keep track of nodes for circular reference
  const visitedNodesSet = new WeakSet()

  // Prepare options for the internal recursive helper.
  const helperOptions: ContainsHelperOptions<TChildrenKey, TInputNode> = {
    childrenKey,
    testFn,
  }

  // Initial call to the recursive helper. TInputNode is the type of the root.
  return containsHelper<TChildrenKey, TInputNode>(
    tree,
    null,
    0,
    visitedNodesSet,
    helperOptions
  )
}

// --- containsHelper (Recursive Part) ---
// TCurrentNode is the type of the node being processed in *this specific recursive step*.
function containsHelper<
  TChildrenKey extends string,
  TCurrentNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  node: TCurrentNode,
  parent: TCurrentNode | null,
  depth: number,
  visited: WeakSet<object>,
  options: ContainsHelperOptions<TChildrenKey, TCurrentNode>
): boolean {
  const { childrenKey, testFn } = options

  // Check if this node has already been visited
  if (visited.has(node)) throw new Error("Circular reference detected")
  visited.add(node)

  // If this node passes the test, return true early
  if (testFn(node, parent, depth)) {
    return true
  }

  // Recursively check the children
  const childrenArray = node[childrenKey] as TCurrentNode[] | undefined
  for (const childNode of childrenArray ?? []) {
    if (containsHelper(childNode, node, depth + 1, visited, options)) {
      return true
    }
  }

  visited.delete(node)
  return false
}
