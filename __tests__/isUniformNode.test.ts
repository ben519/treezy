import { isUniformNode } from "../src/isUniformNode"

describe("isUniformNode", () => {
  it("should identify a valid node with no children as a uniform node", () => {
    const node = { type: "div", className: "container" }
    const options = { childrenKey: "children" }

    expect(isUniformNode(node, options)).toBe(true)
  })

  it("should identify a valid node with empty children array as a uniform node", () => {
    const node = { type: "div", className: "container", children: [] }
    const options = { childrenKey: "children" }

    expect(isUniformNode(node, options)).toBe(true)
  })

  it("should identify a node with uniform children as a uniform node", () => {
    const node = {
      type: "div",
      className: "container",
      children: [
        { type: "div", className: "item" },
        { type: "div", className: "item", children: [] },
      ],
    }
    const options = { childrenKey: "children" }

    expect(isUniformNode(node, options)).toBe(true)
  })

  it("should reject a node with children having different properties", () => {
    const node = {
      type: "div",
      className: "container",
      children: [
        { type: "div", className: "item" },
        { type: "div", style: "color: red" }, // Different property than parent
      ],
    }
    const options = { childrenKey: "children" }

    expect(isUniformNode(node, options)).toBe(false)
  })

  it("should reject a node with children having different property types", () => {
    const node = {
      type: "div",
      count: 1, // number type
      children: [
        { type: "div", count: "1" }, // string type, not uniform
      ],
    }
    const options = { childrenKey: "children" }

    expect(isUniformNode(node, options)).toBe(false)
  })

  it("should reject a node with children having additional properties", () => {
    const node = {
      type: "div",
      className: "container",
      children: [
        {
          type: "div",
          className: "item",
          extraProp: true, // Extra property not in parent
        },
      ],
    }
    const options = { childrenKey: "children" }

    expect(isUniformNode(node, options)).toBe(false)
  })

  it("should reject a node with children missing parent properties", () => {
    const node = {
      type: "div",
      className: "container",
      id: "main",
      children: [
        {
          type: "div",
          className: "item",
          // Missing id property from parent
        },
      ],
    }
    const options = { childrenKey: "children" }

    expect(isUniformNode(node, options)).toBe(false)
  })

  it("should handle deeply nested uniform nodes correctly", () => {
    const node = {
      type: "div",
      className: "level1",
      children: [
        {
          type: "div",
          className: "level2",
          children: [
            {
              type: "div",
              className: "level3",
            },
          ],
        },
      ],
    }
    const options = { childrenKey: "children" }

    expect(isUniformNode(node, options)).toBe(true)
  })

  it("should reject nodes with non-uniform nested children", () => {
    const node = {
      type: "div",
      className: "level1",
      children: [
        {
          type: "div",
          className: "level2",
          children: [
            {
              type: "div",
              id: "different", // Different property structure
            },
          ],
        },
      ],
    }
    const options = { childrenKey: "children" }

    expect(isUniformNode(node, options)).toBe(false)
  })

  it("should work with a custom children key", () => {
    const node = {
      type: "div",
      className: "container",
      items: [
        { type: "div", className: "item" },
        { type: "div", className: "item" },
      ],
    }
    const options = { childrenKey: "items" }

    expect(isUniformNode(node, options)).toBe(true)
  })

  it("should handle null or undefined inputs correctly", () => {
    expect(isUniformNode(null, { childrenKey: "children" })).toBe(false)
    expect(isUniformNode(undefined, { childrenKey: "children" })).toBe(false)
  })

  it("should handle non-object inputs correctly", () => {
    expect(isUniformNode("string", { childrenKey: "children" })).toBe(false)
    expect(isUniformNode(123, { childrenKey: "children" })).toBe(false)
    expect(isUniformNode(true, { childrenKey: "children" })).toBe(false)
  })

  it("should reject nodes with non-array children", () => {
    const node = {
      type: "div",
      children: "not an array", // Not an array
    }
    const options = { childrenKey: "children" }

    expect(isUniformNode(node, options)).toBe(false)
  })

  // Type checking test (run-time simulation)
  it("should properly narrow types when used in a type guard pattern", () => {
    const testValue: unknown = {
      type: "div",
      className: "container",
      children: [],
    }
    const options = { childrenKey: "children" as const }

    if (
      isUniformNode<
        typeof options.childrenKey,
        { type: string; className: string }
      >(testValue, options)
    ) {
      // Inside this block, testValue should be treated as a UniformNode
      // We can verify this by accessing the properties we expect to be there
      expect(testValue.type).toBe("div")
      expect(testValue.className).toBe("container")
      expect(Array.isArray(testValue.children)).toBe(true)
    } else {
      // If we get here, the test should fail
      fail("isUniformNode should have returned true for this valid node")
    }
  })
})

