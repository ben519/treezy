import { prune } from "../src/prune"
import { Node, UniformNode } from "../src/types"

describe("prune function", () => {
  // Basic tests with generic nodes
  describe("with generic Node type", () => {
    test("should return null when root node matches test function", () => {
      const tree: Node<"children"> = {
        id: "root",
        children: [{ id: "child1" }, { id: "child2" }],
      }

      const result = prune(tree, {
        childrenKey: "children",
        testFn: (node) => node.id === "root",
      })

      expect(result).toBeNull()
    })

    test("should remove children that match test function", () => {
      const tree: Node<"children"> = {
        id: "root",
        children: [{ id: "child1" }, { id: "child2" }, { id: "removeMe" }],
      }

      const result = prune(tree, {
        childrenKey: "children",
        testFn: (node) => node.id === "removeMe",
      })

      expect(result).not.toBeNull()
      expect(result?.children?.length).toBe(2)
      expect(result?.children?.map((child) => child.id)).toEqual([
        "child1",
        "child2",
      ])
    })

    test("should handle deeply nested structure", () => {
      const tree: Node<"children"> = {
        id: "root",
        children: [
          {
            id: "branch1",
            children: [{ id: "leaf1" }, { id: "removeMe" }, { id: "leaf2" }],
          },
          {
            id: "branch2",
            children: [{ id: "removeMe" }, { id: "leaf3" }],
          },
        ],
      }

      const result = prune(tree, {
        childrenKey: "children",
        testFn: (node) => node.id === "removeMe",
      })

      expect(result).not.toBeNull()
      expect(result?.children?.length).toBe(2)
      expect(result?.children?.[0].children?.length).toBe(2)
      expect(result?.children?.[0].children?.map((child) => child.id)).toEqual([
        "leaf1",
        "leaf2",
      ])
      expect(result?.children?.[1].children?.length).toBe(1)
      expect(result?.children?.[1].children?.[0].id).toBe("leaf3")
    })

    test("should handle custom children key", () => {
      const tree: Node<"items"> = {
        id: "root",
        items: [{ id: "child1" }, { id: "removeMe" }, { id: "child2" }],
      }

      const result = prune(tree, {
        testFn: (node) => node.id === "removeMe",
        childrenKey: "items",
      })

      expect(result).not.toBeNull()
      expect(result?.items?.length).toBe(2)
      expect(result?.items?.map((item) => item.id)).toEqual([
        "child1",
        "child2",
      ])
    })

    test("should handle nodes with no children", () => {
      const tree: Node<"children"> = {
        id: "root",
        value: 42,
      }

      const result = prune(tree, {
        childrenKey: "children",
        testFn: () => false,
      })

      expect(result).toEqual({ id: "root", value: 42 })
    })

    test("should handle empty children array", () => {
      const tree: Node<"children"> = {
        id: "root",
        children: [],
      }

      const result = prune(tree, {
        childrenKey: "children",
        testFn: () => false,
      })

      expect(result).toEqual({ id: "root", children: [] })
    })
  })

  // Tests with uniform nodes
  describe("with UniformNode type", () => {
    interface TestNode
      extends UniformNode<"children", { id: string; value?: number }> {}

    test("should prune uniform nodes correctly", () => {
      const tree: TestNode = {
        id: "root",
        value: 1,
        children: [
          { id: "child1", value: 2 },
          { id: "removeMe", value: 3 },
          {
            id: "branch",
            value: 4,
            children: [
              { id: "leaf", value: 5 },
              { id: "removeMe", value: 6 },
            ],
          },
        ],
      }

      const result = prune(tree, {
        childrenKey: "children",
        testFn: (node) => node.id === "removeMe",
      })

      expect(result).not.toBeNull()
      expect(result?.children?.length).toBe(2)
      expect(result?.children?.[0].id).toBe("child1")
      expect(result?.children?.[1].id).toBe("branch")
      expect(result?.children?.[1].children?.length).toBe(1)
      expect(result?.children?.[1].children?.[0].id).toBe("leaf")
    })

    test("should handle custom children key with uniform nodes", () => {
      interface CustomTestNode
        extends UniformNode<"items", { id: string; value?: number }> {}

      const tree: CustomTestNode = {
        id: "root",
        value: 1,
        items: [
          { id: "child1", value: 2 },
          { id: "removeMe", value: 3 },
        ],
      }

      const result = prune(tree, {
        testFn: (node) => node.id === "removeMe",
        childrenKey: "items",
      })

      expect(result).not.toBeNull()
      expect(result?.items?.length).toBe(1)
      expect(result?.items?.[0].id).toBe("child1")
    })
  })

  // Advanced tests
  describe("advanced behavior", () => {
    test("should have access to parent node in test function", () => {
      const tree: Node<"children"> = {
        id: "root",
        children: [
          {
            id: "branch1",
            children: [{ id: "leaf1" }, { id: "leaf2" }],
          },
          { id: "branch2" },
        ],
      }

      const result = prune(tree, {
        childrenKey: "children",
        testFn: (node, parent) =>
          parent !== null && parent.id === "branch1" && node.id === "leaf2",
      })

      expect(result).not.toBeNull()
      expect(result?.children?.[0].children?.length).toBe(1)
      expect(result?.children?.[0].children?.[0].id).toBe("leaf1")
    })

    test("should have access to depth in test function", () => {
      const tree: Node<"children"> = {
        id: "root", // depth 0
        children: [
          {
            id: "branch1", // depth 1
            children: [
              { id: "leaf1" }, // depth 2
              { id: "leaf2" }, // depth 2
            ],
          },
          { id: "branch2" }, // depth 1
        ],
      }

      const result = prune(tree, {
        childrenKey: "children",
        testFn: (node, _parent, depth) => depth === 2,
      })

      expect(result).not.toBeNull()
      expect(result?.children?.length).toBe(2)
      expect(result?.children?.[0].children?.length).toBe(0)
    })

    test("should not modify the original tree when copy option is implemented", () => {
      const tree: Node<"children"> = {
        id: "root",
        children: [{ id: "child1" }, { id: "removeMe" }, { id: "child2" }],
      }

      const originalChildrenCount = tree.children?.length

      const result = prune(tree, {
        childrenKey: "children",
        testFn: (node) => node.id === "removeMe",
        copy: true, // This option should create a copy instead of modifying original
      })

      // If copy option is properly implemented, this should pass
      expect(tree.children?.length).toBe(originalChildrenCount)
      expect(result?.children?.length).toBe(2)
    })
  })

  // Error cases and edge cases
  describe("edge cases", () => {
    test("should handle null or undefined tree", () => {
      // @ts-expect-error - Testing runtime behavior with invalid input
      expect(() => prune(null, { testFn: () => false })).toThrow()

      // @ts-expect-error - Testing runtime behavior with invalid input
      expect(() => prune(undefined, { testFn: () => false })).toThrow()
    })

    test("should handle very deep trees without stack overflow", () => {
      // Create a very deep tree
      let deepTree: Node<"children"> = { id: "root" }
      let current = deepTree

      // Create a tree with 1000 levels (adjust based on typical stack limits)
      for (let i = 0; i < 1000; i++) {
        const child = { id: `level-${i}` }
        current.children = [child]
        current = child
      }

      // This should handle the deep tree without stack overflow
      expect(() =>
        prune(deepTree, { childrenKey: "children", testFn: () => false })
      ).not.toThrow()
    })
  })

  describe("prune function", () => {
    // ... (previous tests)

    describe("circular reference detection", () => {
      test("should throw 'Circular reference detected' for a simple parent reference", () => {
        const node1: Node<"children"> = { id: "node1" }
        const node2: Node<"children"> = { id: "node2" }
        node1.children = [node2]
        node2.children = [node1] // node2 references node1

        expect(() =>
          prune(node1, { childrenKey: "children", testFn: () => false })
        ).toThrow("Circular reference detected")
      })

      test("should throw 'Circular reference detected' for an ancestor reference", () => {
        const root: Node<"children"> = { id: "root" }
        const branch1: Node<"children"> = { id: "branch1" }
        const leaf1: Node<"children"> = { id: "leaf1" }
        root.children = [branch1]
        branch1.children = [leaf1]
        leaf1.children = [root] // leaf1 references root

        expect(() =>
          prune(root, { childrenKey: "children", testFn: () => false })
        ).toThrow("Circular reference detected")
      })

      test("should throw 'Circular reference detected' for a self-referencing node", () => {
        const node: Node<"children"> = { id: "self" }
        node.children = [node] // Node references itself

        expect(() =>
          prune(node, { childrenKey: "children", testFn: () => false })
        ).toThrow("Circular reference detected")
      })

      test("should throw 'Circular reference detected' for a complex circular path", () => {
        const n1: Node<"children"> = { id: "n1" }
        const n2: Node<"children"> = { id: "n2" }
        const n3: Node<"children"> = { id: "n3" }
        const n4: Node<"children"> = { id: "n4" }
        n1.children = [n2]
        n2.children = [n3]
        n3.children = [n4]
        n4.children = [n2] // Creates a cycle n2 -> n3 -> n4 -> n2

        expect(() =>
          prune(n1, { childrenKey: "children", testFn: () => false })
        ).toThrow("Circular reference detected")
      })

      test("should not throw for a valid tree structure", () => {
        const tree: Node<"children"> = {
          id: "root",
          children: [
            { id: "child1" },
            {
              id: "child2",
              children: [{ id: "grandchild1" }, { id: "grandchild2" }],
            },
          ],
        }

        // This is a valid tree, should not throw
        expect(() =>
          prune(tree, { childrenKey: "children", testFn: () => false })
        ).not.toThrow("Circular reference detected")
      })
    })
  })
})
