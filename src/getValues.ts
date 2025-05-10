import { Node, UniformNode } from "./types.js"

/**
 * Options for extracting values from a generic node tree.
 *
 * @template TChildrenKey - The key used to access children nodes.
 * @template TInputNode - The node type which conforms to the `Node` interface.
 * @template TResult - The type returned by the `getFn` function.
 */
interface GenericNodeOptions<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey>,
  TResult
> {
  /** The key used to access child nodes. */
  childrenKey: TChildrenKey

  /** Whether to deep clone the input tree before processing. Defaults to `false`. */
  copy?: boolean

  /**
   * A function that extracts or transforms data from a node.
   * Defaults to returning the node itself.
   */
  getFn?: (
    node: TInputNode,
    parent: TInputNode | null,
    depth: number
  ) => TResult

  /**
   * A function that determines whether a node should be included in the output.
   * Defaults to always returning `true`.
   */
  testFn?: (
    node: TInputNode,
    parent: TInputNode | null,
    depth: number
  ) => boolean
}

/**
 * Options for extracting values from a uniform node tree.
 *
 * @template TChildrenKey - The key used to access children nodes.
 * @template TProps - Additional props on the node.
 * @template TInputNode - The node type which conforms to the `UniformNode` interface.
 * @template TResult - The type returned by the `getFn` function.
 */
interface UniformNodeOptions<
  TChildrenKey extends string,
  TProps extends object,
  TInputNode extends UniformNode<TChildrenKey, TProps>,
  TResult
> {
  /** The key used to access child nodes. */
  childrenKey: TChildrenKey

  /** Whether to deep clone the input tree before processing. Defaults to `false`. */
  copy?: boolean

  /**
   * A function that extracts or transforms data from a node.
   * Defaults to returning the node itself.
   */
  getFn?: (
    node: TInputNode,
    parent: TInputNode | null,
    depth: number
  ) => TResult

  /**
   * A function that determines whether a node should be included in the output.
   * Defaults to always returning `true`.
   */
  testFn?: (
    node: TInputNode,
    parent: TInputNode | null,
    depth: number
  ) => boolean
}

/**
 * Internal options used by the recursive helper.
 *
 * @template TChildrenKey - The key used to access children nodes.
 * @template TCurrentNode - The current node type.
 * @template TResult - The result type to return from each node.
 */
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

/**
 * Traverses a uniform or generic tree and extracts values from nodes that pass a test.
 *
 * @template TChildrenKey - The key used to access children nodes.
 * @template TProps - Additional props (for uniform nodes).
 * @template TInputNode - The node type (either generic or uniform).
 * @template TResult - The result type returned for each included node.
 *
 * @param tree - The root of the node tree.
 * @param options - Options for customizing traversal and data extraction.
 * @returns An array of values returned by `getFn` for each node that passes `testFn`.
 */
export function getValues<
  TChildrenKey extends string,
  TProps extends object,
  TInputNode extends UniformNode<TChildrenKey, TProps>,
  TResult = TInputNode
>(
  tree: TInputNode,
  options: UniformNodeOptions<TChildrenKey, TProps, TInputNode, TResult>
): TResult[]

export function getValues<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey>,
  TResult = TInputNode
>(
  tree: TInputNode,
  options: GenericNodeOptions<TChildrenKey, TInputNode, TResult>
): TResult[]

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
  const childrenKey = options.childrenKey
  const copy = options?.copy ?? false
  const getFn = options?.getFn ?? ((node) => node as unknown as TResult)
  const testFn = options?.testFn ?? (() => true)

  const visitedNodesSet = new WeakSet()

  const helperOptions: HelperOptions<TChildrenKey, TInputNode, TResult> = {
    childrenKey,
    testFn,
    getFn,
  }

  return getValuesHelper<TChildrenKey, TInputNode, TResult>(
    copy ? structuredClone(tree) : tree,
    null,
    0,
    visitedNodesSet,
    helperOptions
  )
}

/**
 * Recursive helper for `getValues` that accumulates results from nodes passing the test.
 *
 * @template TChildrenKey - The key used to access children nodes.
 * @template TCurrentNode - The current node type.
 * @template TResult - The result type.
 *
 * @param node - The current node being visited.
 * @param parent - The parent of the current node.
 * @param depth - The current depth in the tree.
 * @param visited - A WeakSet used to detect and prevent circular references.
 * @param options - Helper options for child traversal.
 * @returns An array of extracted values from this node and its descendants.
 */
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

  if (visited.has(node)) throw new Error("Circular reference detected")
  visited.add(node)

  const results: TResult[] = []

  if (testFn(node, parent, depth)) {
    results.push(getFn(node, parent, depth))
  }

  const childrenArray = node[childrenKey] as TCurrentNode[] | undefined

  for (const child of childrenArray ?? []) {
    results.push(...getValuesHelper(child, node, depth + 1, visited, options))
  }

  visited.delete(node)
  return results
}
