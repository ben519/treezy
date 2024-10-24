import { getParent } from "../src/getParent"
import { tree1, tree2 } from "./trees"

test("Confirm getParent() returns null for parent of the root", () => {
  expect(getParent(tree1, { testFn: (x) => x.id === 1 })).toBe(null)
})

test("Confirm getParent() returns correct value for parent of non-root node", () => {
  const test2Copy = structuredClone(tree2)
  expect(getParent(tree2, { testFn: (x) => x.id === 2 }))
    .toEqual(test2Copy)
})

test("Confirm getParent() throws error when node with condition doesn't exist", () => {
  expect(() => getParent(tree1, { testFn: (x) => x.id === 999 }))
    .toThrow("Node with condition could not be found")
})