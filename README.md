# treezy

[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]

🌲 `treezy` is a tiny and fast Node.js package for creating and manipulating hierarchal (tree-shaped) data.

## Installation

In Node.js (version 16+), install with [npm][]:

```shell
npm install treezy
```

## What

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

In `treezy`, the terms "node" and "tree" are used interchangeably. A _Node_ (or Tree) follows these rules:

1. A Node is an object
2. A Node may have an array of children
3. If a Node has children, they must be an array of Nodes
4. Every Node in a tree must use the same key name to described its children

These are all valid Nodes in treezy:

```js
// Using "children" as the key
const node1 = {
  id: "root",
  children: [
    { id: "left", children: [] },
    { id: "right", children: [] },
  ],
}

// Using "nodes" as the key
const node2 = {
  name: "top",
  nodes: [
    { name: "mid", nodes: [] },
    { name: "bottom", nodes: [] },
  ],
}

// Using a custom key like "subItems"
const node3 = {
  label: "parent",
  subItems: [
    { label: "child1", subItems: [] },
    { label: "child2", subItems: [] },
  ],
}
```

## Why?

`treezy` makes it easy to do things like...

**Count the number of nodes in the tree**

```js
import { getSize } from "treezy"

getSize(myTree)
// Returns: 3
```

**Check if the tree contains at least one node with `id` equal to "Q"**

```js
import { contains } from "treezy"

contains(myTree, { testFn: (x) => x.id === "Q" })
// Returns: false
```

**Extract the subtree starting at the node with `id` equal to "B"**

```js
import { getSubtree } from "treezy"

getSubtree(myTree, { testFn: (x) => x.id === "B" })
// Returns: { id: "B", children: [] }
```

## Notes

- `treezy` functions operate on their input arguments by reference, by default
- `treezy` always scans in depth-first search, pre-order
- `treezy` expects every tree to have exactly one root node and considers the root depth to be 0
- The parent of a root node is `null`

## API

- **`apply(tree, options)`** - apply some function to nodes in a tree
- **`bifurcate(tree, options)`** - split a tree into two subtrees
- **`contains(tree, options)`** - check if a tree contains a node that passes some test
- **`getDepth(tree, options)`** - get the number of nodes in a tree
- **`getParent(tree, options)`** - get the parent node of some other node
- **`getSignature(tree, options)`** - combine the node ids and structure into a unique id
- **`getSize(tree, options)`** - count the number of nodes in a tree
- **`getSubtree(tree, options)`** - retrieve the subtree of a tree starting at some node
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

getSize(comment) // 4
```

### How do I count the number of comments by a particular user?

```js
import { getSize } from "treezy"

getSize(comment, { testFn: (node) => node.userId === 489294 }) // 2
```

### How do I determine the max number of likes given to any single comment?

```js
import { reduce } from "treezy"

const reducer = (node, initVal) => Math.max(node.likes, initVal)
reduce(comment, { reduceFn: reducer, initialVal: 0 }) // 3
```

### How do I flatten the comments into a 1-D array?

```js
import { getValues } from "treezy"

getValues(comment) // [{id: 234424, ...}, {id: 248210, ...}, ...]
```

### How do I retrieve all the comment values?

```js
import { getValues } from "treezy"

getValues(comment, { getFn: (node) => node.text })
// ["I like dogs", "So do I!", ...]
```

### How do I remove comments which are replies to replies, or deeper?

```js
import { prune } from "treezy"

prune(comment, { testFn: (node, parent, depth) => depth >= 2 })
```

## Typescript

`treezy` has full support for typescript. Here are some examples to get you started.

### Node

Base node type with generic children key and customizable props.

```ts
const genericNode: Node<"children", { name: string }> = {
  name: "parent",
  children: [{ name: "child1" }, { name: "child2" }],
}
```

### LeafNode

A leaf node explicitly has an empty array (or undefined) for its children key.

```ts
const leaf: LeafNode<"items", { label: string }> = {
  label: "I am a leaf",
  items: [], // or `items: undefined`
}
```

### InternalNode

An Internal node must have at least one child.

```ts
const internal: InternalNode<"nodes", { value: number }> = {
  value: 42,
  nodes: [{ value: 1 }, { value: 2 }],
}
```

### UniformNode

A Uniform node is a Node whose children have the same shape as their parent.

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

NodeWithId includes a required ID key (and all of its descendants).

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
