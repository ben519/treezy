# treedata

`treedata` is a node.js package for creating and manipulating hierarchal data in a tree-like structure.

## Installation

## Example usage

A _tree_ is just a JavaScript object with some array property that represents its children. For example, here's a tree with three nodes 👇

```js
// Represent a tree with three nodes like
//   A
//  / \
// B   C

const tree2 = {
  id: 1,
  children: [
    { id: 2, children: [] },
    { id: 3, children: [] }
  ],
}
```

`treedata` makes it easy to do things like

**Check if the tree contains at least one node with `id` equal to 3**
```js

```

## Tree rules
A _tree_ should be a JavaScript object with an `id` property and a `children[]` property.
  - `id` should be a unique identifier for the node
  - `children` should be an array of child nodes
