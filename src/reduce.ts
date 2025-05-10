import { Node, UniformNode } from "./types.js"

/**
 * Options for reducing a generic tree structure using a custom reducer function.
 *
 * @template TChildrenKey - The string key used to access child nodes.
 * @template TInputNode - The type of the input node, extending Node.
 */
interface GenericNodeOptions<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
> {
  /** The key to access children in the node. */
  childrenKey: TChildrenKey
  /** The initial value passed to the reducer function. */
  initialVal: any
  /**
   * The reducer function called on each node.
   *
   * @param node - The current node.
   * @param initialVal - The current accumulated value.
   * @param parent - The parent node, or null if this is the root.
   * @param depth - The depth of the current node in the tree.
   * @returns The updated accumulated value.
   */
  reduceFn: (
    node: TInputNode,
    initialVal: any,
    parent: TInputNode | null,
    depth: number
  ) => any
}

/**
 * Options for reducing a uniform tree structure using a custom reducer function.
 *
 * @template TChildrenKey - The string key used to access child nodes.
 * @template TProps - The type of the properties each node has.
 * @template TInputNode - The type of the input node, extending UniformNode.
 */
interface UniformNodeOptions<
  TChildrenKey extends string,
  TProps extends object = { [key: string]: unknown },
  TInputNode extends UniformNode<TChildrenKey, TProps> = UniformNode<
    TChildrenKey,
    TProps
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

/**
 * Internal helper options passed to recursive reducer logic.
 *
 * @template TChildrenKey - The string key used to access child nodes.
 * @template TCurrentNode - The type of the current node.
 */
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

/**
 * Reduces a tree to a single value using a depth-first traversal and a custom reducer function.
 *
 * Overload for a uniform node structure.
 *
 * @template TChildrenKey - The string key used to access child nodes.
 * @template TProps - The type of the properties each node has.
 * @template TInputNode - The node type.
 * @param tree - The root node of the tree.
 * @param options - The reduction configuration.
 * @returns The final reduced value.
 */
export function reduce<
  TChildrenKey extends string,
  TProps extends object = { [key: string]: unknown },
  TInputNode extends UniformNode<TChildrenKey, TProps> = UniformNode<
    TChildrenKey,
    TProps
  >
>(
  tree: TInputNode,
  options: UniformNodeOptions<TChildrenKey, TProps, TInputNode>
): number

/**
 * Reduces a tree to a single value using a depth-first traversal and a custom reducer function.
 *
 * Overload for a generic node structure.
 *
 * @template TChildrenKey - The string key used to access child nodes.
 * @template TInputNode - The node type.
 * @param tree - The root node of the tree.
 * @param options - The reduction configuration.
 * @returns The final reduced value.
 */
export function reduce<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(tree: TInputNode, options: GenericNodeOptions<TChildrenKey>): number

/**
 * Reduces a tree to a single value using a depth-first traversal and a custom reducer function.
 *
 * This is the implementation of the `reduce` function. It dispatches to the internal recursive `reduceHelper`.
 *
 * @template TChildrenKey - The key used to access children nodes.
 * @template TInputNode - The node type.
 * @param tree - The root node of the tree.
 * @param options - Reduction configuration (either generic or uniform).
 * @returns The result of the reduction.
 */
export function reduce<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  tree: TInputNode,
  options:
    | GenericNodeOptions<TChildrenKey, TInputNode>
    | UniformNodeOptions<TChildrenKey, any, TInputNode>
): any {
  const childrenKey = options.childrenKey
  const initialVal = options.initialVal
  const reduceFn = options.reduceFn

  const visitedNodesSet = new WeakSet()

  const helperOptions: HelperOptions<TChildrenKey, TInputNode> = {
    childrenKey,
    initialVal,
    reduceFn,
  }

  return reduceHelper<TChildrenKey, TInputNode>(
    tree,
    null,
    0,
    visitedNodesSet,
    helperOptions
  )
}

/**
 * Internal recursive helper that performs a depth-first reduction of the tree.
 *
 * @template TChildrenKey - The key used to access children nodes.
 * @template TCurrentNode - The node type.
 * @param node - The current node.
 * @param parent - The parent node, or null if this is the root.
 * @param depth - The current depth in the tree.
 * @param visited - A WeakSet used to detect circular references.
 * @param options - The helper options.
 * @returns The result of reducing the subtree rooted at the given node.
 * @throws {Error} If a circular reference is detected.
 */
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

  if (visited.has(node)) throw new Error("Circular reference detected")
  visited.add(node)

  let val = reduceFn(node, initialVal, parent, depth)

  const childrenArray = node[childrenKey] as TCurrentNode[] | undefined

  for (const child of childrenArray ?? []) {
    val = reduceHelper(child, node, depth + 1, visited, {
      ...options,
      initialVal: val,
    })
  }

  visited.delete(node)
  return val
}
