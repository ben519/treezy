import { Tree } from "./types.js"

interface Options {
  prop: string,
  value: any,
  strict?: boolean,
  direction?: "after" | "before" | "below",
  copy?: boolean,
}

/**
 * Insert insertTree into baseTree at some specified node
 * @param baseTree 
 * @param insertTree 
 * @param options 
 * @returns resulting tree
 */
export function insert(baseTree: Tree, insertTree: Tree, options: Options): Tree {

  // Check options
  if (!Object.hasOwn(options, "prop")) {
    throw new Error("options is missing the 'prop' property")
  }

  // Run the helper function
  const newTree = insertHelper(baseTree, insertTree, options)

  // If id wasn't found in tree, throw an error
  if (newTree === null) {
    throw new Error(
      `Could not insert insertTree into baseTree because baseTree does not contain\
       a node with property ${ options.prop } whoes value is ${ options.value }`
    )
  }

  return newTree
}

function insertHelper(baseTree: Tree, insertTree: Tree, options: Options): Tree | null {

  // Destructure options
  const { prop, value, strict = true, direction = "below", copy = true } = options

  if (direction === "below") {

    // If this node has the matching value...
    if (
      (strict && baseTree[prop as keyof Tree] === value) ||
      (!strict && baseTree[prop as keyof Tree] == value)
    ) {
      if (copy) {
        return { ...baseTree, children: [...baseTree.children, insertTree] }
      } else {
        baseTree.children.push(insertTree)
        return baseTree
      }
    }

    // Check each child of this node for the matching value
    for (const [idx, child] of baseTree.children.entries()) {

      // Recursively call insertHelper() on this child node
      const newChild = insertHelper(child, insertTree, options)

      if (newChild !== null) {
        // Found the subtree with the matching node

        if (copy) {
          const newChildren = [...baseTree.children]
          newChildren.splice(idx, 1, newChild)
          return { ...baseTree, children: newChildren }
        } else {
          baseTree.children.splice(idx, 1, newChild)
          return baseTree
        }

      }
    }
  }

  else if (direction === "before") {

    // If this node has the matching value...
    if (
      (strict && baseTree[prop as keyof Tree] === value) ||
      (!strict && baseTree[prop as keyof Tree] == value)
    ) {
      throw new Error("Cannot insert insertTree before the root of baseTree")
    }

    // Check each child of this node for the matching value
    for (const [idx, child] of baseTree.children.entries()) {
      if (
        (strict && child[prop as keyof Tree] === value) ||
        (!strict && child[prop as keyof Tree] == value)
      ) {
        // Found the matching node

        if (copy) {
          const newChildren = [...baseTree.children]
          newChildren.splice(idx, 0, insertTree)
          return { ...baseTree, children: newChildren }
        } else {
          baseTree.children.splice(idx, 0, insertTree)
          return baseTree
        }

      } else {

        // Recursively call insertHelper() on this child node
        const newChild = insertHelper(child, insertTree, options)

        if (newChild !== null) {
          // Found the subtree with the matching node

          if (copy) {
            const newChildren = [...baseTree.children]
            newChildren.splice(idx, 1, newChild)
            return { ...baseTree, children: newChildren }
          } else {
            return baseTree
          }

        }
      }
    }
  }

  else if (direction === "after") {

    // If this node has the matching value...
    if (
      (strict && baseTree[prop as keyof Tree] === value) ||
      (!strict && baseTree[prop as keyof Tree] == value)
    ) {
      throw new Error("Cannot insert insertTree after the root of baseTree")
    }

    for (const [idx, child] of baseTree.children.entries()) {

      if (
        (strict && child[prop as keyof Tree] === value) ||
        (!strict && child[prop as keyof Tree] == value)
      ) {
        // Found the matching node

        if (copy) {
          const newChildren = [...baseTree.children]
          newChildren.splice(idx + 1, 0, insertTree)
          return { ...baseTree, children: newChildren }
        } else {
          baseTree.children.splice(idx + 1, 0, insertTree)
          return baseTree
        }

      } else {

        // Recursively call insertHelper() on this child node
        const newChild = insertHelper(child, insertTree, options)

        if (newChild !== null) {
          // Found the subtree with the matching node

          if (copy) {
            const newChildren = [...baseTree.children]
            newChildren.splice(idx, 1, newChild)
            return { ...baseTree, children: newChildren }
          } else {
            return baseTree
          }

        }
      }
    }
  }

  return null
}