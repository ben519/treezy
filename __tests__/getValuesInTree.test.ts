import { getValuesInTree } from "../src/getValuesInTree"
import { commentThread, tree7, tree8 } from "./trees"

test("Confirm getValuesInTree() is correct", () => {
  expect(getValuesInTree(tree7, { prop: "color" }))
    .toStrictEqual(["red"])

  expect(getValuesInTree(tree8, { prop: "color" }))
    .toStrictEqual(["red", "green", "red"])

  expect(getValuesInTree(commentThread, { prop: "id" }))
    .toStrictEqual([234424, 248210, 211104, 248210])
})
