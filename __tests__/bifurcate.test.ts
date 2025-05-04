import { bifurcate } from "../src/bifurcate"
import { tree1, tree2 } from "./trees"

test("Confirm that bifurcate works", () => {
  const tree1Copy = structuredClone(tree1)
  const tree2Copy = structuredClone(tree2)

  expect(
    bifurcate(tree1Copy, { testFn: (x) => "id" in x && x.id == 1 })
  ).toEqual({ tree: null, subtree: tree1 })

  expect(
    bifurcate(tree2Copy, { copy: true, testFn: (x) => "id" in x && x.id == 3 })
  ).toEqual({
    tree: {
      id: 1,
      children: [{ id: 2, children: [] }],
    },
    subtree: { id: 3, children: [] },
  })
})
