import { Node, UniformNode } from "./types.js"

// Options for when the input tree is a generic Node
interface GenericNodeOptions<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey>,
  TResult
> {
  childrenKey: TChildrenKey
  copy?: boolean
  getFn?: (
    node: TInputNode,
    parent: TInputNode | null,
    depth: number
  ) => TResult
  testFn?: (
    node: TInputNode,
    parent: TInputNode | null,
    depth: number
  ) => boolean
}

// Options specifically for when the input tree is a UniformNode
interface UniformNodeOptions<
  TChildrenKey extends string,
  TExtraProps extends object,
  TInputNode extends UniformNode<TChildrenKey, TExtraProps>,
  TResult
> {
  childrenKey: TChildrenKey
  copy?: boolean
  getFn?: (
    node: TInputNode,
    parent: TInputNode | null,
    depth: number
  ) => TResult
  testFn?: (
    node: TInputNode,
    parent: TInputNode | null,
    depth: number
  ) => boolean
}

// --- Helper Options ---
// This interface defines the shape of options the recursive helper will use.
// TCurrentNode represents the type of the node currently being processed by the helper.
interface HelperOptions<
  TChildrenKey extends string,
  TCurrentNode extends Node<TChildrenKey>,
  TResult
> {
  childrenKey: TChildrenKey
  getFn: (
    node: TCurrentNode,
    parent: TCurrentNode | null,
    depth: number
  ) => TResult
  testFn: (
    node: TCurrentNode,
    parent: TCurrentNode | null,
    depth: number
  ) => boolean
}

// --- getValues Function Overloads ---

// Overload 1: For UniformNode
// When 'tree' is a UniformNode, 'options' should be UniformNodeOptions.
export function getValues<
  TChildrenKey extends string,
  TExtraProps extends object,
  TInputNode extends UniformNode<TChildrenKey, TExtraProps>,
  TResult = TInputNode
>(
  tree: TInputNode,
  options: UniformNodeOptions<TChildrenKey, TExtraProps, TInputNode, TResult>
): TResult[]

// Overload 2: For generic Node (this comes after more specific overloads)
// When 'tree' is a generic Node, 'options' should be GenericNodeOptions.
export function getValues<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey>,
  TResult = TInputNode
>(
  tree: TInputNode,
  options: GenericNodeOptions<TChildrenKey, TInputNode, TResult>
): TResult[]

// --- getValues Implementation ---
// This single implementation handles both overload cases.
// TInputNode captures the type of the 'tree' argument (e.g., MyUniformNodeType or SomeGenericNodeType).
export function getValues<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey>,
  TResult = TInputNode
>(
  tree: TInputNode,
  options:
    | GenericNodeOptions<TChildrenKey, TInputNode, TResult>
    | UniformNodeOptions<TChildrenKey, any, TInputNode, TResult>
): TResult[] {
  // Resolve defaults
  const childrenKey = options.childrenKey
  const copy = options?.copy ?? false
  const getFn = options?.getFn ?? ((node) => node as unknown as TResult)
  const testFn = options?.testFn ?? (() => true)

  // Make a Weak Set to keep track of nodes for circular reference
  const visitedNodesSet = new WeakSet()

  // Prepare options for the internal recursive helper.
  const helperOptions: HelperOptions<TChildrenKey, TInputNode, TResult> = {
    childrenKey,
    testFn,
    getFn,
  }

  // Initial call to the recursive helper. TInputNode is the type of the root.
  return getValuesHelper<TChildrenKey, TInputNode, TResult>(
    copy ? structuredClone(tree) : tree,
    null,
    0,
    visitedNodesSet,
    helperOptions
  )
}

// --- getValuesHelper (Recursive Part) ---
// TCurrentNode is the type of the node being processed in *this specific recursive step*.
function getValuesHelper<
  TChildrenKey extends string,
  TCurrentNode extends Node<TChildrenKey>,
  TResult
>(
  node: TCurrentNode,
  parent: TCurrentNode | null,
  depth: number,
  visited: WeakSet<object>,
  options: HelperOptions<TChildrenKey, TCurrentNode, TResult>
): TResult[] {
  const { getFn, testFn, childrenKey } = options

  // Check if this node has already been visited
  if (visited.has(node)) throw new Error("Circular reference detected")
  visited.add(node)

  // Array to store results
  const results: TResult[] = []

  // Apply testFn to current node
  if (testFn(node, parent, depth)) {
    results.push(getFn(node, parent, depth))
  }

  // Get the children array.
  const childrenArray = node[childrenKey] as TCurrentNode[] | undefined

  // If this is a leaf node...
  if (!childrenArray || childrenArray.length === 0) {
    return results
  }

  // Recurse into children if they exist
  for (const child of childrenArray) {
    results.push(...getValuesHelper(child, node, depth + 1, visited, options))
  }

  return results
}
