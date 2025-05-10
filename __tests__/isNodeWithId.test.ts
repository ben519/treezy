import { isNodeWithId } from "../src/isNodeWithId"

describe("isNodeWithId", () => {
  const options = {
    childrenKey: "children",
    idKey: "id",
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

  test("detects circular references and throws error", () => {
    const a: any = { id: "a" }
    const b: any = { id: "b", children: [a] }
    a.children = [b] // Circular reference

    expect(() => isNodeWithId(a, options)).toThrow(
      "Circular reference detected"
    )
  })

  describe("isNodeWithId circular reference detection", () => {
    const options = {
      childrenKey: "children",
      idKey: "id",
    }

    test("detects direct parent-child circular reference", () => {
      const parent: any = { id: "parent" }
      const child: any = { id: "child" }

      parent.children = [child]
      child.children = [parent] // Circular reference back to parent

      expect(() => isNodeWithId(parent, options)).toThrow(
        "Circular reference detected"
      )
    })

    test("detects self-referential circular reference", () => {
      const node: any = { id: "node" }
      node.children = [node] // Node references itself

      expect(() => isNodeWithId(node, options)).toThrow(
        "Circular reference detected"
      )
    })

    test("detects deep circular reference", () => {
      const a: any = { id: "a" }
      const b: any = { id: "b" }
      const c: any = { id: "c" }
      const d: any = { id: "d" }

      a.children = [b]
      b.children = [c]
      c.children = [d]
      d.children = [b] // Circular reference back to b

      expect(() => isNodeWithId(a, options)).toThrow(
        "Circular reference detected"
      )
    })

    test("detects circular reference with multiple children", () => {
      const parent: any = { id: "parent" }
      const child1: any = { id: "child1" }
      const child2: any = { id: "child2" }
      const grandchild: any = { id: "grandchild" }

      parent.children = [child1, child2]
      child1.children = [grandchild]
      grandchild.children = [parent] // Circular reference back to parent

      expect(() => isNodeWithId(parent, options)).toThrow(
        "Circular reference detected"
      )
    })

    test("detects circular reference with custom childrenKey", () => {
      const customOptions = {
        childrenKey: "items",
        idKey: "id",
      }

      const a: any = { id: "a" }
      const b: any = { id: "b" }

      a.items = [b]
      b.items = [a] // Circular reference

      expect(() => isNodeWithId(a, customOptions)).toThrow(
        "Circular reference detected"
      )
    })

    test("handles sidelink references without creating circular reference", () => {
      // This test verifies that nodes that share children but don't form a cycle are valid
      const shared: any = { id: "shared" }
      const parent1: any = { id: "parent1", children: [shared] }
      const parent2: any = { id: "parent2", children: [shared] }

      // This is not a circular reference - just two parents pointing to the same child
      expect(isNodeWithId(parent1, options)).toBe(true)
      expect(isNodeWithId(parent2, options)).toBe(true)
    })

    test("handles complex object with multiple circular references", () => {
      const a: any = { id: "a" }
      const b: any = { id: "b" }
      const c: any = { id: "c" }

      a.children = [b, c]
      b.children = [c]
      c.children = [a, b] // Multiple circular references

      expect(() => isNodeWithId(a, options)).toThrow(
        "Circular reference detected"
      )
    })

    test("handles deep trees without circular references correctly", () => {
      // This test verifies the function doesn't falsely detect circular references
      // in deeply nested but valid trees
      const deepTree = {
        id: "root",
        children: [
          {
            id: "l1-1",
            children: [
              { id: "l2-1", children: [{ id: "l3-1" }] },
              { id: "l2-2", children: [{ id: "l3-2" }] },
            ],
          },
          {
            id: "l1-2",
            children: [
              { id: "l2-3", children: [{ id: "l3-3" }] },
              { id: "l2-4", children: [{ id: "l3-4" }] },
            ],
          },
        ],
      }

      expect(isNodeWithId(deepTree, options)).toBe(true)
    })
  })
})
