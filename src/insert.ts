import { Node, UniformNode } from "./types.js"

// Options for when the input tree is a generic Node
interface GenericNodeOptions<
  TChildrenKey extends string = "children",
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
> {
  nodeToInsert: TInputNode
  testFn?: (
    node: TInputNode,
    parent: TInputNode | null,
    depth: number
  ) => boolean
  direction?: "after" | "before" | "below"
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
  nodeToInsert: TInputNode
  testFn?: (
    node: TInputNode,
    parent: TInputNode | null,
    depth: number
  ) => boolean
  direction?: "after" | "before" | "below"
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
  direction: "after" | "before" | "below"
  nodeToInsert: TCurrentNode
  testFn: (
    node: TCurrentNode,
    parent: TCurrentNode | null,
    depth: number
  ) => boolean
}

// --- insert Function Overloads ---

// Overload 1: For UniformNode
// When 'tree' is a UniformNode, 'options' should be UniformNodeOptions.
export function insert<
  TChildrenKey extends string = "children",
  TExtraProps extends object = {},
  TInputNode extends UniformNode<TChildrenKey, TExtraProps> = UniformNode<
    TChildrenKey,
    TExtraProps
  >
>(
  tree: TInputNode,
  options: UniformNodeOptions<TChildrenKey, TExtraProps, TInputNode>
): TInputNode | undefined

// Overload 2: For generic Node (this comes after more specific overloads)
// When 'tree' is a generic Node, 'options' should be GenericNodeOptions.
export function insert<
  TChildrenKey extends string = "children",
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  tree: TInputNode,
  options: GenericNodeOptions<TChildrenKey>
): TInputNode | undefined

// --- insert Implementation ---
// This single implementation handles both overload cases.
// TInputNode captures the type of the 'tree' argument (e.g., MyUniformNodeType or SomeGenericNodeType).
export function insert<
  TChildrenKey extends string = "children",
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  tree: TInputNode,
  options:
    | GenericNodeOptions<TChildrenKey, TInputNode>
    | UniformNodeOptions<TChildrenKey, any, TInputNode>
): TInputNode | undefined {
  // Resolve defaults
  const childrenKey: TChildrenKey =
    options.childrenKey ?? ("children" as TChildrenKey)
  const testFn = options.testFn ?? (() => true)
  const direction = options.direction ?? "below"
  const copy = options.copy ?? false
  const nodeToInsert = options.nodeToInsert

  // Prepare options for the internal recursive helper.
  const helperOptions: HelperOptions<TChildrenKey, TInputNode> = {
    childrenKey,
    testFn,
    direction,
    nodeToInsert,
  }

  // Initial call to the recursive helper. TInputNode is the type of the root.
  return insertHelper<TChildrenKey, TInputNode>(
    copy ? structuredClone(tree) : tree,
    null,
    0,
    helperOptions
  )
}

function insertHelper<
  TChildrenKey extends string = "children",
  TCurrentNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  node: TCurrentNode,
  parent: TCurrentNode | null,
  depth: number,
  options: HelperOptions<TChildrenKey, TCurrentNode>
): TCurrentNode | undefined {
  const { testFn, direction, childrenKey, nodeToInsert } = options

  // If this node passes testFn, insert nodeToInsert
  if (testFn(node, parent, depth)) {
    if (["after", "before"].includes(direction)) {
      if (parent === null) {
        throw new Error(
          "Cannot insert 'nodeToInsert' before the root of 'node'"
        )
      }

      // Get the array of children containing this node
      // Find the index of this node in the array
      const childrenOfParent = parent[childrenKey]!
      const idxOfNode = childrenOfParent.findIndex((x) => x === node)

      // Insert nodeToInsert into the array
      childrenOfParent.splice(
        idxOfNode + direction === "before" ? 0 : 1,
        0,
        nodeToInsert
      )

      return node
    } else if (direction === "below") {
      let childrenProp = node[childrenKey]

      if (childrenProp === undefined) {
        ;(node[childrenKey] as TCurrentNode[]) = [nodeToInsert]
      } else {
        childrenProp.push(nodeToInsert)
      }

      return node
    }
  }

  // Get the children array
  const childrenArray = node[childrenKey] as TCurrentNode[] | undefined

  // Recursively check each child subtree
  for (const child of childrenArray ?? []) {
    const wasInserted = insertHelper(child, node, depth + 1, options)
    if (wasInserted) return node
  }

  // If we made it this far, this tree doesn't have a matching node
  return undefined
}
