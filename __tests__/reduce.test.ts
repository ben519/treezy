import { reduce } from "../src/reduce"
import { commentThread } from "./trees"

test("Confirm reduce works as expected", () => {
  expect(reduce(commentThread, { reduceFn: (n, i) => n.likes + i, initialVal: 0 }))
    .toEqual(6)
})