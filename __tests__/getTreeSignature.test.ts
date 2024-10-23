import { getTreeSignature } from "../src/getTreeSignature"
import { tree1, tree2, tree3, tree4, tree5, tree6 } from "./trees"

test("Confirm tree signature is correct", () => {
  expect(getTreeSignature(tree1, { idProp: "id" })).toBe("1")
  expect(getTreeSignature(tree2, { idProp: "id" })).toBe("1[2,3]")
  expect(getTreeSignature(tree3, { idProp: "id" })).toBe("1[3]")
  expect(getTreeSignature(tree4, { idProp: "id" })).toBe("1[2,3[4]]")
  expect(getTreeSignature(tree5, { idProp: "id" })).toBe("1[2[6,7],3[8],4[9,10[11]]]")
  expect(getTreeSignature(tree6, { idProp: "id" })).toBe("1[2[3[6,7],4[8]],5[9[10,11[12]],13]]")
})
