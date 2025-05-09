import { Node, UniformNode } from "./types.js"

// Options for when the input tree is a generic Node
interface GenericNodeOptions<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey>,
  TResult extends Node<TChildrenKey>
> {
  applyFn: (
    node: TInputNode,
    parent: TInputNode | null,
    depth: number
  ) => TResult
  childrenKey: TChildrenKey
  copy?: boolean
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
  TResult extends Node<TChildrenKey>
> {
  applyFn: (
    node: TInputNode,
    parent: TInputNode | null,
    depth: number
  ) => TResult
  childrenKey: TChildrenKey
  copy?: boolean
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
  TResult extends Node<TChildrenKey>
> {
  applyFn: (
    node: TCurrentNode,
    parent: TCurrentNode | null,
    depth: number
  ) => TResult
  childrenKey: TChildrenKey
  testFn: (
    node: TCurrentNode,
    parent: TCurrentNode | null,
    depth: number
  ) => boolean
}

// --- apply Function Overloads ---

// Overload 1:
// tree is a UniformNode
// testFn returns literal true ⇒ always TResult
export function apply<
  TChildrenKey extends string,
  TExtraProps extends object,
  TInputNode extends UniformNode<TChildrenKey, TExtraProps>,
  TResult extends Node<TChildrenKey>
>(
  tree: TInputNode,
  options: UniformNodeOptions<
    TChildrenKey,
    TExtraProps,
    TInputNode,
    TResult
  > & {
    testFn: (node: TInputNode, parent: TInputNode | null, depth: number) => true
  }
): TResult

// Overload 2:
// tree is a UniformNode
// testFn returns literal false ⇒ always TInputNode
export function apply<
  TChildrenKey extends string,
  TExtraProps extends object,
  TInputNode extends UniformNode<TChildrenKey, TExtraProps>,
  TResult extends Node<TChildrenKey>
>(
  tree: TInputNode,
  options: UniformNodeOptions<
    TChildrenKey,
    TExtraProps,
    TInputNode,
    TResult
  > & {
    testFn: (
      node: TInputNode,
      parent: TInputNode | null,
      depth: number
    ) => false
  }
): TInputNode

// Overload 3:
// tree is a UniformNode
// testFn returns true or false ⇒ TInputNode | TResult
export function apply<
  TChildrenKey extends string,
  TExtraProps extends object,
  TInputNode extends UniformNode<TChildrenKey, TExtraProps>,
  TResult extends Node<TChildrenKey>
>(
  tree: TInputNode,
  options: UniformNodeOptions<TChildrenKey, TExtraProps, TInputNode, TResult>
): TInputNode | TResult

// Overload 4:
// tree is a GenericNode
// testFn returns literal true ⇒ TResult
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

// Overload 5:
// tree is a GenericNode
// testFn returns literal false ⇒ always TInputNode
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

// Overload 6:
// tree is a GenericNode
// testFn returns true or false ⇒ TInputNode | TResult
export function apply<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey>,
  TResult extends Node<TChildrenKey>
>(
  tree: TInputNode,
  options: GenericNodeOptions<TChildrenKey, TInputNode, TResult>
): TInputNode | TResult

// --- apply Implementation ---
// This single implementation handles both overload cases.
// TInputNode captures the type of the 'tree' argument (e.g., MyUniformNodeType or SomeGenericNodeType).
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
  const testFn = options.testFn ?? (() => true)

  // Prepare options for the internal recursive helper.
  // The 'testFn' passed to the helper is the one provided by the user (or the default),
  // which has been correctly typed by the overload resolution based on 'tree'.
  // We assert its type to match what `applyHelper` expects for its `TCurrentNode`.
  const helperOptions: HelperOptions<TChildrenKey, TInputNode, TResult> = {
    applyFn,
    childrenKey,
    testFn,
  }

  // Initial call to the recursive helper. TInputNode is the type of the root.
  return applyHelper<TChildrenKey, TInputNode, TResult>(
    copy ? structuredClone(tree) : tree,
    null,
    0,
    helperOptions
  )
}

// --- applyHelper (Recursive Part) ---

// --- overload 1: testFn returns literal true ⇒ always TResult
export function applyHelper<
  TChildrenKey extends string,
  TCurrentNode extends Node<TChildrenKey>,
  TResult extends Node<TChildrenKey>
>(
  node: TCurrentNode,
  parent: TCurrentNode | null,
  depth: number,
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
): TResult

// --- overload 2: testFn returns literal false ⇒ always TCurrentNode
export function applyHelper<
  TChildrenKey extends string,
  TCurrentNode extends Node<TChildrenKey>,
  TResult extends Node<TChildrenKey>
>(
  node: TCurrentNode,
  parent: TCurrentNode | null,
  depth: number,
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
): TCurrentNode

// --- overload 3: all other cases ⇒ union
export function applyHelper<
  TChildrenKey extends string,
  TCurrentNode extends Node<TChildrenKey>,
  TResult extends Node<TChildrenKey>
>(
  node: TCurrentNode,
  parent: TCurrentNode | null,
  depth: number,
  options: HelperOptions<TChildrenKey, TCurrentNode, TResult>
): TResult | TCurrentNode

// --- single implementation for all three overloads
export function applyHelper<
  TChildrenKey extends string,
  TCurrentNode extends Node<TChildrenKey>,
  TResult extends Node<TChildrenKey>
>(
  node: TCurrentNode,
  parent: TCurrentNode | null,
  depth: number,
  options: HelperOptions<TChildrenKey, TCurrentNode, TResult>
): any {
  const { applyFn, testFn, childrenKey } = options

  if (testFn(node, parent, depth)) {
    applyFn(node, parent, depth)
  }

  const childrenArray = node[childrenKey] as TCurrentNode[] | undefined
  if (!childrenArray || childrenArray.length === 0) {
    return node
  }

  for (const child of childrenArray) {
    applyHelper(child, node, depth + 1, options)
  }

  return node
}
