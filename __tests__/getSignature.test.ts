import { getSignature } from "../src/getSignature"
import { tree1, tree2, tree3, tree4, tree5, tree6 } from "./trees"

test("Confirm tree signature is correct", () => {
  expect(getSignature(tree1, { idKey: "id" })).toBe("1")
  expect(getSignature(tree2, { idKey: "id" })).toBe("1[2,3]")
  expect(getSignature(tree3, { idKey: "id" })).toBe("1[3]")
  expect(getSignature(tree4, { idKey: "id" })).toBe("1[2,3[4]]")
  expect(getSignature(tree5, { idKey: "id" })).toBe(
    "1[2[6,7],3[8],4[9,10[11]]]"
  )
  expect(getSignature(tree6, { idKey: "id" })).toBe(
    "1[2[3[6,7],4[8]],5[9[10,11[12]],13]]"
  )
})
