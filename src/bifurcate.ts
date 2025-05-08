import { Node, UniformNode } from "./types.js"

// Options for when the input tree is a generic Node
interface GenericNodeOptions<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
> {
  childrenKey: TChildrenKey
  copy?: boolean
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
  copy?: boolean
  testFn: (
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
  TCurrentNode extends Node<TChildrenKey> = Node<TChildrenKey>
> {
  childrenKey: TChildrenKey
  testFn: (
    node: TCurrentNode,
    parent: TCurrentNode | null,
    depth: number
  ) => boolean
}

// --- bifurcate Function Overloads ---

// Overload 1: For UniformNode
// When 'tree' is a UniformNode, 'options' should be UniformNodeOptions.
export function bifurcate<
  TChildrenKey extends string,
  TExtraProps extends object = { [key: string]: unknown },
  TInputNode extends UniformNode<TChildrenKey, TExtraProps> = UniformNode<
    TChildrenKey,
    TExtraProps
  >
>(
  tree: TInputNode,
  options: UniformNodeOptions<TChildrenKey, TExtraProps, TInputNode>
):
  | { parent: TInputNode; child: TInputNode }
  | { parent: null; child: TInputNode }
  | { parent: TInputNode; child: null }

// Overload 2: For generic Node (this comes after more specific overloads)
// When 'tree' is a generic Node, 'options' should be GenericNodeOptions.
export function bifurcate<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  tree: TInputNode,
  options: GenericNodeOptions<TChildrenKey>
):
  | { parent: TInputNode; child: TInputNode }
  | { parent: null; child: TInputNode }
  | { parent: TInputNode; child: null }

// --- bifurcate Implementation ---
// This single implementation handles both overload cases.
// TInputNode captures the type of the 'tree' argument (e.g., MyUniformNodeType or SomeGenericNodeType).
// Returns an object like { parent, child }
// If the target node found, it will be the root of child
// If the target node is not found, child will be null
// parent will be the tree excluding child

export function bifurcate<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  tree: TInputNode,
  options:
    | GenericNodeOptions<TChildrenKey, TInputNode>
    | UniformNodeOptions<TChildrenKey, any, TInputNode>
):
  | { parent: TInputNode; child: TInputNode }
  | { parent: null; child: TInputNode }
  | { parent: TInputNode; child: null } {
  // Resolve defaults
  const childrenKey = options.childrenKey
  const copy = options.copy ?? false
  const testFn = options.testFn

  // Prepare options for the internal recursive helper.
  const helperOptions: HelperOptions<TChildrenKey, TInputNode> = {
    childrenKey,
    testFn,
  }

  // Initial call to the recursive helper. TInputNode is the type of the root.
  return bifurcateHelper<TChildrenKey, TInputNode>(
    copy ? structuredClone(tree) : tree,
    null,
    0,
    helperOptions
  )
}

// --- bifurcateHelper (Recursive Part) ---
// TCurrentNode is the type of the node being processed in *this specific recursive step*.
function bifurcateHelper<
  TChildrenKey extends string,
  TCurrentNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  node: TCurrentNode,
  parent: TCurrentNode | null,
  depth: number,
  options: HelperOptions<TChildrenKey, TCurrentNode>
):
  | { parent: TCurrentNode; child: TCurrentNode }
  | { parent: null; child: TCurrentNode }
  | { parent: TCurrentNode; child: null } {
  // Destructure options
  const { testFn, childrenKey } = options

  // This node is a match, exit early
  if (testFn(node, parent, depth)) {
    return { parent: null, child: node }
  }

  // Get the children array
  const childrenArray = node[childrenKey] as TCurrentNode[] | undefined

  // If this is a leaf node...
  if (!childrenArray || childrenArray.length === 0) {
    return { parent: node, child: null }
  }

  // Check each child
  for (const [i, child] of childrenArray.entries()) {
    const result = bifurcateHelper(child, node, depth + 1, options)

    // If this child was successfully bifurcated, return
    if (result.child) {
      return {
        // If result.parent is null, just chop of this child from node
        // Otherwise replace this child with result.parent
        parent: {
          ...node,
          [childrenKey]:
            result.parent === null
              ? childrenArray.filter((_, j) => j !== i)
              : childrenArray.map((x, j) => (j === i ? result.parent : x)),
        },
        child: result.child,
      }
    }
  }

  // If we made it this far, a matching node was not found
  return { parent: node, child: null }
}
