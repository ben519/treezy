import { getNodes } from "../src/getNodes"
import { tree1 } from "./trees"

test("Confirm getNodes() is correct", () => {
  expect(getNodes(tree1)).toEqual([{ id: 1, children: [] }])

  // expect(getNodes(tree2)).toEqual(
  //   [{ id: 1 }, { id: 2 }, { id: 3 }]
  // )

  // expect(getNodes(tree3)).toEqual(
  //   [{ id: 1 }, { id: 3 }]
  // )

  // expect(getNodes(tree4)).toEqual(
  //   [
  //     { id: 1 },
  //     { id: 2 },
  //     { id: 3 },
  //     { id: 4 },
  //   ]
  // )

  // expect(getNodes(tree5)).toEqual(
  //   [
  //     { id: 1 },
  //     { id: 2 },
  //     { id: 6 },
  //     { id: 7 },
  //     { id: 3 },
  //     { id: 8 },
  //     { id: 4 },
  //     { id: 9 },
  //     { id: 10 },
  //     { id: 11 },
  //   ]
  // )

  // expect(getNodes(tree6)).toEqual(
  //   [
  //     { id: 1 },
  //     { id: 2 },
  //     { id: 3 },
  //     { id: 6 },
  //     { id: 7 },
  //     { id: 4 },
  //     { id: 8 },
  //     { id: 5 },
  //     { id: 9 },
  //     { id: 10 },
  //     { id: 11 },
  //     { id: 12 },
  //     { id: 13 },
  //   ]
  // )

})


// test("Confirm getNodes() can correctly fetch ancestors", () => {
//   const tree1Copy = structuredClone(tree1)

//   expect(getNodes(tree1Copy, { testFn: (x) => x.id === 1, filter: "ancestors", firstOnly: true }))
//     .toEqual([])
// })


// test("Confirm getNodes() can correctly fetch descendants", () => {
//   const tree1Copy = structuredClone(tree1)

//   expect(getNodes(tree1Copy, { testFn: (x) => x.id === 1, filter: "descendants", firstOnly: true }))
//     .toEqual([])
// })
