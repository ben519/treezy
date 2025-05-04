import { getSubtree } from "../src/getSubtree"
import { tree1, tree2, tree6, tree8 } from "./trees"

test("Confirm getSubtree() finds the right match", () => {
  expect(getSubtree(tree1, { testFn: (x) => "id" in x && x.id === 1 })).toEqual(
    structuredClone(tree1)
  )

  expect(getSubtree(tree2, { testFn: (x) => "id" in x && x.id === 1 })).toEqual(
    structuredClone(tree2)
  )

  expect(getSubtree(tree2, { testFn: (x) => "id" in x && x.id === 3 })).toEqual(
    { id: 3, children: [] }
  )

  expect(
    getSubtree(tree8, { testFn: (x) => "color" in x && x.color === "red" })
  ).toEqual(structuredClone(tree8))
})

test("Confirm subtree without a match", () => {
  expect(getSubtree(tree1, { testFn: (x) => "id" in x && x.id === 2 })).toBe(
    null
  )
  expect(getSubtree(tree6, { testFn: (x) => "id" in x && x.id === 999 })).toBe(
    null
  )
  expect(
    getSubtree(tree2, { testFn: (x) => "foo" in x && x.foo == "nonexistent" })
  ).toBe(null)
})
