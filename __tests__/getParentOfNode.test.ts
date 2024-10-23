import { getParentOfNode } from "../src/getParentOfNode"
import { tree1, tree2 } from "./trees"

test("Confirm getParentOfNode() returns null for parent of the root", () => {
  expect(getParentOfNode(tree1, { testFn: (x) => x.id === 1 })).toBe(null)
})

test("Confirm getParentOfNode() returns correct value for parent of non-root node", () => {
  const test2Copy = structuredClone(tree2)
  expect(getParentOfNode(tree2, { testFn: (x) => x.id === 2 }))
    .toEqual(test2Copy)
})

test("Confirm getParentOfNode() throws error when node with condition doesn't exist", () => {
  expect(() => getParentOfNode(tree1, { testFn: (x) => x.id === 999 }))
    .toThrow("node with condition could not be found")
})