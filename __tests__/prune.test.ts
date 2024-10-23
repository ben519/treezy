import { prune } from "../src/prune"
import { tree1, tree2, tree3, tree8 } from "./trees"

test("Prune tree at the root should return null", () => {
  expect(prune(tree1, { testFn: (x) => true })).toBe(null)
})

test("Prune tree not at the root", () => {
  const expect1 = structuredClone(tree1)
  const expect2 = { id: 1, children: [{ id: 2, children: [] }] }
  const expect3 = { id: 1, children: [] }
  const expect8 = { id: 1, color: "red", children: [{ id: 3, color: "red", children: [] }] }

  expect(prune(tree1, { testFn: (x) => x.id >= 3 }))
    .toEqual(expect1)

  expect(prune(tree2, { testFn: (x) => x.id >= 3 }))
    .toEqual(expect2)

  expect(prune(tree3, { testFn: (x) => x.id >= 3 }))
    .toEqual(expect3)

  expect(prune(tree8, { testFn: (x) => x.id == 2 }))
    .toEqual(expect8)
})