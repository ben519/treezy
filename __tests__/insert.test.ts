import { insert } from "../src/insert"
import { tree1 } from "./trees"

test("Confirm insert() inserts correctly", () => {
  const tree1Copy = structuredClone(tree1)

  expect(insert(tree1Copy, { subtree: tree1, testFn: (x) => x.id === 1, direction: "below" })).toEqual(
    {
      id: 1,
      children: [
        {
          id: 1,
          children: [],
        }
      ],
    }
  )
})