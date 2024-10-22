import { flattenTree } from "../src/flattenTree"
import { tree1, tree2, tree3, tree4, tree5, tree6 } from "./trees"

test("Confirm flattenTree() is correct", () => {
  expect(flattenTree(tree1)).toStrictEqual([{ id: 1 }])
  expect(flattenTree(tree2)).toStrictEqual(
    [{ id: 1 }, { id: 2 }, { id: 3 }]
  )

  expect(flattenTree(tree3)).toStrictEqual(
    [{ id: 1 }, { id: 3 }]
  )

  expect(flattenTree(tree4)).toStrictEqual(
    [
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 },
    ]
  )

  expect(flattenTree(tree5)).toStrictEqual(
    [
      { id: 1 },
      { id: 2 },
      { id: 6 },
      { id: 7 },
      { id: 3 },
      { id: 8 },
      { id: 4 },
      { id: 9 },
      { id: 10 },
      { id: 11 },
    ]
  )

  expect(flattenTree(tree6)).toStrictEqual(
    [
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 6 },
      { id: 7 },
      { id: 4 },
      { id: 8 },
      { id: 5 },
      { id: 9 },
      { id: 10 },
      { id: 11 },
      { id: 12 },
      { id: 13 },
    ]
  )

})
