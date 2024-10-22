import { getSubtreeByCondition } from "../src/getSubtreeByCondition"
import { tree1, tree2, tree6, tree8 } from "./trees"

test("Confirm getSubtreeByCondition() finds the right match", () => {

  expect(getSubtreeByCondition(
    tree1,
    { testFn: (x) => x.id === 1 }
  )).toEqual(structuredClone(tree1))

  expect(getSubtreeByCondition(
    tree2,
    { testFn: (x) => x.id === 1 })
  ).toEqual(structuredClone(tree2))

  expect(getSubtreeByCondition(
    tree2,
    { testFn: (x) => x.id === 3 })
  ).toEqual({ id: 3, children: [] })

  expect(getSubtreeByCondition(
    tree8,
    { testFn: (x) => x.color === "red" })
  ).toEqual(structuredClone(tree8))

})

test("Confirm subtree without a match", () => {
  expect(getSubtreeByCondition(tree1, { testFn: (x) => x.id === 2 })).toBe(null)
  expect(getSubtreeByCondition(tree6, { testFn: (x) => x.id === 999 })).toBe(null)
  expect(getSubtreeByCondition(tree2, { testFn: (x) => x.foo == "nonexistent" })).toBe(null)
})
