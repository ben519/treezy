# treezy

[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]

🌲 `treezy` is a tiny and fast Node.js package for creating and manipulating hierarchal (tree-shaped) data.

## Installation

In Node.js (version 16+), install with [npm][]:

```shell
npm install treezy
```

## Why?

Here's a tree with three nodes 👇

```js
//   A
//  / \
// B   C

const myTree = {
  id: "A",
  children: [
    { id: "B", children: [] },
    { id: "C", children: [] },
  ],
}
```

`treezy` makes it easy to do things like...

**Count the number of nodes in a tree**

```js
import { getSize } from "treezy"

getSize(myTree, { childrenKey: "children" })
// Returns: 3
```

**Check if the tree contains at least one node with `id` equal to "Q"**

```js
import { contains } from "treezy"

contains(myTree, {
  childrenKey: "children",
  testFn: (x) => x.id === "Q",
}) // Returns: false
```

**Extract the subtree starting at the node with `id` equal to "B"**

```js
import { getNode } from "treezy"

getNode(myTree, {
  childrenKey: "children",
  testFn: (x) => x.id === "B",
}) // Returns: { id: "B", children: [] }
```

## You should know..

In `treezy`, the terms "node" and "tree" are used interchangeably. A _Node_ (or Tree) follows these rules:

1. A Node is an object
2. A Node may have an array of children
3. If a Node has an array of children, each child must be a Node
4. All Nodes in a tree must use the same key name for the array that stores their children

These are all valid Nodes in treezy:

```js
// A simple, balanced tree
const tree1 = {
  id: "root",
  children: [
    { id: "left", children: [] },
    { id: "right", children: [] },
  ],
}

// A tree that calls its children 'nodes'
const tree2 = {
  nodes: [{ nodes: [] }, { nodes: [] }],
}

// An unbalanced tree whose leaf nodes omit the 'children' property
const tree3 = {
  name: "a",
  children: [{ name: "b", children: [{ name: "c" }] }, { name: "d" }],
}

// A tree whose nodes have different shapes
const tree4 = {
  label: "parent",
  items: [
    { name: "child1", color: "red", items: [] },
    { id: 7, items: [] },
  ],
}
```

## Notes

- `treezy` functions operate on their input arguments by reference, by default
- `treezy` always scans in depth-first search, pre-order
- `treezy` expects every tree to have exactly one root node and considers the root depth to be 0
- `treezy` considers the parent of a root node to be `null`

## API

- **`apply(tree, options)`** - apply some function to nodes in a tree
- **`bifurcate(tree, options)`** - split a tree into two subtrees
- **`contains(tree, options)`** - check if a tree contains a node that passes some test
- **`getDepth(tree, options)`** - get the number of nodes in a tree
- **`getNode(tree, options)`** - find a node that passes some test and return it
- **`getParent(tree, options)`** - find a node that passes some test and return its parent
- **`getSignature(tree, options)`** - combine the node ids and structure into a unique id
- **`getSize(tree, options)`** - count the number of nodes in a tree
- **`getValues(tree, options)`** - retrieve the nodes or node properties as an array
- **`insert(tree, options)`** - insert one tree into another
- **`isInternalNode(tree, options)`** - test if something is an internal node
- **`isLeafNode(tree, options)`** - test if something is a leaf node
- **`isNode(tree, options)`** - test if something is a node
- **`isNodeInternalNode(tree, options)`** - test if a node is an internal node
- **`isNodeLeafNode(tree, options)`** - test if a node is a leaf node
- **`isNodeUniformNode(tree, options)`** - test if a node is a uniform node
- **`isNodeWithId(tree, options)`** - test if a something is a node with id
- **`isUniformNode(tree, options)`** - test if something is a uniform node
- **`prune(tree, options)`** - delete nodes matching some criteria
- **`reduce(tree, options)`** - apply a reducer function to a tree

All functions come with an `options` parameter that let you specify things such as

