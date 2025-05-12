import { Node, UniformNode } from "./types.js"

/**
 * Configuration options for applying transformations to generic tree nodes.
 * @template TChildrenKey - The property key used to access a node's children
 * @template TInputNode - The type of input nodes in the tree
 * @template TResult - The type of nodes after transformation
 */
interface GenericNodeOptions<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey>,
  TResult extends Node<TChildrenKey>
> {
  /**
   * Function to apply to nodes that match the test condition
   * @param node - The current node being processed
   * @param parent - The parent node (null for root node)
   * @param depth - Current depth in the tree (0 for root)
   * @returns The transformed node
   */
  applyFn: (
    node: TInputNode,
    parent: TInputNode | null,
    depth: number
  ) => TResult
  /**
   * Property key used to access a node's children
   */
  childrenKey: TChildrenKey
  /**
   * Whether to create a deep copy of the tree before applying transformations
   * @default false
   */
  copy?: boolean
  /**
   * Whether to stop after the first transformation.
   * @default false
   */
  firstOnly?: boolean
  /**
   * Function to test if a node should be transformed
   * @param node - The current node being tested
   * @param parent - The parent node (null for root node)
   * @param depth - Current depth in the tree (0 for root)
   * @returns Boolean indicating whether to apply the transformation
   * @default () => true (transforms all nodes)
   */
  testFn?: (
    node: TInputNode,
    parent: TInputNode | null,
    depth: number
  ) => boolean
}

/**
 * Configuration options for applying transformations to uniform tree nodes
 * (nodes with consistent property shapes).
 * @template TChildrenKey - The property key used to access a node's children
 * @template TProps - The shape of properties consistent across all nodes
 * @template TInputNode - The type of input nodes in the tree
 * @template TResult - The type of nodes after transformation
 */
interface UniformNodeOptions<
  TChildrenKey extends string,
  TProps extends object,
  TInputNode extends UniformNode<TChildrenKey, TProps>,
  TResult extends Node<TChildrenKey>
> {
  /**
   * Function to apply to nodes that match the test condition
   * @param node - The current node being processed
   * @param parent - The parent node (null for root node)
   * @param depth - Current depth in the tree (0 for root)
   * @returns The transformed node
   */
  applyFn: (
    node: TInputNode,
    parent: TInputNode | null,
    depth: number
  ) => TResult
  /**
   * Property key used to access a node's children
   */
  childrenKey: TChildrenKey
  /**
   * Whether to create a deep copy of the tree before applying transformations
   * @default false
   */
  copy?: boolean
  /**
   * Whether to stop after the first transformation.
   * @default false
   */
  firstOnly?: boolean
  /**
   * Function to test if a node should be transformed
   * @param node - The current node being tested
   * @param parent - The parent node (null for root node)
   * @param depth - Current depth in the tree (0 for root)
   * @returns Boolean indicating whether to apply the transformation
   * @default () => true (transforms all nodes)
   */
  testFn?: (
    node: TInputNode,
    parent: TInputNode | null,
    depth: number
  ) => boolean
}

/**
 * Internal options used by the helper function
 * @template TChildrenKey - The property key used to access a node's children
 * @template TCurrentNode - The type of the current node being processed
 * @template TResult - The type of nodes after transformation
 */
interface HelperOptions<
  TChildrenKey extends string,
  TCurrentNode extends Node<TChildrenKey>,
  TResult extends Node<TChildrenKey>
> {
  /**
   * Function to apply to nodes that match the test condition
   */
  applyFn: (
    node: TCurrentNode,
    parent: TCurrentNode | null,
    depth: number
  ) => TResult
  /**
   * Property key used to access a node's children
   */
  childrenKey: TChildrenKey
  /**
   * Whether to stop after the first transformation.
   * @default false
   */
  firstOnly: boolean
  /**
   * Function to test if a node should be transformed
   */
  testFn: (
    node: TCurrentNode,
    parent: TCurrentNode | null,
    depth: number
  ) => boolean
}

