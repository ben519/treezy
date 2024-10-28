# treedata
🌲 `treedata` is a tiny and fast Node.js package for creating and manipulating hierarchal (tree-shaped) data.

## Installation
ToDo

## Example usage
A _tree_ can be any JavaScript object that contains an array of children, where each child is another JavaScript object that matches the structure of its parent.

For example, here's a tree with three nodes 👇

```js
//   A
//  / \
// B   C

const myTree = {
  id: "A",
  children: [
    { id: "B", children: [] },
    { id: "C", children: [] }
  ],
}
```

`treedata` makes it easy to do things like...

**Count the number of nodes in the tree**
```js
import { getSize } from "treedata"

getSize(myTree) 
// Returns: 3
```

**Check if the tree contains at least one node with `id` equal to "Q"**
```js
import { contains } from "treedata"

contains(myTree, { testFn: (x) => x.id === "Q" }) 
// Returns: false
```

**Extract the subtree starting at the node with `id` equal to "B"**
```js
import { getSubtree } from "treedata"

getSubtree(myTree, { testFn: (x) => x.id === "B" }) 
// Returns: { id: "B", children: [] }
```

## Notes
- By default, `treedata` functions never modify their inputs by reference
- `treedata` expects every node in a tree to include an array with child nodes
- `treedata` always scans in depth-first search, pre-order
- `treedata` expects every tree to have exactly one root node (at depth 0)
- The parent of a root node is `null`

## API
- **`apply(tree, options)`** - apply some function to nodes in a tree
- **`bifurcate(tree, options)`** - split a tree into two subtrees
- **`contains(tree, options)`** - check if a tree contains a node that passes some test
- **`getDepth(tree, options?)`** - get the number of nodes in a tree
- **`getParent(tree, options)`** - get the parent node of some other node
- **`getSignature(tree, options)`** - combine the node ids and structure into a unique id
- **`getSize(tree, options?)`** - count the number of nodes in a tree
- **`getSubtree(tree, options)`** - retrieve the subtree of a tree starting at some node
- **`getValues(tree, options?)`** - retrieve the nodes or node properties as an array
- **`insert(tree, options)`** - insert one tree into another
- **`prune(tree, options)`** - delete nodes matching some criteria
- **`reduce(tree, options)`** - apply a reducer function to a tree

All functions come with an `options` parameter that let you specify things such as

- `copy`: should the input tree be copied prior to modification?
- `childrenProp`: name of the array property in the tree storing child nodes
- `testFn`: a function applied to each node, to test whether it matches some criteria

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
    }
  ],
}
```

### How do I count the total number of comments?
```js
import { getSize } from "treedata"

getSize(comment) // 4
```

### How do I count the number of comments by a particular user?
```js
import { getSize } from "treedata"

getSize(comment, { testFn: (node) => node.userId === 489294 }) // 2
```

### How do I determine the max number of likes given to any single comment?
```js
import { reduce } from "treedata"

const reducer = (node, initVal) => Math.max(node.likes, initVal)
reduce(comment, { reduceFn: reducer, initialVal: 0 }) // 3
```

### How do I flatten the comments into a 1-D array?
```js
import { getValues } from "treedata"

getValues(comment) // [{id: 234424, ...}, {id: 248210, ...}, ...]
```

### How do I retrieve all the comment values?
```js
import { getValues } from "treedata"

getValues(comment, { getFn: (node) => node.text })
// ["I like dogs", "So do I!", ...]
```

### How do I remove comments which are replies to replies, or deeper?
```js
import { prune } from "treedata"

prune(comment, { testFn: (node, parent, depth) => depth >= 2 })
```