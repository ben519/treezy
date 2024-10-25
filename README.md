# treedata
`treedata` is a tiny and fast Node.js package for creating and manipulating hierarchal data; I.e. data shaped like a tree 🌲.

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

**count the number of nodes in the tree**
```js
import { getSize } from "treedata"

getSize(myTree) 
// Returns: 3
```

**check if the tree contains at least one node with `id` equal to "Q"**
```js
import { contains } from "treedata"

contains(myTree, { prop: "id", value: "Q" }) 
// Returns: false
```

**extract the subtree starting at the node with `id` equal to "B"**
```js
import { getSubtree } from "treedata"

getSubtree(myTree, { testFn: (x) => x.id === "B" }) 
// Returns: { id: "B", children: [] }
```

## Notes
- By default, `treedata` functions never modify their inputs by reference
- `treedata` expects every node in a tree to include a `children[]` property
- `treedata` always scans in depth-first search, pre-order
- `treedata` expects every tree to have exactly one root node (at depth 0)
- The parent of a root node is `null`

## API
- **`apply(tree, options)`**
- **`bifurcate(tree, options)`**
- **`contains(tree, options)`**
- **`getDepth(tree)`**
- **`getNodes(tree, options?)`**
- **`getParent(tree, options)`**
- **`getSignature(tree, options)`**
- **`getSize(tree, options?)`**
- **`getSubtree(tree, options)`**
- **`getValues(tree, options)`**
- **`insert(tree, options)`**
- **`prune(tree, options)`**
- **`reduce(tree, options)`**

## Examples
Suppose you have data for a comment thread on a YouTube video..

```js
const commentThread = {
  id: 234424,
  userId: 489294,
  comment: "I like dogs",
  likes: 2,
  children: [
    {
      id: 248210,
      userId: 403928,
      comment: "So do I!",
      likes: 1,
      children: [],
    },
    {
      id: 211104,
      userId: 407718,
      comment: "Meh, cats are better",
      likes: 0,
      children: [
        {
          id: 248210,
          userId: 489294,
          comment: "Kick rocks, dummy head",
          likes: 3,
          children: [],
        },
      ],
    }
  ],
}
```