/**
 * Traverses a tree structure and applies transformations to nodes matching criteria.
 * This version applies to uniform nodes where testFn always returns true.
 *
 * @template TChildrenKey - The property key used to access a node's children
 * @template TProps - The shape of properties consistent across all nodes
 * @template TInputNode - The type of input nodes in the tree
 * @template TResult - The type of nodes after transformation
 *
 * @param tree - The root node of the tree to traverse
 * @param options - Configuration options for the traversal
 * @returns The transformed tree, with guaranteed type TResult
 */
export function apply<
  TChildrenKey extends string,
  TProps extends object,
  TInputNode extends UniformNode<TChildrenKey, TProps>,
  TResult extends Node<TChildrenKey>
>(
  tree: TInputNode,
  options: UniformNodeOptions<TChildrenKey, TProps, TInputNode, TResult> & {
    testFn: (node: TInputNode, parent: TInputNode | null, depth: number) => true
  }
): TResult

/**
 * Traverses a tree structure and applies transformations to nodes matching criteria.
 * This version applies to uniform nodes where testFn always returns false.
 *
 * @template TChildrenKey - The property key used to access a node's children
 * @template TProps - The shape of properties consistent across all nodes
 * @template TInputNode - The type of input nodes in the tree
 * @template TResult - The type of nodes after transformation
 *
 * @param tree - The root node of the tree to traverse
 * @param options - Configuration options for the traversal
 * @returns The original tree, unchanged with type TInputNode
 */
export function apply<
  TChildrenKey extends string,
  TProps extends object,
  TInputNode extends UniformNode<TChildrenKey, TProps>,
  TResult extends Node<TChildrenKey>
>(
  tree: TInputNode,
  options: UniformNodeOptions<TChildrenKey, TProps, TInputNode, TResult> & {
    testFn: (
      node: TInputNode,
      parent: TInputNode | null,
      depth: number
    ) => false
  }
): TInputNode

/**
 * Traverses a tree structure and applies transformations to nodes matching criteria.
 * This version applies to uniform nodes where testFn can return either true or false.
 *
 * @template TChildrenKey - The property key used to access a node's children
 * @template TProps - The shape of properties consistent across all nodes
 * @template TInputNode - The type of input nodes in the tree
 * @template TResult - The type of nodes after transformation
 *
 * @param tree - The root node of the tree to traverse
 * @param options - Configuration options for the traversal
 * @returns Either the original tree or the transformed tree, with type TInputNode | TResult
 */
export function apply<
  TChildrenKey extends string,
  TProps extends object,
  TInputNode extends UniformNode<TChildrenKey, TProps>,
  TResult extends Node<TChildrenKey>
>(
  tree: TInputNode,
  options: UniformNodeOptions<TChildrenKey, TProps, TInputNode, TResult>
): TInputNode | TResult

/**
 * Traverses a tree structure and applies transformations to nodes matching criteria.
 * This version applies to generic nodes where testFn always returns true.
 *
 * @template TChildrenKey - The property key used to access a node's children
 * @template TInputNode - The type of input nodes in the tree
 * @template TResult - The type of nodes after transformation
 *
 * @param tree - The root node of the tree to traverse
 * @param options - Configuration options for the traversal
 * @returns The transformed tree, with guaranteed type TResult
 */
export function apply<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey>,
  TResult extends Node<TChildrenKey>
>(
  tree: TInputNode,
  options: GenericNodeOptions<TChildrenKey, TInputNode, TResult> & {
    testFn: (node: TInputNode, parent: TInputNode | null, depth: number) => true
  }
): TResult

/**
 * Traverses a tree structure and applies transformations to nodes matching criteria.
 * This version applies to generic nodes where testFn always returns false.
 *
 * @template TChildrenKey - The property key used to access a node's children
 * @template TInputNode - The type of input nodes in the tree
 * @template TResult - The type of nodes after transformation
 *
 * @param tree - The root node of the tree to traverse
 * @param options - Configuration options for the traversal
 * @returns The original tree, unchanged with type TInputNode
 */
export function apply<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey>,
  TResult extends Node<TChildrenKey>
