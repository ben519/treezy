import { getAncestors } from "../src/getAncestors"
import { tree1 } from "./trees"

test("Confirm getAncestors() is correct", () => {
  const tree1Copy = structuredClone(tree1)

  expect(getAncestors(tree1Copy, { testFn: (x) => x.id === 1 }))
    .toEqual([])
})
