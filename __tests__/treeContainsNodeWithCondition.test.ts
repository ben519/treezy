import { treeContainsNodeWithCondition } from "../src/treeContainsNodeWithCondition"
import { Node } from "../src/types"
import { tree1, tree2 } from "./trees"

test("Confirm treeContainsNodeWithCondition() finds matching nodes", () => {
  const testFn = (x: Node) => x.id === 1
  expect(treeContainsNodeWithCondition(tree1, testFn)).toBe(true)
  expect(treeContainsNodeWithCondition(tree2, testFn)).toBe(true)
})

test("Confirm treeContainsNodeWithCondition() doesn't find non-matching nodes", () => {
  const testFn = (x: Node) => x.id === 999
  expect(treeContainsNodeWithCondition(tree1, testFn)).toBe(false)
  expect(treeContainsNodeWithCondition(tree2, testFn)).toBe(false)
})
