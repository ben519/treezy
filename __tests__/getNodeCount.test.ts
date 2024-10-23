import { getNodeCount } from "../src/getNodeCount"
import { tree1, tree2, tree3, tree4, tree5, tree6 } from "./trees"

test("Check node count without condition", () => {
  expect(getNodeCount(tree1)).toBe(1)
  expect(getNodeCount(tree2)).toBe(3)
  expect(getNodeCount(tree3)).toBe(2)
  expect(getNodeCount(tree4)).toBe(4)
  expect(getNodeCount(tree5)).toBe(10)
  expect(getNodeCount(tree6)).toBe(13)
})

test("Check node count with condition", () => {
  expect(getNodeCount(tree1, { testFn: (x) => x.id <= 3 })).toBe(1)
  expect(getNodeCount(tree2, { testFn: (x) => x.id <= 3 })).toBe(3)
  expect(getNodeCount(tree3, { testFn: (x) => x.id <= 3 })).toBe(2)
  expect(getNodeCount(tree4, { testFn: (x) => x.id <= 3 })).toBe(3)
  expect(getNodeCount(tree5, { testFn: (x) => x.id <= 3 })).toBe(3)
  expect(getNodeCount(tree6, { testFn: (x) => x.id <= 3 })).toBe(3)
})