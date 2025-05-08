import { getSubtree } from "../src/getSubtree"
import { Node, UniformNode } from "../src/types"

describe("getSubtree", () => {
  // Basic tree structure for generic Node tests
  const genericTree: Node<"children"> = {
    id: "root",
    value: "Root Node",
    children: [
      {
        id: "child1",
        value: "Child 1",
        children: [
          { id: "grandchild1", value: "Grandchild 1" },
          { id: "grandchild2", value: "Grandchild 2", flag: true },
        ],
      },
      {
        id: "child2",
        value: "Child 2",
        children: [{ id: "grandchild3", value: "Grandchild 3" }],
      },
    ],
  }

  // Tree structure for UniformNode tests
  interface MyNode
    extends UniformNode<"items", { id: string; value: string }> {}

  const uniformTree: MyNode = {
    id: "root",
    value: "Root Node",
    items: [
      {
        id: "child1",
        value: "Child 1",
        items: [
          { id: "grandchild1", value: "Grandchild 1" },
          { id: "grandchild2", value: "Grandchild 2" },
        ],
      },
      {
        id: "child2",
        value: "Child 2",
        items: [{ id: "grandchild3", value: "Grandchild 3" }],
      },
    ],
  }

  // Test with GenericNode
  describe("with generic Node", () => {
    test("finds a node based on id", () => {
      const result = getSubtree(genericTree, {
        childrenKey: "children",
        testFn: (node) => node.id === "child1",
      })

      expect(result).toBeDefined()
      expect(result?.id).toBe("child1")
      expect(result?.children?.length).toBe(2)
    })

    test("finds a deeply nested node", () => {
      const result = getSubtree(genericTree, {
        childrenKey: "children",
        testFn: (node) => node.id === "grandchild2",
      })

      expect(result).toBeDefined()
      expect(result?.id).toBe("grandchild2")
      expect(result?.flag).toBe(true)
    })

    test("returns undefined when no node matches", () => {
      const result = getSubtree(genericTree, {
        childrenKey: "children",
        testFn: (node) => node.id === "nonexistent",
      })

      expect(result).toBeUndefined()
    })

    test("uses parent in testFn", () => {
      const result = getSubtree(genericTree, {
        childrenKey: "children",
        testFn: (node, parent) =>
          parent?.id === "child1" && node.id === "grandchild1",
      })

      expect(result).toBeDefined()
      expect(result?.id).toBe("grandchild1")
    })

    test("uses depth in testFn", () => {
      const result = getSubtree(genericTree, {
        childrenKey: "children",
        testFn: (node, _, depth) => depth === 2,
      })

      expect(result).toBeDefined()
      expect(result?.id).toBe("grandchild1") // First node at depth 2
    })

    test("works with custom childrenKey", () => {
      const customTree: Node<"subNodes"> = {
        id: "root",
        value: "Root Node",
        subNodes: [
          {
            id: "child1",
            value: "Child 1",
            subNodes: [{ id: "grandchild1", value: "Grandchild 1" }],
          },
        ],
      }

      const result = getSubtree(customTree, {
        childrenKey: "subNodes",
        testFn: (node) => node.id === "grandchild1",
      })

      expect(result).toBeDefined()
      expect(result?.id).toBe("grandchild1")
    })

    test("makes a copy when copy option is true", () => {
      const originalTree = { ...genericTree }

      const result = getSubtree(genericTree, {
        childrenKey: "children",
        testFn: (node) => node.id === "child1",
        copy: true,
      })

      // Modify the result
      if (result && result.children) {
        result.children[0].value = "Modified Value"
      }

      // Original should remain unchanged
      expect(genericTree.children?.[0].children?.[0].value).toBe("Grandchild 1")
      // Result should have the modified value
      expect(result?.children?.[0].value).toBe("Modified Value")
    })
  })

  // Test with UniformNode
  describe("with UniformNode", () => {
    test("finds a node with custom childrenKey", () => {
      const result = getSubtree(uniformTree, {
        childrenKey: "items",
        testFn: (node) => node.id === "child2",
      })

      expect(result).toBeDefined()
      expect(result?.id).toBe("child2")
      expect(result?.items?.length).toBe(1)
    })

    test("finds a deeply nested node in UniformNode", () => {
      const result = getSubtree(uniformTree, {
        childrenKey: "items",
        testFn: (node) => node.value === "Grandchild 3",
      })

      expect(result).toBeDefined()
      expect(result?.id).toBe("grandchild3")
    })

    test("maintains type information", () => {
      const result = getSubtree(uniformTree, {
        childrenKey: "items",
        testFn: (node) => node.id === "child1",
      })

      // TypeScript should recognize result as MyNode with items property
      expect(result?.items).toBeDefined()
      expect(result?.value).toBe("Child 1")
    })
  })

  // Edge cases
  describe("edge cases", () => {
    test("handles empty tree", () => {
      const emptyTree: Node<"children"> = { id: "empty" }

      const result = getSubtree(emptyTree, {
        childrenKey: "children",
        testFn: (node) => node.id === "anything",
      })

      // Should return the node itself if it matches
      expect(
        getSubtree(emptyTree, {
          childrenKey: "children",
          testFn: (node) => node.id === "empty",
        })
      ).toBe(emptyTree)
      // Should return undefined for non-matching criteria
      expect(result).toBeUndefined()
    })

    test("handles null children array", () => {
      const treeWithNullChildren: Node<"children"> = {
        id: "root",
        value: "Root Node",
        children: null as any,
      }

      const result = getSubtree(treeWithNullChildren, {
        childrenKey: "children",
        testFn: (node) => node.id === "root",
      })

      expect(result).toBeDefined()
      expect(result?.id).toBe("root")
    })

    test("handles undefined children array", () => {
      const treeWithUndefinedChildren: Node<"children"> = {
        id: "root",
        value: "Root Node",
        // children is undefined
      }

      const result = getSubtree(treeWithUndefinedChildren, {
        childrenKey: "children",
        testFn: (node) => node.id === "root",
      })

      expect(result).toBeDefined()
      expect(result?.id).toBe("root")
    })

    test("default testFn returns first node", () => {
      const result = getSubtree(genericTree, { childrenKey: "children" })

      expect(result).toBeDefined()
      expect(result?.id).toBe("root")
    })
  })

  // Test for complex search criteria
  describe("complex search criteria", () => {
    test("finds nodes using multiple conditions", () => {
      const result = getSubtree(genericTree, {
        childrenKey: "children",
        testFn: (node) =>
          typeof node.id === "string" &&
          node.id.startsWith("grand") &&
          node.id.endsWith("2"),
      })

      expect(result).toBeDefined()
      expect(result?.id).toBe("grandchild2")
    })

    test("finds node at specific path", () => {
      // Find a node that's specifically a child of 'child2'
      const result = getSubtree(genericTree, {
        childrenKey: "children",
        testFn: (node, parent) =>
          node.id === "grandchild3" && parent?.id === "child2",
      })

      expect(result).toBeDefined()
      expect(result?.id).toBe("grandchild3")
    })
  })
})
