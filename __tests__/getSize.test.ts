import { getSize } from "../src/getSize"
import { Node, UniformNode } from "../src/types"

describe("getSize function", () => {
  // Basic tests with generic Node type
  describe("Generic Node tests", () => {
    test("counts a single node with no children", () => {
      const tree: Node<"children"> = { id: 1 }
      expect(getSize(tree, { childrenKey: "children" })).toBe(1)
    })

    test("counts a tree with one level of children", () => {
      const tree: Node<"children"> = {
        id: 1,
        children: [{ id: 2 }, { id: 3 }],
      }
      expect(getSize(tree, { childrenKey: "children" })).toBe(3)
    })

    test("counts a deeply nested tree", () => {
      const tree: Node<"children"> = {
        id: 1,
        children: [
          {
            id: 2,
            children: [{ id: 4 }, { id: 5 }],
          },
          {
            id: 3,
            children: [{ id: 6 }],
          },
        ],
      }
      expect(getSize(tree, { childrenKey: "children" })).toBe(6)
    })
  })

  // Tests with UniformNode type
  describe("UniformNode tests", () => {
    interface TodoNode {
      id: number
      completed: boolean
    }

    test("counts uniform nodes with extra properties", () => {
      const todoTree: UniformNode<"children", TodoNode> = {
        id: 1,
        completed: false,
        children: [
          { id: 2, completed: true },
          { id: 3, completed: false },
        ],
      }
      expect(getSize(todoTree, { childrenKey: "children" })).toBe(3)
    })

    test("counts only nodes matching test function", () => {
      const todoTree: UniformNode<"children", TodoNode> = {
        id: 1,
        completed: false,
        children: [
          { id: 2, completed: true },
          {
            id: 3,
            completed: false,
            children: [
              { id: 4, completed: true },
              { id: 5, completed: false },
            ],
          },
        ],
      }

      // Only count incomplete tasks
      const result = getSize(todoTree, {
        childrenKey: "children",
        testFn: (node) => !node.completed,
      })

      expect(result).toBe(3) // IDs 1, 3, and 5 are incomplete
    })
  })

  // Tests with custom childrenKey
  describe("Custom childrenKey tests", () => {
    test("uses custom childrenKey", () => {
      const tree: Node<"items"> = {
        id: 1,
        items: [{ id: 2 }, { id: 3, items: [{ id: 4 }] }],
      }

      expect(getSize(tree, { childrenKey: "items" })).toBe(4)
    })

    test("handles missing childrenKey correctly", () => {
      const tree: Node<"items"> = {
        id: 1,
        items: [{ id: 2 }, { id: 3 }],
      }

      // Using default 'children' key when tree uses 'items'
      expect(getSize(tree, { childrenKey: "children" })).toBe(1) // Only counts root node
    })
  })

  // Advanced test scenarios
  describe("Advanced scenarios", () => {
    test("counts nodes based on depth", () => {
      const tree: Node<"children"> = {
        id: 1,
        children: [
          {
            id: 2,
            children: [{ id: 4 }, { id: 5 }],
          },
          {
            id: 3,
            children: [{ id: 6 }],
          },
        ],
      }

      // Only count nodes at depth 0 and 2
      const result = getSize(tree, {
        childrenKey: "children",
        testFn: (node, parent, depth) => depth === 0 || depth === 2,
      })

      expect(result).toBe(4) // Root + three leaf nodes
    })

    test("counts nodes based on parent relationship", () => {
      const tree: Node<"children"> = {
        id: 1,
        children: [
          {
            id: 2,
            children: [{ id: 4 }, { id: 5 }],
          },
          {
            id: 3,
            children: [{ id: 6 }],
          },
        ],
      }

      // Only count nodes whose parent has ID 2
      const result = getSize(tree, {
        childrenKey: "children",
        testFn: (node, parent) => parent?.id === 2,
      })

      expect(result).toBe(2) // Only nodes 4 and 5
    })

    test("handles empty tree", () => {
      const tree: Node<"children"> = {}
      expect(getSize(tree, { childrenKey: "children" })).toBe(1) // Just the root node
    })

    test("handles null or undefined children", () => {
      const tree: Node<"children"> = {
        id: 1,
        children: undefined,
      }
      expect(getSize(tree, { childrenKey: "children" })).toBe(1)

      const treeWithNull: any = {
        id: 1,
        children: null,
      }
      expect(getSize(treeWithNull)).toBe(1)
    })
  })

  // Tests with different tree structures
  describe("Different tree structures", () => {
    interface FileSystemNode {
      name: string
      type: "file" | "directory"
    }

    test("file system tree with folders and files", () => {
      const fileSystem: UniformNode<"contents", FileSystemNode> = {
        name: "root",
        type: "directory",
        contents: [
          { name: "file1.txt", type: "file" },
          {
            name: "folder1",
            type: "directory",
            contents: [
              { name: "file2.txt", type: "file" },
              { name: "file3.txt", type: "file" },
            ],
          },
          { name: "file4.txt", type: "file" },
        ],
      }

      // Count total nodes
      expect(getSize(fileSystem, { childrenKey: "contents" })).toBe(6)

      // Count only files
      const fileCount = getSize(fileSystem, {
        childrenKey: "contents",
        testFn: (node) => node.type === "file",
      })
      expect(fileCount).toBe(4)

      // Count only directories
      const dirCount = getSize(fileSystem, {
        childrenKey: "contents",
        testFn: (node) => node.type === "directory",
      })
      expect(dirCount).toBe(2)
    })
  })
})
