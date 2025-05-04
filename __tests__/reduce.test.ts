import { reduce } from "../src/reduce"
import { commentThread } from "./trees"

test("Confirm reduce works as expected", () => {
  expect(
    reduce<
      "children",
      { id: number; userId: number; comment: string; likes: number }
    >(commentThread, { reduceFn: (n, i) => n.likes + i, initialVal: 0 })
  ).toEqual(6)
})
