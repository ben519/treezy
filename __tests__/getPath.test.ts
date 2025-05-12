import { getPath } from "../src/getPath"
import { Node, UniformNode } from "../src/types"

describe("getPath function", () => {
  // Test for generic node tree
  describe("with generic nodes", () => {
    // Example tree with generic nodes
    const genericTree: Node<"children"> = {
      id: "root",
      name: "Root",
      children: [
        {
          id: "child1",
          name: "Child 1",
          children: [
            {
              id: "grandchild1",
              name: "Grandchild 1",
            },
            {
              id: "grandchild2",
              name: "Grandchild 2",
              children: [
                {
                  id: "greatgrandchild1",
                  name: "Great Grandchild 1",
                },
              ],
            },
          ],
        },
        {
          id: "child2",
          name: "Child 2",
        },
      ],
    }

    it("should find path to a node by id", () => {
      const path = getPath(genericTree, {
        childrenKey: "children",
        testFn: (node) => node.id === "grandchild2",
      })

      expect(path).toBeDefined()
      expect(path?.length).toBe(3)
      expect(path?.[0].id).toBe("root")
      expect(path?.[1].id).toBe("child1")
      expect(path?.[2].id).toBe("grandchild2")
    })

    it("should return undefined when target node not found", () => {
      const path = getPath(genericTree, {
        childrenKey: "children",
        testFn: (node) => node.id === "nonexistent",
      })

      expect(path).toBeUndefined()
    })

    it("should find path to deepest node", () => {
      const path = getPath(genericTree, {
        childrenKey: "children",
        testFn: (node) => node.id === "greatgrandchild1",
      })

      expect(path).toBeDefined()
      expect(path?.length).toBe(4)
      expect(path?.[0].id).toBe("root")
      expect(path?.[1].id).toBe("child1")
      expect(path?.[2].id).toBe("grandchild2")
      expect(path?.[3].id).toBe("greatgrandchild1")
    })

    it("should work with depth parameter in testFn", () => {
      const path = getPath(genericTree, {
        childrenKey: "children",
        testFn: (node, _, depth) => depth === 2 && node.id === "grandchild2",
      })

      expect(path).toBeDefined()
      expect(path?.length).toBe(3)
      expect(path?.[2].id).toBe("grandchild2")
    })

    it("should work with parent parameter in testFn", () => {
      const path = getPath(genericTree, {
        childrenKey: "children",
        testFn: (node, parent) =>
          parent?.id === "child1" && node.id === "grandchild2",
      })

      expect(path).toBeDefined()
      expect(path?.length).toBe(3)
      expect(path?.[2].id).toBe("grandchild2")
    })

    it("should find the root node if it matches the test", () => {
      const path = getPath(genericTree, {
        childrenKey: "children",
        testFn: (node) => node.id === "root",
      })

      expect(path).toBeDefined()
      expect(path?.length).toBe(1)
      expect(path?.[0].id).toBe("root")
    })
  })

  // Test for uniform node tree
  describe("with uniform nodes", () => {
    interface FileSystemNode {
      name: string
      type: "file" | "directory"
      size?: number
    }

    const fileSystem: UniformNode<"contents", FileSystemNode> = {
      name: "root",
      type: "directory",
      contents: [
        {
          name: "documents",
          type: "directory",
          contents: [
            {
              name: "report.pdf",
              type: "file",
              size: 2048,
            },
            {
              name: "resume.docx",
              type: "file",
              size: 1024,
            },
          ],
        },
        {
          name: "pictures",
          type: "directory",
          contents: [
            {
              name: "vacation.jpg",
              type: "file",
              size: 4096,
            },
          ],
        },
      ],
    }

    it("should find a path to a specific file", () => {
      const path = getPath(fileSystem, {
        childrenKey: "contents",
        testFn: (node) => node.type === "file" && node.name === "report.pdf",
      })

      expect(path).toBeDefined()
      expect(path?.length).toBe(3)
      expect(path?.[0].name).toBe("root")
      expect(path?.[1].name).toBe("documents")
      expect(path?.[2].name).toBe("report.pdf")
    })

    it("should find a path to a directory", () => {
      const path = getPath(fileSystem, {
        childrenKey: "contents",
        testFn: (node) => node.type === "directory" && node.name === "pictures",
      })

      expect(path).toBeDefined()
      expect(path?.length).toBe(2)
      expect(path?.[0].name).toBe("root")
      expect(path?.[1].name).toBe("pictures")
    })
  })

  // Test for edge cases
  describe("edge cases", () => {
    it("should handle a tree with no children", () => {
      const simpleNode: Node<"children"> = {
        id: "simple",
        name: "Simple Node",
      }

      const path = getPath(simpleNode, {
        childrenKey: "children",
        testFn: (node) => node.id === "simple",
      })

      expect(path).toBeDefined()
      expect(path?.length).toBe(1)
      expect(path?.[0].id).toBe("simple")
    })

    it("should handle empty children arrays", () => {
      const nodeWithEmptyChildren: Node<"children"> = {
        id: "parent",
        name: "Parent",
        children: [],
      }

      const path = getPath(nodeWithEmptyChildren, {
        childrenKey: "children",
        testFn: (node) => node.id === "parent",
      })

      expect(path).toBeDefined()
      expect(path?.length).toBe(1)
      expect(path?.[0].id).toBe("parent")
    })

    it("should use a deep copy when copy option is true", () => {
      const originalTree: Node<"children"> = {
        id: "root",
        name: "Root",
        children: [
          {
            id: "child",
            name: "Child",
          },
        ],
      }

      // Using copy option to create a deep copy
      const path = getPath(originalTree, {
        childrenKey: "children",
        testFn: (node) => node.id === "child",
        copy: true,
      })

      expect(path).toBeDefined()
      expect(path?.[1].id).toBe("child")

      // The path should contain a deep copy of the nodes
      if (path) {
        // Modify the original tree
        if (originalTree.children) {
          originalTree.children[0].name = "Modified Child"
        }

        // The path should still have the original name
        expect(path[1].name).toBe("Child")
      }
    })
  })

  describe("error handling", () => {
    it("should throw an error when a circular reference is detected", () => {
      // Create a tree with a circular reference
      const circularTree: Node<"children"> = {
        id: "root",
        name: "Root",
        children: [
          {
            id: "child",
            name: "Child",
            children: [],
          },
        ],
      }

      // Create a circular reference
      if (circularTree.children) {
        // @ts-ignore - Creating circular reference for testing
        circularTree.children[0].children.push(circularTree)
      }

      expect(() => {
        getPath(circularTree, {
          childrenKey: "children",
          testFn: (node) => node.id === "nonexistent",
        })
      }).toThrow("Circular reference detected")
    })
  })

  // Additional test for different childrenKey
  describe("with custom childrenKey", () => {
    const menuTree: Node<"items"> = {
      id: "menu",
      label: "Main Menu",
      items: [
        {
          id: "file",
          label: "File",
          items: [
            {
              id: "new",
              label: "New",
            },
            {
              id: "open",
              label: "Open",
            },
          ],
        },
        {
          id: "edit",
          label: "Edit",
          items: [
            {
              id: "copy",
              label: "Copy",
            },
          ],
        },
      ],
    }

    it("should work with a different childrenKey", () => {
      const path = getPath(menuTree, {
        childrenKey: "items",
        testFn: (node) => node.id === "copy",
      })

      expect(path).toBeDefined()
      expect(path?.length).toBe(3)
      expect(path?.[0].id).toBe("menu")
      expect(path?.[1].id).toBe("edit")
      expect(path?.[2].id).toBe("copy")
    })
  })

  type TestNode = Node<"children", { id: string }>

  describe("getPath", () => {
    const tree: TestNode = {
      id: "root",
      children: [
        {
          id: "a",
          children: [{ id: "a1" }, { id: "a2" }],
        },
        {
          id: "b",
          children: [
            {
              id: "b1",
              children: [{ id: "b1a" }, { id: "b1b" }],
            },
          ],
        },
      ],
    }

    it("finds the correct path to a deep node", () => {
      const path = getPath(tree, {
        childrenKey: "children",
        testFn: (node) => node.id === "b1b",
      })
      expect(path?.map((n) => n.id)).toEqual(["root", "b", "b1", "b1b"])
    })

    it("returns undefined if node is not found", () => {
      const path = getPath(tree, {
        childrenKey: "children",
        testFn: (node) => node.id === "nonexistent",
      })
      expect(path).toBeUndefined()
    })

    it("finds root node if it matches", () => {
      const path = getPath(tree, {
        childrenKey: "children",
        testFn: (node) => node.id === "root",
      })
      expect(path?.map((n) => n.id)).toEqual(["root"])
    })

    it("handles nodes without children gracefully", () => {
      const flatTree: TestNode = { id: "solo" }
      const path = getPath(flatTree, {
        childrenKey: "children",
        testFn: (node) => node.id === "solo",
      })
      expect(path?.map((n) => n.id)).toEqual(["solo"])
    })

    it("uses deep copy if copy option is true", () => {
      const spy = jest.spyOn(global, "structuredClone")

      const path = getPath(tree, {
        childrenKey: "children",
        testFn: (node) => node.id === "a2",
        copy: true,
      })

      expect(path?.map((n) => n.id)).toEqual(["root", "a", "a2"])
      expect(spy).toHaveBeenCalled()
      spy.mockRestore()
    })

    it("does not mutate original tree when copy is false", () => {
      const originalTree = JSON.parse(JSON.stringify(tree)) // Clone for safety

      getPath(originalTree, {
        childrenKey: "children",
        testFn: (node) => node.id === "a2",
        copy: false,
      })

      expect(originalTree).toEqual(tree) // No mutation
    })
  })
})
