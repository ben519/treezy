import { getDepth } from "../src/getDepth"
import { tree1, tree2, tree3, tree4, tree5, tree6 } from "./trees"

test("Confirm tree depth is correct", () => {
  expect(getDepth(tree1)).toBe(0)
  expect(getDepth(tree2)).toBe(1)
  expect(getDepth(tree3)).toBe(1)
  expect(getDepth(tree4)).toBe(2)
  expect(getDepth(tree5)).toBe(3)
  expect(getDepth(tree6)).toBe(4)
})
