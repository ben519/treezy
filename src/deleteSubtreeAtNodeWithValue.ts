import { Tree } from "./types.js";

interface Options {
  prop: string,
  value: any,
  strict?: boolean,
  copy?: boolean,
}

// ToDo: convert this to "deleteNodeWithValue" with options on how to merge
// the orphan subtree

export function deleteSubtreeAtNodeWithValue(tree: Tree, options: Options): Tree {
  // Delete the subtree starting at id
  // Returns an object with { newtree, subtree } where
  // subtree is the subtree starting at id
  // If id is the root, newtree will be null
  // If id should not appear more than once in the tree,
  // IMPORTANT: we assume that id occurs at most once in the tree

  if (id === tree.id) {
    return { newtree: null, subtree: tree }
  } else if (tree.posts.length == 0) {
    return { newtree: { ...tree }, subtree: null }
  } else {
    // The current node has children
    // Call deleteSubtree() on each of them

    const newChildren = []
    let subtree = null

    for (const post of tree.posts) {
      if (subtree) {
        // If subtree has already been found, just append the remaining children as they are
        newChildren.push(post)
      } else {
        // If subtree has not already been found, delete id from the current child
        // If the returned subtree is truthy, this child is the node we're looking for
        let temp = deleteSubtreeAtNodeWithValue(post, options)
        if (temp.newtree) newChildren.push(temp.newtree)
        if (temp.subtree) subtree = temp.subtree
      }
    }

    const newtree = { ...tree, posts: newChildren }
    return { newtree, subtree }
  }
}