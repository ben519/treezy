export * from "./apply.js"
export * from "./bifurcate.js"
export * from "./contains.js"
export * from "./getAncestors.js"
export * from "./getDepth.js"
export * from "./getDescendants.js"
export * from "./getNodes.js"
export * from "./getParent.js"
export * from "./getSignature.js"
export * from "./getSize.js"
export * from "./getSubtree.js"
export * from "./getValues.js"
export * from "./insert.js"
export * from "./prune.js"
export * from "./reduce.js"
export * from "./types.js"


// getNodes(tree, { 
//   testFn,
//   filter: "matches" | "parents" | "ancestors" | "inclusiveAncestors" | "descendants" | "inclusiveDescendants",
//   firstMatchOnly: true,
//   specialFields: ["_depth", "_parent"],
//   copy
// })

// apply(tree, {
//   applyFn: (node: Node, _parent?: Node | null, _depth?: number | null) => any,
//   testFn,
//   filter: "matches" | "parents" | "ancestors" | "inclusiveAncestors" | "descendants" | "inclusiveDescendants",
//   firstMatchOnly: true,
//   copy
// })


// delete getParent()
// delete getDescendants()
// delete getAncestors()
