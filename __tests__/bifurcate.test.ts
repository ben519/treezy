import { bifurcate } from "../src/bifurcate"
import { tree1 } from "./trees"

test("Confirm that bifurcate works", () => {
  const tree1Copy = structuredClone(tree1)

  expect(bifurcate(tree1Copy, { testFn: (x) => x.id == 1 }))
    .toEqual({ tree: null, subtree: tree1 })
})