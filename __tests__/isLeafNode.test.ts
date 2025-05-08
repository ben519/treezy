import { isLeafNode } from "../src/isLeafNode"
import { isNode } from "../src/isNode"
import { isNodeLeafNode } from "../src/isNodeLeafNode"
import { LeafNode, Node } from "../src/types"

describe("isNode function", () => {
  test("should return false for null and non-object values", () => {
    const options = { childrenKey: "children" }

    expect(isNode(null, options)).toBe(false)
    expect(isNode(undefined, options)).toBe(false)
    expect(isNode(123, options)).toBe(false)
    expect(isNode("string", options)).toBe(false)
    expect(isNode(true, options)).toBe(false)
    expect(isNode(false, options)).toBe(false)
    expect(isNode(() => {}, options)).toBe(false)
  })

  test("should return true for objects without children property", () => {
    const node = { id: 1 }
    const options = { childrenKey: "children" }

    expect(isNode(node, options)).toBe(true)
  })

  test("should return false if children property exists but is not an array", () => {
    const invalidNode = { id: 1, children: "not an array" }
    const options = { childrenKey: "children" }

    expect(isNode(invalidNode, options)).toBe(false)
  })

  test("should return true for objects with empty children array", () => {
    const leafNode = { id: 1, children: [] }
    const options = { childrenKey: "children" }

    expect(isNode(leafNode, options)).toBe(true)
  })

  test("should return true for valid nested node structures", () => {
    const nestedNode = {
      id: 1,
      children: [
        { id: 2, children: [] },
        { id: 3, children: [{ id: 4 }] },
      ],
    }
    const options = { childrenKey: "children" }

    expect(isNode(nestedNode, options)).toBe(true)
  })

  test("should return false if any child is not a valid node", () => {
    const invalidNestedNode = {
      id: 1,
      children: [
        { id: 2, children: [] },
        { id: 3, children: "invalid" }, // This child has invalid children
      ],
    }
    const options = { childrenKey: "children" }

    expect(isNode(invalidNestedNode, options)).toBe(false)
  })

  test("should work with custom children key", () => {
    const node = { id: 1, items: [] }
    const options = { childrenKey: "items" }

    expect(isNode(node, options)).toBe(true)

    const nestedNode = {
      id: 1,
      items: [{ id: 2, items: [] }],
    }

    expect(isNode(nestedNode, options)).toBe(true)

    const invalidNode = { id: 1, items: "not an array" }
    expect(isNode(invalidNode, options)).toBe(false)
  })
})

describe("isNodeLeafNode function", () => {
  test("should return true for nodes without children property", () => {
    const node = { id: 1, children: [] }
    const options = { childrenKey: "children" } as const

    isNodeLeafNode(node, options)
    expect(isNodeLeafNode(node, options)).toBe(true)
  })

  test("should return true for nodes with empty children array", () => {
    const node: Node<"children"> = { id: 1, children: [] }
    const options = { childrenKey: "children" } as const

    expect(isNodeLeafNode(node, options)).toBe(true)
  })

  test("should return false for nodes with non-empty children array", () => {
    const node: Node<"children"> = {
      id: 1,
      children: [{ id: 2 }],
    }
    const options = { childrenKey: "children" } as const

    expect(isNodeLeafNode(node, options)).toBe(false)
  })

  test("should work with custom children key", () => {
    const emptyNode: Node<"children"> = { id: 1, items: [] }
    const noItemsNode: Node<"children"> = { id: 1 }
    const nonLeafNode: Node<"children"> = { id: 1, items: [{ id: 2 }] }
    const options = { childrenKey: "items" } as const

    expect(isNodeLeafNode(emptyNode, options)).toBe(true)
    expect(isNodeLeafNode(noItemsNode, options)).toBe(true)
    expect(isNodeLeafNode(nonLeafNode, options)).toBe(false)
  })
})

