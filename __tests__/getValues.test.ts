import { getValues } from "../src/getValues"
import { commentThread, tree7, tree8 } from "./trees"

test("Confirm getValues() is correct", () => {
  expect(getValues(tree7, { prop: "color" }))
    .toStrictEqual(["red"])

  expect(getValues(tree8, { prop: "color" }))
    .toStrictEqual(["red", "green", "red"])

  expect(getValues(commentThread, { prop: "id" }))
    .toStrictEqual([234424, 248210, 211104, 248210])
})