>(
  tree: TInputNode,
  options: GenericNodeOptions<TChildrenKey, TInputNode, TResult> & {
    testFn: (
      node: TInputNode,
      parent: TInputNode | null,
      depth: number
    ) => false
  }
): TInputNode

/**
 * Traverses a tree structure and applies transformations to nodes matching criteria.
 * This version applies to generic nodes where testFn can return either true or false.
 *
 * @template TChildrenKey - The property key used to access a node's children
 * @template TInputNode - The type of input nodes in the tree
 * @template TResult - The type of nodes after transformation
 *
 * @param tree - The root node of the tree to traverse
 * @param options - Configuration options for the traversal
 * @returns Either the original tree or the transformed tree, with type TInputNode | TResult
 */
export function apply<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey>,
  TResult extends Node<TChildrenKey>
>(
  tree: TInputNode,
  options: GenericNodeOptions<TChildrenKey, TInputNode, TResult>
): TInputNode | TResult

/**
 * Implementation of the apply function that handles all overloaded variants.
 * Traverses a tree structure and applies transformations to nodes matching criteria.
 *
 * @template TChildrenKey - The property key used to access a node's children
 * @template TInputNode - The type of input nodes in the tree
 * @template TResult - The type of nodes after transformation
 *
 * @param tree - The root node of the tree to traverse
 * @param options - Configuration options for the traversal
 * @returns The processed tree
 */
export function apply<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey>,
  TResult extends Node<TChildrenKey>
>(
  tree: TInputNode,
  options:
    | GenericNodeOptions<TChildrenKey, TInputNode, TResult>
    | UniformNodeOptions<TChildrenKey, any, TInputNode, TResult>
): any {
  // Resolve defaults
  const applyFn = options.applyFn
  const childrenKey = options.childrenKey
  const copy = options.copy ?? false
  const firstOnly = options.firstOnly ?? false
  const testFn = options.testFn ?? (() => true)

  // Make a Weak Set to keep track of nodes for circular reference
  const visitedNodesSet = new WeakSet()

  // Prepare options for the internal recursive helper.
  // The 'testFn' passed to the helper is the one provided by the user (or the default),
  // which has been correctly typed by the overload resolution based on 'tree'.
  // We assert its type to match what `applyHelper` expects for its `TCurrentNode`.
  const helperOptions: HelperOptions<TChildrenKey, TInputNode, TResult> = {
    applyFn,
    childrenKey,
    firstOnly,
    testFn,
  }

  // Initial call to the recursive helper. TInputNode is the type of the root.
  const result = applyHelper<TChildrenKey, TInputNode, TResult>(
    copy ? structuredClone(tree) : tree,
    null,
    0,
    visitedNodesSet,
    helperOptions
  )

  return result.nodeOut
}

/**
 * Internal recursive helper function for tree traversal.
 * This version handles nodes where testFn always returns true.
 *
 * @template TChildrenKey - The property key used to access a node's children
 * @template TCurrentNode - The type of the current node being processed
 * @template TResult - The type of nodes after transformation
 *
 * @param node - The current node being processed
 * @param parent - The parent node (null for the root)
 * @param depth - Current depth in the tree (0 for the root node)
 * @param visited - Set to track visited nodes and detect circular references
 * @param options - Helper options for traversal
 * @returns The transformed node
 */
export function applyHelper<
  TChildrenKey extends string,
  TCurrentNode extends Node<TChildrenKey>,
  TResult extends Node<TChildrenKey>
>(
  node: TCurrentNode,
  parent: TCurrentNode | null,
  depth: number,
  visited: WeakSet<object>,
  options: Omit<
    HelperOptions<TChildrenKey, TCurrentNode, TResult>,
    "testFn"
  > & {
    testFn: (
      node: TCurrentNode,
      parent: TCurrentNode | null,
      depth: number
    ) => true
  }
): { nodeOut: TResult; matchFound: boolean }

