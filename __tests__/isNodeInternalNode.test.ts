import { isNodeInternalNode } from "../src/isNodeInternalNode"
import { Node } from "../src/types"

describe("isNodeInternalNode", () => {
  // Test with 'children' as the childrenKey
  describe('with "children" as childrenKey', () => {
    const options = { childrenKey: "children" as const }

    it("should return true for a node with non-empty children array", () => {
      // Define a node with children
      const node: Node<"children"> = {
        id: 1,
        name: "Parent",
        children: [
          { id: 2, name: "Child 1" },
          { id: 3, name: "Child 2" },
        ],
      }

      expect(isNodeInternalNode(node, options)).toBe(true)
    })

    it("should return false for a node with empty children array", () => {
      const node: Node<"children"> = {
        id: 1,
        name: "Leaf",
        children: [],
      }

      expect(isNodeInternalNode(node, options)).toBe(false)
    })

    it("should return false for a leaf node (without children property)", () => {
      const node: Node<"children"> = {
        id: 1,
        name: "Leaf",
      }

      expect(isNodeInternalNode(node, options)).toBe(false)
    })

    it("should return false when children is not an array", () => {
      // This is a type violation in TypeScript, but we should test for it in case of runtime issues
      const node = {
        id: 1,
        name: "Invalid",
        children: "not an array",
      } as unknown as Node<"children">

      expect(isNodeInternalNode(node, options)).toBe(false)
    })
  })

  // Test with a custom childrenKey
  describe("with custom childrenKey", () => {
    const options = { childrenKey: "items" as const }

    it("should return true for a node with non-empty items array", () => {
      const node: Node<"items"> = {
        id: 1,
        name: "Parent",
        items: [
          { id: 2, name: "Item 1" },
          { id: 3, name: "Item 2" },
        ],
      }

      expect(isNodeInternalNode(node, options)).toBe(true)
    })

    it("should return false for a node with empty items array", () => {
      const node: Node<"items"> = {
        id: 1,
        name: "Empty Parent",
        items: [],
      }

      expect(isNodeInternalNode(node, options)).toBe(false)
    })
  })

  // Test with nodes having complex structure
  describe("with complex node structure", () => {
    const options = { childrenKey: "subNodes" as const }

    it("should return true for a complex internal node", () => {
      interface ComplexNodeProps {
        id: number
        data: {
          name: string
          attributes?: Record<string, string>
        }
        metadata?: unknown
      }

      const node: Node<"subNodes", ComplexNodeProps> = {
        id: 1,
        data: {
          name: "Complex Parent",
          attributes: {
            type: "container",
            visible: "true",
          },
        },
        metadata: { created: "2023-01-01" },
        subNodes: [
          {
            id: 2,
            data: { name: "Child 1" },
          },
        ],
      }

      expect(isNodeInternalNode(node, options)).toBe(true)
    })
  })

  // Test type narrowing (TypeScript functionality)
  describe("type narrowing behavior", () => {
    it("should allow access to children as non-optional when type is narrowed", () => {
      const options = { childrenKey: "children" as const }

      const node: Node<"children"> = {
        id: 1,
        name: "Parent",
        children: [{ id: 2, name: "Child" }],
      }

      if (isNodeInternalNode(node, options)) {
        // This test is more about TypeScript type checking than runtime behavior
        // If the type guard works, we should be able to access children without optional chaining
        expect(node.children.length).toBeGreaterThan(0)
        expect(node.children[0].id).toBe(2)
      } else {
        // This branch should not be reached in this test
        fail("Node was not correctly identified as an internal node")
      }
    })
  })

  // Edge cases
  describe("edge cases", () => {
    it("should handle undefined values in children array", () => {
      const options = { childrenKey: "children" as const }

      // This is technically a type violation, but we want to test runtime behavior
      const node = {
        id: 1,
        children: [undefined],
      } as unknown as Node<"children">

      // Even though there's an item (undefined) in the array, it should still be considered an internal node
      expect(isNodeInternalNode(node, options)).toBe(true)
    })

    it("should handle null values in children array", () => {
      const options = { childrenKey: "children" as const }

      // Again, a type violation but testing runtime behavior
      const node = {
        id: 1,
        children: [null],
      } as unknown as Node<"children">

      expect(isNodeInternalNode(node, options)).toBe(true)
    })
  })
})