describe("isLeafNode function", () => {
  test("should return false for null and non-object values", () => {
    const options = { childrenKey: "children" }

    expect(isLeafNode(null, options)).toBe(false)
    expect(isLeafNode(undefined, options)).toBe(false)
    expect(isLeafNode(123, options)).toBe(false)
    expect(isLeafNode("string", options)).toBe(false)
    expect(isLeafNode(true, options)).toBe(false)
  })

  test("should return true for nodes without children property", () => {
    const node = { id: 1 }
    const options = { childrenKey: "children" }

    expect(isLeafNode(node, options)).toBe(true)
  })

  test("should return true for nodes with empty children array", () => {
    const node = { id: 1, children: [] }
    const options = { childrenKey: "children" }

    expect(isLeafNode(node, options)).toBe(true)
  })

  test("should return false for nodes with non-empty children array", () => {
    const node = {
      id: 1,
      children: [{ id: 2 }],
    }
    const options = { childrenKey: "children" }

    expect(isLeafNode(node, options)).toBe(false)
  })

  test("should return false if children property exists but is not an array", () => {
    const invalidNode = { id: 1, children: "not an array" }
    const options = { childrenKey: "children" }

    expect(isLeafNode(invalidNode, options)).toBe(false)
  })

  test("should work with custom children key", () => {
    const leafNode = { id: 1, items: [] }
    const nonLeafNode = { id: 1, items: [{ id: 2 }] }
    const invalidNode = { id: 1, items: "not an array" }
    const options = { childrenKey: "items" }

    expect(isLeafNode(leafNode, options)).toBe(true)
    expect(isLeafNode(nonLeafNode, options)).toBe(false)
    expect(isLeafNode(invalidNode, options)).toBe(false)
  })

  test("should handle complex nested structures correctly", () => {
    const options = { childrenKey: "children" }

    // A parent node with leaf and non-leaf children
    const complexNode = {
      id: "root",
      children: [
        { id: "leaf1" }, // Leaf (no children property)
        { id: "leaf2", children: [] }, // Leaf (empty children)
        {
          id: "branch",
          children: [{ id: "leaf3" }], // Non-leaf
        },
      ],
    }

    // The root node is not a leaf
    expect(isLeafNode(complexNode, options)).toBe(false)

    // Test individual children
    expect(isLeafNode(complexNode.children[0], options)).toBe(true) // leaf1
    expect(isLeafNode(complexNode.children[1], options)).toBe(true) // leaf2
    expect(isLeafNode(complexNode.children[2], options)).toBe(false) // branch

    // Test deeply nested leaf
    const leaf3 = complexNode.children[2].children![0]
    expect(isLeafNode(leaf3, options)).toBe(true)
  })
})

// Tests for TypeScript type assertions
// These tests won't actually run, but they validate the type guards at compile time
function typeAssertionTests() {
  const options = { childrenKey: "children" as const }

  const someValue: unknown = { id: 1, children: [] }

  if (isNode(someValue, options)) {
    // TypeScript should know someValue is a Node<'children'> here
    const typedNode: Node<"children"> = someValue // Should compile

    if (isLeafNode(someValue, options)) {
      // TypeScript should know someValue is a LeafNode<'children'> here
      const typedLeafNode: LeafNode<"children"> = someValue // Should compile

      // This should be safe with optional chaining
      const optionalChildrenLength = typedLeafNode.children?.length

      // We know this is a leaf node, so children should be undefined or empty
      if (typedLeafNode.children) {
        const emptyLength = typedLeafNode.children.length // Should be 0
      }
    }
  }

  // Test with custom children key
  const customOptions = { childrenKey: "items" as const }
  const customValue: unknown = { id: 1, items: [] }

  if (isNode(customValue, customOptions)) {
    const typedNode: Node<"items"> = customValue // Should compile

    if (isLeafNode(customValue, customOptions)) {
      const typedLeafNode: LeafNode<"items"> = customValue // Should compile
      const optionalItemsLength = typedLeafNode.items?.length
    }
  }
}
