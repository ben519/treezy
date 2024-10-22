import { getTreeDepth } from "../src/getTreeDepth"
import { tree1, tree2, tree3, tree4, tree5, tree6 } from "./trees"

test("Confirm tree depth is correct", () => {
  expect(getTreeDepth(tree1)).toBe(0)
  expect(getTreeDepth(tree2)).toBe(1)
  expect(getTreeDepth(tree3)).toBe(1)
  expect(getTreeDepth(tree4)).toBe(2)
  expect(getTreeDepth(tree5)).toBe(3)
  expect(getTreeDepth(tree6)).toBe(4)
})