/**
 * Internal recursive helper function for tree traversal.
 * This version handles nodes where testFn always returns false.
 *
 * @template TChildrenKey - The property key used to access a node's children
 * @template TCurrentNode - The type of the current node being processed
 * @template TResult - The type of nodes after transformation
 *
 * @param node - The current node being processed
 * @param parent - The parent node (null for the root)
 * @param depth - Current depth in the tree (0 for the root node)
 * @param visited - Set to track visited nodes and detect circular references
 * @param options - Helper options for traversal
 * @returns An object with the original node unchanged and a boolean flag matchFound = false
 */
export function applyHelper<
  TChildrenKey extends string,
  TCurrentNode extends Node<TChildrenKey>,
  TResult extends Node<TChildrenKey>
>(
  node: TCurrentNode,
  parent: TCurrentNode | null,
  depth: number,
  visited: WeakSet<object>,
  options: Omit<
    HelperOptions<TChildrenKey, TCurrentNode, TResult>,
    "testFn"
  > & {
    testFn: (
      node: TCurrentNode,
      parent: TCurrentNode | null,
      depth: number
    ) => false
  }
): { nodeOut: TCurrentNode; matchFound: boolean }

/**
 * Internal recursive helper function for tree traversal.
 * This version handles nodes where testFn can return either true or false.
 *
 * @template TChildrenKey - The property key used to access a node's children
 * @template TCurrentNode - The type of the current node being processed
 * @template TResult - The type of nodes after transformation
 *
 * @param node - The current node being processed
 * @param parent - The parent node (null for the root)
 * @param depth - Current depth in the tree (0 for the root node)
 * @param visited - Set to track visited nodes and detect circular references
 * @param options - Helper options for traversal
 * @returns An object with the (possibly) tranformed node and a boolean flag matchFound
 */
export function applyHelper<
  TChildrenKey extends string,
  TCurrentNode extends Node<TChildrenKey>,
  TResult extends Node<TChildrenKey>
>(
  node: TCurrentNode,
  parent: TCurrentNode | null,
  depth: number,
  visited: WeakSet<object>,
  options: HelperOptions<TChildrenKey, TCurrentNode, TResult>
): { nodeOut: TResult | TCurrentNode; matchFound: boolean }

/**
 * Implementation of the applyHelper function that handles all overloaded variants.
 * Recursively traverses the tree and applies transformations to nodes matching the test condition.
 *
 * @template TChildrenKey - The property key used to access a node's children
 * @template TCurrentNode - The type of the current node being processed
 * @template TResult - The type of nodes after transformation
 *
 * @param node - The current node being processed
 * @param parent - The parent node (null for the root)
 * @param depth - Current depth in the tree (0 for the root node)
 * @param visited - Set to track visited nodes and detect circular references
 * @param options - Helper options for traversal
 * @returns An object with the (possibly) tranformed node and a boolean flag matchFound
 * @throws Error if a circular reference is detected
 */
export function applyHelper<
  TChildrenKey extends string,
  TCurrentNode extends Node<TChildrenKey>,
  TResult extends Node<TChildrenKey>
>(
  node: TCurrentNode,
  parent: TCurrentNode | null,
  depth: number,
  visited: WeakSet<object>,
  options: HelperOptions<TChildrenKey, TCurrentNode, TResult>
): { nodeOut: TResult | TCurrentNode; matchFound: boolean } {
  const { applyFn, childrenKey, firstOnly, testFn } = options

  // Check if this node has already been visited
  if (visited.has(node)) throw new Error("Circular reference detected")
  visited.add(node)

  // If this node passes testFn, run applyFn on it
  if (testFn(node, parent, depth)) {
    const nodeOut = applyFn(node, parent, depth)
    if (firstOnly) {
      return { nodeOut, matchFound: true }
    }
  }

  // Get the children array
  const childrenArray = node[childrenKey] as TCurrentNode[] | undefined

  // Recursively modify this node's children
  for (const child of childrenArray ?? []) {
    const result = applyHelper(child, node, depth + 1, visited, options)
    if (firstOnly && result.matchFound) {
      return { nodeOut: node, matchFound: true }
    }
  }

  // Return the (possibly modified) input node
  visited.delete(node)
  return { nodeOut: node, matchFound: false }
}
