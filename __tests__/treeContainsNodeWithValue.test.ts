import { treeContainsNodeWithValue } from "../src/treeContainsNodeWithValue"
import { tree1, tree2 } from "./trees"

test("Confirm treeContainsNodeWithValue() finds matching nodes", () => {
  expect(treeContainsNodeWithValue(tree1, { prop: "id", value: 1 })).toBe(true)
  expect(treeContainsNodeWithValue(tree2, { prop: "id", value: 1 })).toBe(true)
})

test("Confirm treeContainsNodeWithValue() doesn't find non-matching nodes ", () => {
  expect(treeContainsNodeWithValue(tree1, { prop: "id", value: 999 })).toBe(false)
  expect(treeContainsNodeWithValue(tree2, { prop: "id", value: 999 })).toBe(false)
})
