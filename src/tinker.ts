// I want to represent a tree (Node) data structure. For example,
//
//       [a]
//      /   \
//   [b]     [c]
//          / | \
//       [d] [e] [f]
//
//
// Rules:
// A Node should be an object with a 'children' property (which may or may not be present / undefined)
// If the children property is present, it must represent an array of Nodes
// The name of the children property can be any string, but it must be consistent for all nodes in a Node

// These are valid Nodes:
const validNode1 = {
  name: "a",
  children: [
    { name: "b", children: [] },
    { name: "c", children: [] },
  ],
}
const validNode2 = { children: [{ children: [{ children: [] }] }] }
const validNode3 = { id: 7, name: "bob" }
const validNode4 = {
  id: 7,
  kids: [
    { id: 12, name: "john" },
    { id: "XY29d", name: "Ryan", age: 40, kids: [{ id: 92 }] },
  ],
}

// Invalid Node:
// Assuming we tell typescript that this node uses 'children' as the
// children property, then children: "none" should raise an error
const invalidNode1 = {
  id: 1,
  children: [
    { id: 2, children: [] },
    { id: 3, children: "none" },
  ],
}

// Weird case:
// Assuming we tell typescript that this node uses 'children' as the
// children property, this example is technically valid, but it would be
// interpreted as a "stump" (a tree with one node).
const weirdNode1 = {
  id: 1,
  children: [{ id: 2, kids: [{ id: 3, children: [] }] }],
}

// Node Version 1
// Here's a possible type definition for Node
// It defaults TChildrenKey to "children", but this can be changed
export type NodeV1<TChildrenKey extends string = "children"> = Record<
  string,
  unknown
> & {
  [K in TChildrenKey]?: NodeV1<TChildrenKey>[]
}

const validNode1V1: NodeV1 = {
  name: "a",
  children: [
    { name: "b", children: [] },
    { name: "c", children: [] },
  ],
}
const validNode2V1: NodeV1 = { children: [{ children: [] }, { children: [] }] }
const validNode3V1: NodeV1 = { id: 7, name: "bob" }
const validNode4V1: NodeV1<"kids"> = {
  id: 7,
  kids: [
    { id: 12, name: "john" },
    { id: "XY29d", name: "Ryan", age: 40, kids: [{ id: 92 }] },
  ],
}

// Node Version 2
// Here's a possible type definition for Node
export type NodeV2<
  TChildrenKey extends string = "children",
  TExtraProps extends Record<string, unknown> = Record<string, unknown>
> = Omit<TExtraProps, TChildrenKey> & {
  [K in TChildrenKey]?: NodeV2<TChildrenKey, Record<string, unknown>>[]
}

const validNode1V2: NodeV2 = {
  name: "a",
  children: [
    { name: "b", children: [] },
    { name: "c", children: [] },
  ],
}
const validNode2V2: NodeV2 = { children: [{ children: [] }, { children: [] }] }
const validNode3V2: NodeV2 = { id: 7, name: "bob" }
const validNode4V2: NodeV2<"kids"> = {
  id: 7,
  kids: [
    { id: 12, name: "john" },
    { id: "XY29d", name: "Ryan", age: 40, kids: [{ id: 92 }] },
  ],
}

// Unfortunately, it has this very weird and annoying quirk where it
// works with types but not interfaces

type PropsType = {
  name: string
  count: number
}

interface PropsInterface {
  name: string
  count: number
}

// This is fine
const validNode5V2: NodeV2<"items", PropsType> = {
  name: "root",
  count: 0,
  items: [],
}

// This gives a typescript error:
// Type 'PropsInterface' does not satisfy the constraint 'Record<string, unknown>'.
//   Index signature for type 'string' is missing in type 'PropsInterface'.
const validNode6V2: NodeV2<"items", PropsInterface> = {
  name: "root",
  count: 0,
  items: [],
}

// Node Version 3
// This fixes the problem above
export type NodeV3<
  TChildrenKey extends string = "children",
  TExtraProps extends object = { [key: string]: unknown }
> = Omit<TExtraProps, TChildrenKey> & {
  [K in TChildrenKey]?: NodeV3<TChildrenKey, { [key: string]: unknown }>[]
}

const validNode1V3: NodeV3 = {
  name: "a",
  children: [
    { name: "b", children: [] },
    { name: "c", children: [] },
  ],
}
const validNode2V3: NodeV3 = { children: [{ children: [] }, { children: [] }] }
const validNode3V3: NodeV3 = { id: 7, name: "bob" }
const validNode4V3: NodeV3<"kids"> = {
  id: 7,
  kids: [
    { id: 12, name: "john" },
    { id: "XY29d", name: "Ryan", age: 40, kids: [{ id: 92 }] },
  ],
}
const validNode5V3: NodeV3<"items", PropsType> = {
  name: "root",
  count: 0,
  items: [],
}
const validNode6V3: NodeV3<"items", PropsInterface> = {
  name: "root",
  count: 0,
  items: [],
}

// ...but it has a weird quirk of its own
const nodeKeys = Object.keys(validNode1V3)
const extraKeys = nodeKeys.filter((x) => x !== "children")
typeof validNode1V3[extraKeys[0]]

// ===== UniformNode ===============
// A uniform node is a Node such that every child has the same
// shape as its parent.

export type UniformNodeV1<
  TChildrenKey extends string,
  TExtraProps extends object,
  TNode extends NodeV3<TChildrenKey, TExtraProps> = NodeV3<
    TChildrenKey,
    TExtraProps
  >
> = TNode & {
  [K in TChildrenKey]?: UniformNodeV1<TChildrenKey, TExtraProps, TNode>[]
}

const validUniformNode1V1: UniformNodeV1<"children", { name: string }> = {
  name: "a",
  children: [
    { name: "b", children: [] },
    { name: "c", children: [] },
  ],
}

const inValidUniformNode2V1: UniformNodeV1<"children", { name: string }> = {
  name: "a",
  children: [
    { name: 1, children: [] },
    { name: "c", children: [] },
  ],
}

export type UniformNodeV2<
  TChildrenKey extends string = "children",
  TExtraProps extends object = { [key: string]: unknown }
> = Omit<TExtraProps, TChildrenKey> & {
  [K in TChildrenKey]?: UniformNodeV2<TChildrenKey, TExtraProps>[]
}

const validUniformNode1V2: UniformNodeV2 = {
  name: "a",
  children: [
    { name: "b", children: [] },
    { name: "c", children: [] },
  ],
}

const inValidUniformNode2V2: UniformNodeV2<"children"> = {
  name: "a",
  children: [
    { name: 1, children: [] },
    { name: "c", children: [] },
  ],
}
