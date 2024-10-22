import { getTreeSize } from "../src/getTreeSize"
import { tree1, tree2, tree3, tree4, tree5, tree6 } from "./trees"

test("Confirm tree size is correct", () => {
  expect(getTreeSize(tree1)).toBe(1)
  expect(getTreeSize(tree2)).toBe(3)
  expect(getTreeSize(tree3)).toBe(2)
  expect(getTreeSize(tree4)).toBe(4)
  expect(getTreeSize(tree5)).toBe(10)
  expect(getTreeSize(tree6)).toBe(13)
})
