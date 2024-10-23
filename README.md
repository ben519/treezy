# treedata

`treedata` is a fast and light-weight node.js package for creating and manipulating hierarchal data in a tree-like structure.

## Installation
ToDo

## Example usage

In `treedata`, a _tree_ can be any JavaScript object that contains a `children` property, such that `children` is an array of 0 or more _trees_. 

For example, here's a tree with three nodes 👇

```js
// Make a tree with three nodes like
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
import { getTreeSize } from "treedata"

getTreeSize(myTree) 
// Returns: 3
```

**check if the tree contains at least one node with `id` equal to Q**
```js
import { treeContainsNodeWithValue } from "treedata"

treeContainsNodeWithValue(myTree, { prop: "id", value: "Q" }) 
// Returns: false
```

**extract the subtree starting at the node with `id` equal to `"B"`**
```js
import { getSubtreeByValue } from "treedata"

getSubtreeByValue(myTree, { prop: "id", value: "B" }) 
// Returns: { id: "B", children: [] }
```

## Notes
- By default, `treedata` functions never modify their inputs by reference.
- `treedata` expects every node in a tree to include a `children[]` property

## Examples
A common source of tree-shaped data are comments to a post / article / video / etc. Each comment thread can be represented by a root comment that can have 0 or more replies (also comments), each of which may have their own replies, and so on.

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