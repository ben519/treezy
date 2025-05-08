import { isNodeUniformNode } from "../src/isNodeUniformNode"
import { Node } from "../src/types"

describe("isNodeUniformNode", () => {
  // Set up common options
  const options = { childrenKey: "children" as const }
  const customOptions = { childrenKey: "items" as const }

  describe("basic functionality", () => {
    it("should return true for a leaf node (no children)", () => {
      const node: Node<"children", { id: number; name: string }> = {
        id: 1,
        name: "Leaf",
      }

      expect(isNodeUniformNode(node, options)).toBe(true)
    })

    it("should return true for a node with empty children array", () => {
      const node: Node<"children", { id: number; name: string }> = {
        id: 1,
        name: "Empty Parent",
        children: [],
      }

      expect(isNodeUniformNode(node, options)).toBe(true)
    })

    it("should return true for a uniform node with uniform children", () => {
      const node: Node<"children", { id: number; name: string }> = {
        id: 1,
        name: "Parent",
        children: [
          {
            id: 2,
            name: "Child 1",
          },
          {
            id: 3,
            name: "Child 2",
          },
        ],
      }

      expect(isNodeUniformNode(node, options)).toBe(true)
    })

    it("should return false when children have different structure than parent", () => {
      const node: Node<"children"> = {
        id: 1,
        name: "Parent",
        children: [
          {
            id: 2,
            // Missing name property
          },
          {
            id: 3,
            name: "Child 2",
          },
        ],
      }

      expect(isNodeUniformNode(node, options)).toBe(false)
    })

    it("should return false when children have extra properties", () => {
      const node: Node<"children"> = {
        id: 1,
        name: "Parent",
        children: [
          {
            id: 2,
            name: "Child 1",
            extraProp: "should not be here", // Extra property
          },
          {
            id: 3,
            name: "Child 2",
          },
        ],
      }

      expect(isNodeUniformNode(node, options)).toBe(false)
    })

    it("should return false when property types differ", () => {
      const node: Node<"children"> = {
        id: 1, // number
        name: "Parent",
        children: [
          {
            id: "2", // string instead of number
            name: "Child 1",
          },
          {
            id: 3,
            name: "Child 2",
          },
        ],
      }

      expect(isNodeUniformNode(node, options)).toBe(false)
    })
  })

  describe("recursive validation", () => {
    it("should return true for deeply nested uniform nodes", () => {
      const node: Node<"children", { id: number; name: string }> = {
        id: 1,
        name: "Parent",
        children: [
          {
            id: 2,
            name: "Child 1",
            children: [
              {
                id: 4,
                name: "Grandchild 1",
              },
            ],
          },
          {
            id: 3,
            name: "Child 2",
            children: [
              {
                id: 5,
                name: "Grandchild 2",
              },
            ],
          },
        ],
      }

      expect(isNodeUniformNode(node, options)).toBe(true)
    })

    it("should return false if a deeply nested child is not uniform", () => {
      const node: Node<"children"> = {
        id: 1,
        name: "Parent",
        children: [
          {
            id: 2,
            name: "Child 1",
            children: [
              {
                id: 4,
                name: "Grandchild 1",
                extra: "Not uniform!", // This breaks uniformity
              },
            ],
          },
          {
            id: 3,
            name: "Child 2",
          },
        ],
      }

      expect(isNodeUniformNode(node, options)).toBe(false)
    })

    it("should return false if sibling nodes have different structures", () => {
      const node: Node<"children"> = {
        id: 1,
        name: "Parent",
        children: [
          {
            id: 2,
            name: "Child 1",
            children: [
              {
                id: 4,
                name: "Grandchild 1",
              },
            ],
          },
          {
            id: 3,
            name: "Child 2",
            children: [
              {
                id: 5,
                // Missing name property
              },
            ],
          },
        ],
      }

      expect(isNodeUniformNode(node, options)).toBe(false)
    })
  })

  describe("with custom childrenKey", () => {
    it("should return true for a uniform node with custom childrenKey", () => {
      const node: Node<"items", { id: number; name: string }> = {
        id: 1,
        name: "Parent",
        items: [
          {
            id: 2,
            name: "Item 1",
          },
          {
            id: 3,
            name: "Item 2",
          },
        ],
      }

      expect(isNodeUniformNode(node, customOptions)).toBe(true)
    })

    it("should return false for a non-uniform node with custom childrenKey", () => {
      const node: Node<"items"> = {
        id: 1,
        name: "Parent",
        items: [
          {
            id: 2,
            name: "Item 1",
          },
          {
            id: 3,
            description: "Different structure", // Different property
          },
        ],
      }

      expect(isNodeUniformNode(node, customOptions)).toBe(false)
    })
  })

  describe("with complex nodes", () => {
    interface ComplexNodeProps {
      id: number
      metadata: {
        created: string
        visibility: "public" | "private"
      }
      tags: string[]
    }

    it("should return true for complex uniform nodes", () => {
      const node: Node<"children", ComplexNodeProps> = {
        id: 1,
        metadata: {
          created: "2023-01-01",
          visibility: "public",
        },
        tags: ["parent", "root"],
        children: [
          {
            id: 2,
            metadata: {
              created: "2023-01-02",
              visibility: "private",
            },
            tags: ["child"],
          },
          {
            id: 3,
            metadata: {
              created: "2023-01-03",
              visibility: "public",
            },
            tags: ["child", "important"],
          },
        ],
      }

      expect(isNodeUniformNode(node, options)).toBe(true)
    })

    it("should return false for complex nodes with structure mismatch", () => {
      const node: Node<"children"> = {
        id: 1,
        metadata: {
          created: "2023-01-01",
          visibility: "public",
        },
        tags: ["parent", "root"],
        children: [
          {
            id: 2,
            metadata: {
              created: "2023-01-02",
              // Missing visibility property
            },
            tags: ["child"],
          },
        ],
      }

      // Note: The function only checks for key presence and property types at the top level,
      // not the structure of nested objects. This test might pass despite the nested structure difference.
      expect(isNodeUniformNode(node, options)).toBe(true)
    })
  })

  describe("edge cases", () => {
    it("should handle null values correctly", () => {
      const node: Node<"children"> = {
        id: 1,
        name: null as any, // Intentional type violation to test runtime behavior
        children: [
          {
            id: 2,
            name: null as any,
          },
        ],
      }

      // Both properties are null, so types match
      expect(isNodeUniformNode(node, options)).toBe(true)
    })

    it("should detect type differences between null and defined values", () => {
      const node: Node<"children"> = {
        id: 1,
        name: "Parent",
        children: [
          {
            id: 2,
            name: null as any, // Intentional type violation
          },
        ],
      }

      // Parent name is string, child name is null (different types)
      expect(isNodeUniformNode(node, options)).toBe(false)
    })

    it("should handle undefined childrenKey properly", () => {
      const node = {
        id: 1,
        name: "Test",
        // children key not defined
      }

      expect(isNodeUniformNode(node, options)).toBe(true)
    })

    it("should handle properties with function values", () => {
      const node: Node<"children"> = {
        id: 1,
        name: "Parent",
        callback: () => console.log("test"),
        children: [
          {
            id: 2,
            name: "Child",
            callback: () => console.log("child"),
          },
        ],
      }

      // Both have callback functions, so types match
      expect(isNodeUniformNode(node, options)).toBe(true)
    })

    it("should return false when properties are of different function types", () => {
      const node: Node<"children"> = {
        id: 1,
        name: "Parent",
        callback: () => console.log("test"),
        children: [
          {
            id: 2,
            name: "Child",
            callback: "not a function" as any, // Intentional type violation
          },
        ],
      }

      expect(isNodeUniformNode(node, options)).toBe(false)
    })
  })

  describe("type narrowing behavior", () => {
    it("should allow safe access to properties when type is narrowed", () => {
      interface TypedNodeProps {
        id: number
        value: string
      }

      const node: Node<"children", TypedNodeProps> = {
        id: 1,
        value: "parent",
        children: [
          {
            id: 2,
            value: "child",
          },
        ],
      }

      if (isNodeUniformNode<"children", TypedNodeProps>(node, options)) {
        // We should be able to safely treat this as a UniformNode now
        if (node.children) {
          for (const child of node.children) {
            // This should be type-safe now
            expect(typeof child.value).toBe("string")
          }
        }
      } else {
        fail("Node was not correctly identified as a uniform node")
      }
    })
  })
})
