import { getDescendants } from "../src/getDescendants"
import { tree1 } from "./trees"

test("Confirm getDescendants() is correct", () => {
  const tree1Copy = structuredClone(tree1)

  expect(getDescendants(tree1Copy,
    { testFn: (x) => x.id == 1, includeMatchingNode: true }
  )).toEqual([{ "children": [], "id": 1 }])
})
