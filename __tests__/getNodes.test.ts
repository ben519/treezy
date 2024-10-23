import { getNodes } from "../src/getNodes"
import { tree1, tree2, tree3, tree4, tree5, tree6 } from "./trees"

test("Confirm getNodes() is correct", () => {
  expect(getNodes(tree1)).toStrictEqual([{ id: 1 }])
  expect(getNodes(tree2)).toStrictEqual(
    [{ id: 1 }, { id: 2 }, { id: 3 }]
  )

  expect(getNodes(tree3)).toStrictEqual(
    [{ id: 1 }, { id: 3 }]
  )

  expect(getNodes(tree4)).toStrictEqual(
    [
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 },
    ]
  )

  expect(getNodes(tree5)).toStrictEqual(
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

  expect(getNodes(tree6)).toStrictEqual(
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
