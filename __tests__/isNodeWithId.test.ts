import { isNodeWithId } from "../src/isNodeWithId"

describe("isNodeWithId", () => {
  const options = {
    childrenKey: "children",
    idKey: "id",
  }

  const optionsWithCircularCheck = {
    childrenKey: "children",
    idKey: "id",
    checkForCircularReference: true,
  }

  const optionsWithoutCircularCheck = {
    childrenKey: "children",
    idKey: "id",
    checkForCircularReference: false,
  }

  test("returns false for non-object values", () => {
    expect(isNodeWithId(null, options)).toBe(false)
    expect(isNodeWithId(undefined, options)).toBe(false)
    expect(isNodeWithId("string", options)).toBe(false)
    expect(isNodeWithId(123, options)).toBe(false)
    expect(isNodeWithId(true, options)).toBe(false)
  })

  test("returns false if id property is missing", () => {
    const nodeWithoutId = {
      name: "Node Without ID",
      children: [],
    }
    expect(isNodeWithId(nodeWithoutId, options)).toBe(false)
  })

  test("returns true for a simple valid node with no children", () => {
    const simpleNode = {
      id: "node1",
      name: "Simple Node",
    }
    expect(isNodeWithId(simpleNode, options)).toBe(true)
  })

  test("returns false if children property exists but is not an array", () => {
    const invalidNode = {
      id: "node1",
      name: "Invalid Node",
      children: "not an array",
    }
    expect(isNodeWithId(invalidNode, options)).toBe(false)
  })

  test("returns true for a node with empty children array", () => {
    const nodeWithEmptyChildren = {
      id: "node1",
      name: "Node with Empty Children",
      children: [],
    }
    expect(isNodeWithId(nodeWithEmptyChildren, options)).toBe(true)
  })

  test("returns true for a node with valid children", () => {
    const nodeWithValidChildren = {
      id: "parent",
      name: "Parent Node",
      children: [
        { id: "child1", name: "Child 1" },
        { id: "child2", name: "Child 2" },
      ],
    }
    expect(isNodeWithId(nodeWithValidChildren, options)).toBe(true)
  })

  test("returns false if any child is invalid", () => {
    const nodeWithInvalidChild = {
      id: "parent",
      name: "Parent Node",
      children: [
        { id: "child1", name: "Valid Child" },
        { name: "Invalid Child" }, // missing id
      ],
    }
    expect(isNodeWithId(nodeWithInvalidChild, options)).toBe(false)
  })

  test("validates deeply nested children", () => {
    const deeplyNestedNode = {
      id: "root",
      name: "Root Node",
      children: [
        {
          id: "level1",
          name: "Level 1",
          children: [
            {
              id: "level2",
              name: "Level 2",
              children: [{ id: "leaf", name: "Leaf Node" }],
            },
          ],
        },
      ],
    }
    expect(isNodeWithId(deeplyNestedNode, options)).toBe(true)

    // Make a deep child invalid
    const invalidDeeplyNestedNode = {
      id: "root",
      name: "Root Node",
      children: [
        {
          id: "level1",
          name: "Level 1",
          children: [
            {
              id: "level2",
              name: "Level 2",
              children: [
                { name: "Invalid Leaf Node" }, // missing id
              ],
            },
          ],
        },
      ],
    }
    expect(isNodeWithId(invalidDeeplyNestedNode, options)).toBe(false)
  })

  test("works with different childrenKey and idKey values", () => {
    const customOptions = {
      childrenKey: "items",
      idKey: "uuid",
    }

    const validCustomNode = {
      uuid: "node1",
      name: "Custom Node",
      items: [
        { uuid: "item1", name: "Item 1" },
        { uuid: "item2", name: "Item 2" },
      ],
    }
    expect(isNodeWithId(validCustomNode, customOptions)).toBe(true)

    const invalidCustomNode = {
      uuid: "node1",
      name: "Custom Node",
      items: [
        { uuid: "item1", name: "Item 1" },
        { id: "item2", name: "Item 2" }, // has id instead of uuid
      ],
    }
    expect(isNodeWithId(invalidCustomNode, customOptions)).toBe(false)
  })

  test("works with number ids", () => {
    const nodeWithNumberId = {
      id: 123,
      name: "Node with Number ID",
      children: [{ id: 456, name: "Child with Number ID" }],
    }
    expect(isNodeWithId(nodeWithNumberId, options)).toBe(true)
  })

  test("works with symbol ids", () => {
    const sym1 = Symbol("parent")
    const sym2 = Symbol("child")

    const nodeWithSymbolId = {
      id: sym1,
      name: "Node with Symbol ID",
      children: [{ id: sym2, name: "Child with Symbol ID" }],
    }
    expect(isNodeWithId(nodeWithSymbolId, options)).toBe(true)
  })

  test("works with extra properties", () => {
    const nodeWithExtraProps = {
      id: "node1",
      name: "Node with Extra Props",
      value: 42,
      extra1: true,
      extra2: "something",
      children: [
        {
          id: "child1",
          name: "Child",
          customProp: [1, 2, 3],
        },
      ],
    }
    expect(isNodeWithId(nodeWithExtraProps, options)).toBe(true)
  })

  test("detects circular references and throws error with checkForCircularReference = true", () => {
    const a: any = { id: "a" }
    const b: any = { id: "b", children: [a] }
    a.children = [b] // Circular reference

    expect(() => isNodeWithId(a, optionsWithCircularCheck)).toThrow(
      "Circular reference detected in tree."
    )
  })

  // test("does not throw for circular references with checkForCircularReference = false", () => {
  //   const a: any = { id: "a" }
  //   const b: any = { id: "b", children: [a] }
  //   a.children = [b] // Circular reference

  //   expect(isNodeWithId(a, optionsWithoutCircularCheck)).toBe(true)
  // })
})
