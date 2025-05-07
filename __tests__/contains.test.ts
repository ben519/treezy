import { contains } from "../src/contains"
import { Node } from "../src/types"
import { tree1, tree2 } from "./trees"

test("Confirm contains() finds matching nodes", () => {
  const testFn = (x: Node) => x.id === 1

  expect(
    contains(tree1, {
      testFn: (x: Node) => x.id === 1,
    })
  ).toBe(true)
  expect(contains(tree2, { testFn })).toBe(true)
})

test("Confirm contains() doesn't find non-matching nodes", () => {
  const testFn = (x: Node) => x.id === 999

  expect(contains(tree1, { testFn })).toBe(false)
  expect(contains(tree2, { testFn })).toBe(false)
})