- `childrenKey`: name of the array property storing child nodes
- `copy`: should the input tree be copied prior to running the function?
- `testFn`: a function to test each node for matching criteria

See each function's type definitions for its comprehensive documentation.

## Examples

Suppose you have data for a comment thread on a YouTube video..

```js
const comment = {
  id: 234424,
  userId: 489294,
  text: "I like dogs",
  likes: 2,
  replies: [
    {
      id: 248210,
      userId: 403928,
      text: "So do I!",
      likes: 1,
      replies: [],
    },
    {
      id: 211104,
      userId: 407718,
      text: "Meh, cats are better",
      likes: 0,
      replies: [
        {
          id: 248210,
          userId: 489294,
          text: "Kick rocks, dummy head",
          likes: 3,
          replies: [],
        },
      ],
    },
  ],
}
```

### How do I count the total number of comments?

```js
import { getSize } from "treezy"

getSize(comment, { childrenKey: "replies" }) // 4
```

### How do I count the number of comments by a particular user?

```js
import { getSize } from "treezy"

getSize(comment, {
  childrenKey: "replies",
  testFn: (node) => node.userId === 489294,
}) // 2
```

### How do I determine the max number of likes given to any single comment?

```js
import { reduce } from "treezy"

const reducer = (node, initVal) => Math.max(node.likes, initVal)

reduce(comment, {
  childrenKey: "replies",
  reduceFn: reducer,
  initialVal: 0,
}) // 3
```

### How do I flatten the comments into a 1-D array?

```js
import { getValues } from "treezy"

getValues(comment, { childrenKey: "replies" })
// [{id: 234424, ...}, {id: 248210, ...}, ...]
```

### How do I retrieve all the comment values?

```js
import { getValues } from "treezy"

getValues(comment, {
  childrenKey: "replies",
  getFn: (node) => node.text,
}) // ["I like dogs", "So do I!", ...]
```

### How do I remove comments which are replies to replies, or deeper?

```js
import { prune } from "treezy"

prune(comment, {
  childrenKey: "replies",
  testFn: (node, parent, depth) => depth >= 2,
})
```

## Typescript

`treezy` has full support for typescript. Here are some examples to get you started.

### Node

A `Node` is an object with a generic children key and customizable props.

```ts
const genericNode: Node<"children", { name: string }> = {
  name: "parent",
  children: [{ name: "child1" }, { name: "child2" }],
}
```

### LeafNode

A `LeafNode` explicitly has an empty array (or undefined) for its children key.

```ts
const leaf: LeafNode<"items", { label: string }> = {
  label: "I am a leaf",
  items: [], // or `items: undefined`
}
```

### InternalNode

An `InternalNode` must have at least one child.

```ts
const internal: InternalNode<"nodes", { value: number }> = {
  value: 42,
  nodes: [{ value: 1 }, { value: 2 }],
}
```

### UniformNode

A `UniformNode` is a Node whose children have the same shape as their parent.

```ts
const uniform: UniformNode<"children", { tag: string }> = {
  tag: "div",
  children: [
    {
      tag: "span",
      children: [{ tag: "b" }],
    },
  ],
}
```

### NodeWithId

A `NodeWithId` includes a required ID key (and all of its descendants).

```ts
const nodeWithId: NodeWithId<"children", "id"> = {
  id: "root",
  children: [{ id: "a" }, { id: "b", children: [{ id: "b1" }] }],
}
```

<!-- Definitions -->

[downloads-badge]: https://img.shields.io/npm/dm/treezy.svg
[downloads]: https://www.npmjs.com/package/treezy
[size-badge]: https://img.shields.io/badge/dynamic/json?label=minzipped%20size&query=$.size.compressedSize&url=https://deno.bundlejs.com/?q=treezy
[size]: https://bundlejs.com/?q=treezy
[npm]: https://docs.npmjs.com/cli/install
