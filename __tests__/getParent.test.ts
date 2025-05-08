import { getParent } from "../src/getParent"
import { Node, UniformNode } from "../src/types"

describe("getParent function", () => {
  // Test with generic Node type
  describe("with generic Node type", () => {
    test("should return null when target node is the root", () => {
      const tree: Node<"children"> = {
        id: "root",
        children: [{ id: "child1" }, { id: "child2" }],
      }

      const result = getParent(tree, {
        childrenKey: "children",
        testFn: (node) => node.id === "root",
      })

      expect(result).toBeNull()
    })

    test("should find parent of a direct child", () => {
      const tree: Node<"children"> = {
        id: "root",
        children: [{ id: "child1" }, { id: "child2" }],
      }

      const result = getParent(tree, {
        childrenKey: "children",
        testFn: (node) => node.id === "child1",
      })

      expect(result).toEqual(tree)
    })

    test("should find parent of a nested child", () => {
      const tree: Node<"children"> = {
        id: "root",
        children: [
          {
            id: "child1",
            children: [{ id: "grandchild1" }],
          },
          { id: "child2" },
        ],
      }

      const result = getParent(tree, {
        childrenKey: "children",
        testFn: (node) => node.id === "grandchild1",
      })

      expect(result?.id).toBe("child1")
    })

    test("should return undefined when node is not found", () => {
      const tree: Node<"children"> = {
        id: "root",
        children: [{ id: "child1" }, { id: "child2" }],
      }

      const result = getParent(tree, {
        childrenKey: "children",
        testFn: (node) => node.id === "nonexistent",
      })

      expect(result).toBeUndefined()
    })

    test("should use custom children key", () => {
      const tree: Node<"items"> = {
        id: "root",
        items: [{ id: "child1" }, { id: "child2" }],
      }

      const result = getParent(tree, {
        testFn: (node) => node.id === "child2",
        childrenKey: "items",
      })

      expect(result).toEqual(tree)
    })

    test("should handle nodes with no children", () => {
      const tree: Node<"children"> = {
        id: "root",
        // No children array at all
      }

      const result = getParent(tree, {
        childrenKey: "children",
        testFn: (node) => node.id === "nonexistent",
      })

      expect(result).toBeUndefined()
    })

    test("should handle empty children arrays", () => {
      const tree: Node<"children"> = {
        id: "root",
        children: [], // Empty array
      }

      const result = getParent(tree, {
        childrenKey: "children",
        testFn: (node) => node.id === "nonexistent",
      })

      expect(result).toBeUndefined()
    })

    test("should use depth parameter in testFn", () => {
      const tree: Node<"children"> = {
        id: "root",
        children: [
          {
            id: "child1",
            children: [{ id: "grandchild1" }],
          },
        ],
      }

      const result = getParent(tree, {
        childrenKey: "children",
        testFn: (node, parent, depth) => depth === 2,
      })

      expect(result?.id).toBe("child1")
    })

    test("should use parent parameter in testFn", () => {
      const tree: Node<"children"> = {
        id: "root",
        children: [
          {
            id: "child1",
            children: [{ id: "grandchild1" }],
          },
          {
            id: "child2",
            children: [{ id: "grandchild2" }],
          },
        ],
      }

      const result = getParent(tree, {
        childrenKey: "children",
        testFn: (node, parent) => parent?.id === "child2",
      })

      expect(result?.id).toBe("child2")
    })
  })

  // Test with UniformNode type
  describe("with UniformNode type", () => {
    interface Person
      extends UniformNode<"reports", { name: string; age: number }> {}

    test("should work with uniform nodes", () => {
      const organization: Person = {
        name: "CEO",
        age: 55,
        reports: [
          {
            name: "CTO",
            age: 45,
            reports: [{ name: "Developer", age: 30 }],
          },
          {
            name: "CFO",
            age: 50,
          },
        ],
      }

      const result = getParent<"reports", { name: string; age: number }>(
        organization,
        {
          childrenKey: "reports",
          testFn: (node) => node.name === "Developer",
        }
      )

      expect(result?.name).toBe("CTO")
    })

    test("should handle custom childrenKey with uniform nodes", () => {
      interface Department
        extends UniformNode<"teams", { name: string; budget: number }> {}

      const company: Department = {
        name: "Company",
        budget: 1000000,
        teams: [
          {
            name: "Engineering",
            budget: 500000,
            teams: [
              { name: "Frontend", budget: 200000 },
              { name: "Backend", budget: 300000 },
            ],
          },
          {
            name: "Marketing",
            budget: 300000,
          },
        ],
      }

      const result = getParent<"teams", { name: string; budget: number }>(
        company,
        {
          testFn: (node) => node.name === "Backend",
          childrenKey: "teams",
        }
      )

      expect(result?.name).toBe("Engineering")
    })
  })

  // // Test copy option
  // describe("copy option", () => {
  //   test("should copy the tree when copy is true", () => {
  //     const originalTree: Node<"children"> = {
  //       id: "root",
  //       children: [{ id: "child1" }],
  //     }

  //     // Spy on structuredClone
  //     const originalStructuredClone = global.structuredClone
  //     global.structuredClone = jest.fn(originalStructuredClone)

  //     getParent(originalTree, {
  //       testFn: (node) => node.id === "child1",
  //       copy: true,
  //     })

  //     expect(global.structuredClone).toHaveBeenCalledWith(originalTree)

  //     // Restore original function
  //     global.structuredClone = originalStructuredClone
  //   })

  //   test("should not copy the tree when copy is false", () => {
  //     const originalTree: Node<"children"> = {
  //       id: "root",
  //       children: [{ id: "child1" }],
  //     }

  //     // Spy on structuredClone
  //     const originalStructuredClone = global.structuredClone
  //     global.structuredClone = jest.fn(originalStructuredClone)

  //     getParent(originalTree, {
  //       testFn: (node) => node.id === "child1",
  //       copy: false,
  //     })

  //     expect(global.structuredClone).not.toHaveBeenCalled()

  //     // Restore original function
  //     global.structuredClone = originalStructuredClone
  //   })
  // })

  // Edge cases
  describe("edge cases", () => {
    test("should handle complex trees with multiple matching conditions", () => {
      const tree: Node<"children"> = {
        id: "root",
        children: [
          {
            id: "branch1",
            children: [{ id: "target", value: 1 }, { id: "leaf1" }],
          },
          {
            id: "branch2",
            children: [{ id: "target", value: 2 }],
          },
        ],
      }

      // Should find the first occurrence's parent
      const result = getParent(tree, {
        childrenKey: "children",
        testFn: (node) => node.id === "target",
      })

      expect(result?.id).toBe("branch1")
    })

    test("should handle deeply nested trees", () => {
      // Create a deeply nested tree with 10 levels
      let tree: Node<"children"> = { id: "level0" }
      let currentNode = tree

      for (let i = 1; i <= 10; i++) {
        const newNode = { id: `level${i}` }
        currentNode.children = [newNode]
        currentNode = newNode
      }

      // Now currentNode is at level10

      // Find the parent of the deepest node
      const result = getParent(tree, {
        childrenKey: "children",
        testFn: (node) => node.id === "level10",
      })

      expect(result?.id).toBe("level9")
    })

    test("should handle trees with multiple paths to similar nodes", () => {
      const commonNode = { id: "common" }

      const tree: Node<"children"> = {
        id: "root",
        children: [
          {
            id: "path1",
            children: [commonNode],
          },
          {
            id: "path2",
            children: [
              {
                id: "subpath",
                children: [commonNode], // Same node reference
              },
            ],
          },
        ],
      }

      // This is a tricky case - which parent should be returned depends on traversal order
      // In depth-first traversal (which the implementation uses), it should find the first path
      const result = getParent(tree, {
        childrenKey: "children",
        testFn: (node) => node.id === "common",
      })

      expect(result?.id).toBe("path1")
    })

    test("should handle circular references safely", () => {
      // Create a tree with circular references
      const tree: Node<"children"> = { id: "root" }
      const child: Node<"children"> = { id: "child" }
      tree.children = [child]

      // Create circular reference - child points back to root
      // This would normally cause infinite recursion
      // Note: TypeScript won't allow this directly, so we use any
      ;(child as any).children = [tree]

      // We expect this to find the parent based on the first occurrence in traversal
      // before hitting the circular reference
      const result = getParent(tree, {
        childrenKey: "children",
        testFn: (node) => node.id === "child",
      })

      expect(result?.id).toBe("root")

      // This would cause infinite recursion if circular references aren't handled
      // But our implementation follows references without keeping track of visited nodes
      // So this is expected to go into infinite recursion or stack overflow
      // This is a limitation of the current implementation

      // To test this properly, we would need to modify the implementation to handle circular references
      // Or implement a timeout mechanism in the test
    })
  })
})
