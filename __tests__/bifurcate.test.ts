import { bifurcate } from "../src/bifurcate"
import { Node, UniformNode } from "../src/types"

describe("bifurcate function", () => {
  // Test with basic Node type
  describe("with generic Node type", () => {
    test("should return child when root node matches the test function", () => {
      const tree: Node<"children"> = {
        id: "root",
        children: [
          { id: "child1" },
          { id: "child2", children: [{ id: "grandchild1" }] },
        ],
      }

      const result = bifurcate(tree, {
        childrenKey: "children",
        testFn: (node) => node.id === "root",
      })

      expect(result.parent).toBeNull()
      expect(result.child).toEqual(tree)
    })

    test("should return child when child node matches the test function", () => {
      const tree: Node<"children"> = {
        id: "root",
        children: [
          { id: "child1" },
          { id: "child2", children: [{ id: "grandchild1" }] },
        ],
      }

      const result = bifurcate(tree, {
        childrenKey: "children",
        testFn: (node) => node.id === "child2",
      })

      expect(result.parent).toEqual({
        id: "root",
        children: [{ id: "child1" }],
      })
      expect(result.child).toEqual({
        id: "child2",
        children: [{ id: "grandchild1" }],
      })
    })

    test("should return child when grandchild node matches the test function", () => {
      const tree: Node<"children"> = {
        id: "root",
        children: [
          { id: "child1" },
          { id: "child2", children: [{ id: "grandchild1" }] },
        ],
      }

      const result = bifurcate(tree, {
        childrenKey: "children",
        testFn: (node) => node.id === "grandchild1",
      })

      expect(result.parent).toEqual({
        id: "root",
        children: [{ id: "child1" }, { id: "child2", children: [] }],
      })
      expect(result.child).toEqual({ id: "grandchild1" })
    })

    test("should return null child when no node matches the test function", () => {
      const tree: Node<"children"> = {
        id: "root",
        children: [
          { id: "child1" },
          { id: "child2", children: [{ id: "grandchild1" }] },
        ],
      }

      const result = bifurcate(tree, {
        childrenKey: "children",
        testFn: (node) => node.id === "nonexistent",
      })

      expect(result.parent).toEqual(tree)
      expect(result.child).toBeNull()
    })

    test("should work with empty children array", () => {
      const tree: Node<"children"> = {
        id: "root",
        children: [],
      }

      const result = bifurcate(tree, {
        childrenKey: "children",
        testFn: (node) => node.id === "child1",
      })

      expect(result.parent).toEqual(tree)
      expect(result.child).toBeNull()
    })

    test("should work with no children property", () => {
      const tree: Node<"children"> = {
        id: "root",
      }

      const result = bifurcate(tree, {
        childrenKey: "children",
        testFn: (node) => node.id === "child1",
      })

      expect(result.parent).toEqual(tree)
      expect(result.child).toBeNull()
    })

    test("should use custom childrenKey if provided", () => {
      type CustomNode = Node<"items">

      const tree: CustomNode = {
        id: "root",
        items: [
          { id: "child1" },
          { id: "child2", items: [{ id: "grandchild1" }] },
        ],
      }

      const result = bifurcate(tree, {
        testFn: (node) => node.id === "child2",
        childrenKey: "items",
      })

      expect(result.parent).toEqual({
        id: "root",
        items: [{ id: "child1" }],
      })
      expect(result.child).toEqual({
        id: "child2",
        items: [{ id: "grandchild1" }],
      })
    })

    test("should use copy option to create a deep copy", () => {
      const tree: Node<"children"> = {
        id: "root",
        children: [
          { id: "child1" },
          { id: "child2", children: [{ id: "grandchild1" }] },
        ],
      }

      const originalTree = JSON.parse(JSON.stringify(tree))

      const result = bifurcate(tree, {
        childrenKey: "children",
        testFn: (node) => node.id === "child2",
        copy: true,
      })

      // Original tree should not be modified
      expect(tree).toEqual(originalTree)

      // Result should still be correct
      expect(result.parent).toEqual({
        id: "root",
        children: [{ id: "child1" }],
      })
      expect(result.child).toEqual({
        id: "child2",
        children: [{ id: "grandchild1" }],
      })
    })

    test("should provide parent and depth to testFn", () => {
      const tree: Node<"children"> = {
        id: "root",
        children: [
          { id: "child1" },
          { id: "child2", children: [{ id: "grandchild1" }] },
        ],
      }

      const testFn = jest.fn().mockImplementation((node, parent, depth) => {
        if (node.id === "grandchild1") {
          return true
        }
        return false
      })

      const result = bifurcate(tree, { childrenKey: "children", testFn })

      // Check that testFn was called with correct arguments
      expect(testFn).toHaveBeenCalledWith(
        expect.objectContaining({ id: "grandchild1" }),
        expect.objectContaining({ id: "child2" }),
        2
      )
    })
  })

  // Test with UniformNode type
  describe("with UniformNode type", () => {
    interface TestProps {
      id: string
      value?: number
    }

    test("should work with UniformNode type", () => {
      const tree: UniformNode<"children", TestProps> = {
        id: "root",
        value: 1,
        children: [
          { id: "child1", value: 2 },
          {
            id: "child2",
            value: 3,
            children: [{ id: "grandchild1", value: 4 }],
          },
        ],
      }

      const result = bifurcate(tree, {
        childrenKey: "children",
        testFn: (node) => node.id === "child2",
      })

      expect(result.parent).toEqual({
        id: "root",
        value: 1,
        children: [{ id: "child1", value: 2 }],
      })
      expect(result.child).toEqual({
        id: "child2",
        value: 3,
        children: [{ id: "grandchild1", value: 4 }],
      })
    })

    test("should work with UniformNode with custom childrenKey", () => {
      type CustomUniformNode = UniformNode<"items", TestProps>

      const tree: CustomUniformNode = {
        id: "root",
        value: 1,
        items: [
          { id: "child1", value: 2 },
          {
            id: "child2",
            value: 3,
            items: [{ id: "grandchild1", value: 4 }],
          },
        ],
      }

      const result = bifurcate(tree, {
        testFn: (node) => node.id === "child2",
        childrenKey: "items",
      })

      expect(result.parent).toEqual({
        id: "root",
        value: 1,
        items: [{ id: "child1", value: 2 }],
      })
      expect(result.child).toEqual({
        id: "child2",
        value: 3,
        items: [{ id: "grandchild1", value: 4 }],
      })
    })
  })

  // Complex test cases
  describe("complex scenarios", () => {
    test("should handle finding a node in the middle of a deep tree", () => {
      const tree: Node<"children"> = {
        id: "root",
        children: [
          {
            id: "branch1",
            children: [
              { id: "leaf1-1" },
              {
                id: "branch1-2",
                children: [
                  { id: "leaf1-2-1" },
                  { id: "target", data: "found me!" },
                ],
              },
            ],
          },
          {
            id: "branch2",
            children: [{ id: "leaf2-1" }],
          },
        ],
      }

      const result = bifurcate(tree, {
        childrenKey: "children",
        testFn: (node) => node.id === "target",
      })

      expect(result.child).toEqual({ id: "target", data: "found me!" })
      expect(result.parent).toEqual({
        id: "root",
        children: [
          {
            id: "branch1",
            children: [
              { id: "leaf1-1" },
              {
                id: "branch1-2",
                children: [{ id: "leaf1-2-1" }],
              },
            ],
          },
          {
            id: "branch2",
            children: [{ id: "leaf2-1" }],
          },
        ],
      })
    })

    test("should handle multiple matches by returning the first match", () => {
      const tree: Node<"children"> = {
        id: "root",
        children: [
          { id: "match", value: 1 },
          { id: "branch", children: [{ id: "match", value: 2 }] },
        ],
      }

      const result = bifurcate(tree, {
        childrenKey: "children",
        testFn: (node) => node.id === "match",
      })

      expect(result.child).toEqual({ id: "match", value: 1 })
      expect(result.parent).toEqual({
        id: "root",
        children: [{ id: "branch", children: [{ id: "match", value: 2 }] }],
      })
    })
  })

  // Circular reference tests
  describe("circular reference detection", () => {
    test("should throw error when direct circular reference exists in tree", () => {
      const child: Node<"children"> = { id: "child" }
      const tree: Node<"children"> = {
        id: "root",
        children: [child],
      }

      // Create circular reference
      child.children = [tree]

      expect(() => {
        bifurcate(tree, {
          childrenKey: "children",
          testFn: (node) => node.id === "nonexistent",
        })
      }).toThrow("Circular reference detected")
    })

    test("should throw error when indirect circular reference exists in tree", () => {
      const grandchild: Node<"children"> = { id: "grandchild" }
      const child: Node<"children"> = { id: "child", children: [grandchild] }
      const tree: Node<"children"> = {
        id: "root",
        children: [child],
      }

      // Create circular reference
      grandchild.children = [tree]

      expect(() => {
        bifurcate(tree, {
          childrenKey: "children",
          testFn: (node) => node.id === "nonexistent",
        })
      }).toThrow("Circular reference detected")
    })

    test("should throw error when node references itself", () => {
      const tree: Node<"children"> = {
        id: "root",
      }

      // Create self-reference
      tree.children = [tree]

      expect(() => {
        bifurcate(tree, {
          childrenKey: "children",
          testFn: (node) => node.id === "nonexistent",
        })
      }).toThrow("Circular reference detected")
    })

    test("should throw error when circular reference exists with custom childrenKey", () => {
      type CustomNode = Node<"items">

      const child: CustomNode = { id: "child" }
      const tree: CustomNode = {
        id: "root",
        items: [child],
      }

      // Create circular reference
      child.items = [tree]

      expect(() => {
        bifurcate(tree, {
          childrenKey: "items",
          testFn: (node) => node.id === "nonexistent",
        })
      }).toThrow("Circular reference detected")
    })

    test("should throw error when circular reference exists in UniformNode type", () => {
      interface TestProps {
        id: string
        value?: number
      }

      const child: UniformNode<"children", TestProps> = {
        id: "child",
        value: 2,
      }

      const tree: UniformNode<"children", TestProps> = {
        id: "root",
        value: 1,
        children: [child],
      }

      // Create circular reference
      child.children = [tree]

      expect(() => {
        bifurcate(tree, {
          childrenKey: "children",
          testFn: (node) => node.id === "nonexistent",
        })
      }).toThrow("Circular reference detected")
    })

    test("should not throw error for similar but distinct nodes", () => {
      // Create two nodes with the same properties but different references
      const tree: Node<"children"> = {
        id: "root",
        children: [
          { id: "child", data: "same data" },
          { id: "child", data: "same data" },
        ],
      }

      // This should not throw as these are distinct objects despite having identical properties
      expect(() => {
        bifurcate(tree, {
          childrenKey: "children",
          testFn: (node) => node.id === "nonexistent",
        })
      }).not.toThrow()
    })
  })
})
