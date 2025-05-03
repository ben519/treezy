import { getValues } from "../src/getValues"
import { commentThread, tree1, tree7, tree8 } from "./trees"

test("Confirm getValues() is correct", () => {
  expect(
    getValues<"children", { color: string }>(tree7, { getFn: (x) => x.color })
  ).toStrictEqual(["red"])

  expect(
    getValues(tree8, { getFn: (x) => ("color" in x ? x.color : undefined) })
  ).toStrictEqual(["red", "green", "red"])

  expect(
    getValues(commentThread, { getFn: (x) => ("id" in x ? x.id : undefined) })
  ).toStrictEqual([234424, 248210, 211104, 248210])
})

test("Confirm getValues() can be used to fetch nodes", () => {
  const tree1Copy = structuredClone(tree1)

  expect(getValues(tree1Copy, { getFn: (x) => x })).toEqual([
    { id: 1, children: [] },
  ])
})