// Additional complex test cases
describe("isUniformNode complex scenarios", () => {
  it("should handle empty objects correctly", () => {
    const emptyNode = {}
    const options = { childrenKey: "children" }

    // An empty object is a valid node with no children
    expect(isUniformNode(emptyNode, options)).toBe(true)
  })

  it("should correctly process nodes with boolean properties", () => {
    const node = {
      type: "div",
      visible: true,
      children: [
        { type: "div", visible: false },
        { type: "div", visible: true },
      ],
    }
    const options = { childrenKey: "children" }

    expect(isUniformNode(node, options)).toBe(true)
  })

  it("should correctly process nodes with number properties", () => {
    const node = {
      type: "div",
      order: 1,
      children: [
        { type: "div", order: 2 },
        { type: "div", order: 3 },
      ],
    }
    const options = { childrenKey: "children" }

    expect(isUniformNode(node, options)).toBe(true)
  })

  it("should handle nodes with mixed property types correctly", () => {
    const node = {
      type: "div",
      id: "main", // string
      active: true, // boolean
      count: 42, // number
      children: [
        {
          type: "div",
          id: "child1",
          active: false,
          count: 0,
        },
        {
          type: "div",
          id: "child2",
          active: true,
          count: 10,
          children: [],
        },
      ],
    }
    const options = { childrenKey: "children" }

    expect(isUniformNode(node, options)).toBe(true)
  })

  it("should reject nodes with same property names but different types", () => {
    const node = {
      type: "div",
      data: { key: "value" }, // object
      children: [
        {
          type: "div",
          data: "string value", // string - different type
        },
      ],
    }
    const options = { childrenKey: "children" }

    expect(isUniformNode(node, options)).toBe(false)
  })

  it("should handle complex nested uniform structures", () => {
    const node = {
      id: "root",
      metadata: { created: "2023-01-01" },
      children: [
        {
          id: "branch-1",
          metadata: { created: "2023-01-02" },
          children: [
            {
              id: "leaf-1",
              metadata: { created: "2023-01-03" },
            },
          ],
        },
        {
          id: "branch-2",
          metadata: { created: "2023-01-04" },
          children: [],
        },
      ],
    }
    const options = { childrenKey: "children" }

    expect(isUniformNode(node, options)).toBe(true)
  })

  it("should handle siblings with different structures but each uniform within itself", () => {
    const node = {
      id: "root",
      children: [
        {
          // First branch has 'metadata' property
          id: "branch-1",
          metadata: { created: "2023-01-01" },
          children: [
            {
              id: "leaf-1",
              metadata: { created: "2023-01-02" },
            },
          ],
        },
        {
          // Second branch has 'order' property instead
          id: "branch-2",
          order: 1,
          children: [
            {
              id: "leaf-2",
              order: 2,
            },
          ],
        },
      ],
    }
    const options = { childrenKey: "children" }

    // This should be false because siblings have different structures
    expect(isUniformNode(node, options)).toBe(false)
  })
})
