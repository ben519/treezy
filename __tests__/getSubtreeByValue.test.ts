import { getSubtreeByValue } from "../src/getSubtreeByValue"
import { tree1 } from "./trees"

test("Get subtree starting at root", () => {
  expect(getSubtreeByValue(tree1, { prop: "id", value: 1 })).toEqual(
    structuredClone(tree1)
  )
})

test("Get subtree based on value that doesn't exist", () => {
  expect(getSubtreeByValue(tree1, { prop: "id", value: 2 })).toBe(null)
})