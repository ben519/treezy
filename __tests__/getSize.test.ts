import { getSize } from "../src/getSize"
import { tree1, tree2, tree3, tree4, tree5, tree6 } from "./trees"

test("Check node count without condition", () => {
  expect(getSize(tree1)).toBe(1)
  expect(getSize(tree2)).toBe(3)
  expect(getSize(tree3)).toBe(2)
  expect(getSize(tree4)).toBe(4)
  expect(getSize(tree5)).toBe(10)
  expect(getSize(tree6)).toBe(13)
})

test("Check node count with condition", () => {
  expect(getSize(tree1, { testFn: (x) => x.id <= 3 })).toBe(1)
  expect(getSize(tree2, { testFn: (x) => x.id <= 3 })).toBe(3)
  expect(getSize(tree3, { testFn: (x) => x.id <= 3 })).toBe(2)
  expect(getSize(tree4, { testFn: (x) => x.id <= 3 })).toBe(3)
  expect(getSize(tree5, { testFn: (x) => x.id <= 3 })).toBe(3)
  expect(getSize(tree6, { testFn: (x) => x.id <= 3 })).toBe(3)
})