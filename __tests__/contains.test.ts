import { contains } from "../src/contains"
import { Node, UniformNode } from "../src/types"

describe("contains function", () => {
  // Test with generic nodes
  describe("with generic Node type", () => {
    test("should return true when node satisfies test function", () => {
      const tree: Node<"children"> = {
        id: 1,
        name: "root",
        children: [
          { id: 2, name: "child1" },
          { id: 3, name: "child2" },
        ],
      }

      const result = contains(tree, {
        childrenKey: "children",
        testFn: (node) => node.id === 2,
      })

      expect(result).toBe(true)
    })

    test("should return false when no node satisfies test function", () => {
      const tree: Node<"children"> = {
        id: 1,
        name: "root",
        children: [
          { id: 2, name: "child1" },
          { id: 3, name: "child2" },
        ],
      }

      const result = contains(tree, {
        childrenKey: "children",
        testFn: (node) => node.id === 10,
      })

      expect(result).toBe(false)
    })

    test("should search in deeply nested nodes", () => {
      const tree: Node<"children"> = {
        id: 1,
        name: "root",
        children: [
          {
            id: 2,
            name: "child1",
            children: [
              { id: 4, name: "grandchild1" },
              {
                id: 5,
                name: "grandchild2",
                children: [{ id: 7, name: "great-grandchild" }],
              },
            ],
          },
          {
            id: 3,
            name: "child2",
            children: [{ id: 6, name: "grandchild3" }],
          },
        ],
      }

      const result = contains(tree, {
        childrenKey: "children",
        testFn: (node) => node.id === 7,
      })

      expect(result).toBe(true)
    })

    test("should handle empty trees", () => {
      const tree: Node<"children"> = {
        id: 1,
        name: "root",
      }

      const result = contains(tree, {
        childrenKey: "children",
        testFn: (node) => node.id === 2,
      })

      expect(result).toBe(false)
    })

    test("should handle empty children arrays", () => {
      const tree: Node<"children"> = {
        id: 1,
        name: "root",
        children: [],
      }

      const result = contains(tree, {
        childrenKey: "children",
        testFn: (node) => node.id === 1,
      })

      expect(result).toBe(true) // Root node satisfies the condition
    })
  })

  // Test with uniform nodes
  describe("with UniformNode type", () => {
    interface TaskNode {
      id: number
      title: string
      completed: boolean
    }

    test("should correctly find nodes based on properties", () => {
      const taskTree: UniformNode<"subtasks", TaskNode> = {
        id: 1,
        title: "Project",
        completed: false,
        subtasks: [
          { id: 2, title: "Research", completed: true },
          {
            id: 3,
            title: "Development",
            completed: false,
            subtasks: [
              { id: 4, title: "Frontend", completed: false },
              { id: 5, title: "Backend", completed: true },
            ],
          },
        ],
      }

      const result = contains(taskTree, {
        childrenKey: "subtasks",
        testFn: (node) => node.completed === true && node.title === "Backend",
      })

      expect(result).toBe(true)
    })

    test("should handle custom childrenKey", () => {
      interface CategoryNode {
        id: number
        name: string
        subcategories?: CategoryNode[]
      }

      const categories: UniformNode<"subcategories", CategoryNode> = {
        id: 1,
        name: "Electronics",
        subcategories: [
          { id: 2, name: "Computers" },
          {
            id: 3,
            name: "Phones",
            subcategories: [
              { id: 4, name: "Android" },
              { id: 5, name: "iPhone" },
            ],
          },
        ],
      }

      const result = contains(categories, {
        childrenKey: "subcategories",
        testFn: (node) => node.name === "iPhone",
      })

      expect(result).toBe(true)
    })
  })

  // Test the parent and depth parameters
  describe("parent and depth parameters", () => {
    test("should provide correct parent reference", () => {
      const tree: UniformNode<"children", { id: number; name: string }> = {
        id: 1,
        name: "root",
        children: [
          { id: 2, name: "child1" },
          {
            id: 3,
            name: "child2",
            children: [{ id: 4, name: "grandchild" }],
          },
        ],
      }

      // We'll keep track of the parents we encounter
      const parentsFound: Array<number | null> = []

      contains(tree, {
        childrenKey: "children",
        testFn: (node, parent) => {
          if (node.id === 4) {
            parentsFound.push(parent?.id || null)
            return true
          }
          return false
        },
      })

      expect(parentsFound).toEqual([3]) // The parent of node with id 4 should be node with id 3
    })

    test("should provide correct depth values", () => {
      const tree: Node<"children"> = {
        id: 1,
        name: "root",
        children: [
          { id: 2, name: "child1" },
          {
            id: 3,
            name: "child2",
            children: [{ id: 4, name: "grandchild" }],
          },
        ],
      }

      // We'll collect depth values for each node
      const depths: Record<number, number> = {}

      contains(tree, {
        childrenKey: "children",
        testFn: (node, _parent, depth) => {
          if (typeof node.id === "number") {
            depths[node.id] = depth
          }
          return false // We want to visit all nodes
        },
      })

      // After the function returns false for all nodes, we check the recorded depths
      expect(depths).toEqual({
        1: 0, // root is at depth 0
        2: 1, // child1 is at depth 1
        3: 1, // child2 is at depth 1
        4: 2, // grandchild is at depth 2
      })
    })
  })

  // Edge cases
  describe("edge cases", () => {
    // test("should handle circular references", () => {
    //   // Create nodes that we can mutate to create a circular reference
    //   const root: Node<"children"> = { id: 1, name: "root", children: [] }
    //   const child: Node<"children"> = { id: 2, name: "child", children: [] }

    //   // Create a circular reference
    //   root.children = [child]
    //   ;(child.children as Node[]) = [root] // This creates a circular reference

    //   // We need to keep track of visited nodes to avoid infinite recursion
    //   const visitedIds = new Set<number>()

    //   const result = contains(root, {
    //     childrenKey: "children",
    //     testFn: (node) => {
    //       // If we've seen this node before, return false to avoid infinite recursion
    //       if (visitedIds.has(node.id)) {
    //         return false
    //       }
    //       visitedIds.add(node.id)

    //       return node.id === 3 // Looking for a node that doesn't exist
    //     },
    //   })

    //   expect(result).toBe(false)
    //   expect(visitedIds.size).toBe(2) // Should have visited both nodes
    // })

    test("should handle nodes with null or undefined children", () => {
      const tree: Node<"children"> = {
        id: 1,
        name: "root",
        children: [
          { id: 2, name: "child1", children: null as any },
          { id: 3, name: "child2", children: undefined },
        ],
      }

      const result = contains(tree, {
        childrenKey: "children",
        testFn: (node) => node.id === 3,
      })

      expect(result).toBe(true)
    })
  })
})
