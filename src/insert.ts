import { Node, UniformNode } from "./types.js"

// Options for when the input tree is a generic Node
interface GenericNodeOptions<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
> {
  childrenKey: TChildrenKey
  copy?: boolean
  direction?: "after" | "before" | "below"
  nodeToInsert: TInputNode
  testFn?: (
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
  direction?: "after" | "before" | "below"
  nodeToInsert: TInputNode
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
  TChildrenKey extends string,
  TExtraProps extends object = { [key: string]: unknown },
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
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  tree: TInputNode,
  options: GenericNodeOptions<TChildrenKey>
): TInputNode | undefined

// --- insert Implementation ---
// This single implementation handles both overload cases.
// TInputNode captures the type of the 'tree' argument (e.g., MyUniformNodeType or SomeGenericNodeType).
export function insert<
  TChildrenKey extends string,
  TInputNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  tree: TInputNode,
  options:
    | GenericNodeOptions<TChildrenKey, TInputNode>
    | UniformNodeOptions<TChildrenKey, any, TInputNode>
): TInputNode | undefined {
  // Resolve defaults
  const childrenKey = options.childrenKey
  const copy = options.copy ?? false
  const direction = options.direction ?? "below"
  const nodeToInsert = options.nodeToInsert
  const testFn = options.testFn ?? (() => true)

  // Make a Weak Set to keep track of nodes for circular reference
  const visitedNodesSet = new WeakSet()

  // Prepare options for the internal recursive helper.
  const helperOptions: HelperOptions<TChildrenKey, TInputNode> = {
    childrenKey,
    direction,
    nodeToInsert,
    testFn,
  }

  // Initial call to the recursive helper. TInputNode is the type of the root.
  return insertHelper<TChildrenKey, TInputNode>(
    copy ? structuredClone(tree) : tree,
    null,
    0,
    visitedNodesSet,
    helperOptions
  )
}

// --- insertHelper (Recursive Part) ---
// TCurrentNode is the type of the node being processed in *this specific recursive step*.
function insertHelper<
  TChildrenKey extends string,
  TCurrentNode extends Node<TChildrenKey> = Node<TChildrenKey>
>(
  node: TCurrentNode,
  parent: TCurrentNode | null,
  depth: number,
  visited: WeakSet<object>,
  options: HelperOptions<TChildrenKey, TCurrentNode>
): TCurrentNode | undefined {
  const { testFn, direction, childrenKey, nodeToInsert } = options

  // Check if this node has already been visited
  if (visited.has(node)) throw new Error("Circular reference detected")
  visited.add(node)

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
    const wasInserted = insertHelper(child, node, depth + 1, visited, options)
    if (wasInserted) return node
  }

  // If we made it this far, this tree doesn't have a matching node
  visited.delete(node)
  return undefined
}
