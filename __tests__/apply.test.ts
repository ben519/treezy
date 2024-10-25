import { apply } from "../src/apply"
import { Node } from "../src/types"
import { tree1, tree2, tree5 } from "./trees"

test("apply function to the entire tree", () => {
  const tree1Copy = structuredClone(tree1)
  const tree2Copy = structuredClone(tree2)
  const tree5Copy = structuredClone(tree5)

  expect(apply(tree1Copy, { applyFn: (x) => x.foo = "yo" }))
    .toEqual({ id: 1, foo: "yo", children: [] })

  expect(apply(tree2Copy, { applyFn: (x) => x.foo = "yo" }))
    .toEqual({
      id: 1,
      foo: "yo",
      children: [
        { id: 2, foo: "yo", children: [] },
        { id: 3, foo: "yo", children: [] },
      ],
    })

  expect(apply(tree5Copy, { applyFn: (x) => x.foo = "yo" }))
    .toEqual({
      id: 1,
      foo: "yo",
      children: [
        {
          id: 2,
          foo: "yo",
          children: [
            { id: 6, foo: "yo", children: [] },
            { id: 7, foo: "yo", children: [] },
          ],
        },
        {
          id: 3,
          foo: "yo",
          children: [
            { id: 8, foo: "yo", children: [] }
          ]
        },
        {
          id: 4,
          foo: "yo",
          children: [
            { id: 9, foo: "yo", children: [] },
            {
              id: 10,
              foo: "yo",
              children: [{ id: 11, foo: "yo", children: [] }]
            },
          ],
        },
      ],
    })

  expect(tree1Copy).toEqual(tree1)
  expect(tree2Copy).toEqual(tree2)
  expect(tree5Copy).toEqual(tree5)
})


test("Use apply() to insert a descriptive path to each tree", () => {
  const tree1Copy = structuredClone(tree1)
  const tree2Copy = structuredClone(tree2)
  const tree5Copy = structuredClone(tree5)

  const makePath = (x: Node, p?: Node | null, d?: number): string => {
    return x.path = p?.path ? p.path + " > " + x.id : "" + x.id
  }

  expect(apply(tree1Copy, { applyFn: makePath }))
    .toEqual({ id: 1, path: "1", children: [] })

  expect(apply(tree2Copy, { applyFn: makePath }))
    .toEqual({
      id: 1,
      path: "1",
      children: [
        { id: 2, path: "1 > 2", children: [] },
        { id: 3, path: "1 > 3", children: [] },
      ],
    })

  expect(apply(tree5Copy, { applyFn: makePath }))
    .toEqual({
      id: 1,
      path: "1",
      children: [
        {
          id: 2,
          path: "1 > 2",
          children: [
            { id: 6, path: "1 > 2 > 6", children: [] },
            { id: 7, path: "1 > 2 > 7", children: [] },
          ],
        },
        {
          id: 3,
          path: "1 > 3",
          children: [
            { id: 8, path: "1 > 3 > 8", children: [] }
          ]
        },
        {
          id: 4,
          path: "1 > 4",
          children: [
            { id: 9, path: "1 > 4 > 9", children: [] },
            {
              id: 10,
              path: "1 > 4 > 10",
              children: [{ id: 11, path: "1 > 4 > 10 > 11", children: [] }]
            },
          ],
        },
      ],
    })

  expect(tree1Copy).toEqual(tree1)
  expect(tree2Copy).toEqual(tree2)
  expect(tree5Copy).toEqual(tree5)
})

test("apply function to matching nodes, but there are no matches", () => {
  const tree1Copy = structuredClone(tree1)

  expect(apply(tree1Copy, { testFn: (x) => false, applyFn: (x) => x.foo = "yo", firstOnly: true }))
    .toEqual({ id: 1, children: [] })

  expect(tree1Copy).toEqual(tree1)
})

test("apply to the first matching node", () => {
  const tree1Copy = structuredClone(tree1)

  expect(apply(tree1Copy, { testFn: (x) => x.id === 1, applyFn: (x) => x.foo = "yo" }))
    .toEqual({ id: 1, foo: "yo", children: [] })

  expect(tree1Copy).toEqual(tree1)
})