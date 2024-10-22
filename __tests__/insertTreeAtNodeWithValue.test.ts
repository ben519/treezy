import { insertTreeAtNodeWithValue } from "../src/insertTreeAtNodeWithValue"
import { tree1 } from "./trees"

test("Confirm insertTreeAtNodeWithValue() inserts correctly", () => {
  expect(insertTreeAtNodeWithValue(
    tree1,
    tree1,
    { prop: "id", value: 1, direction: "below" })
  ).toStrictEqual(
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