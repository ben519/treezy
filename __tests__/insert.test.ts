import { insert } from "../src/insert"
import { tree1 } from "./trees"

test("Confirm insert() inserts correctly", () => {
  expect(insert(
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