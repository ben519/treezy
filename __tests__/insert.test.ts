import { insert } from "../src/insert"
import { Node, UniformNode } from "../src/types"

describe("insert function", () => {
  // Test basic generic node insertion
  describe("with generic nodes", () => {
    test('should insert node below when direction is "below"', () => {
      // Setup
      const tree: Node = {
        id: "root",
        children: [{ id: "child1" }, { id: "child2" }],
      }

      const nodeToInsert: Node = { id: "new-node" }

      // Execute
      const result = insert(tree, {
        childrenKey: "children",
        nodeToInsert,
        testFn: (node) => node.id === "child1",
        direction: "below",
      })

      // Assert
      expect(result).toBeDefined()
      expect(result?.children?.[0].children).toEqual([nodeToInsert])
    })

    test('should insert node after when direction is "after"', () => {
      // Setup
      const tree: Node = {
        id: "root",
        children: [{ id: "child1" }, { id: "child2" }],
      }

      const nodeToInsert: Node = { id: "new-node" }

      // Execute
      const result = insert(tree, {
        childrenKey: "children",
        nodeToInsert,
        testFn: (node) => node.id === "child1",
        direction: "after",
      })

      // Assert
      expect(result).toBeDefined()
      expect(result?.children).toEqual([
        { id: "child1" },
        { id: "new-node" },
        { id: "child2" },
      ])
    })

    test('should insert node before when direction is "before"', () => {
      // Setup
      const tree: Node = {
        id: "root",
        children: [{ id: "child1" }, { id: "child2" }],
      }

      const nodeToInsert: Node = { id: "new-node" }

      // Execute
      const result = insert(tree, {
        childrenKey: "children",
        nodeToInsert,
        testFn: (node) => node.id === "child2",
        direction: "before",
      })

      // Assert
      expect(result).toBeDefined()
      expect(result?.children).toEqual([
        { id: "child1" },
        { id: "new-node" },
        { id: "child2" },
      ])
    })

    test("should create children array if it does not exist when inserting below", () => {
      // Setup
      const tree: Node = {
        id: "root",
        children: [{ id: "child1" }],
      }

      const nodeToInsert: Node = { id: "new-node" }

      // Execute
      const result = insert(tree, {
        childrenKey: "children",
        nodeToInsert,
        testFn: (node) => node.id === "child1",
        direction: "below",
      })

      // Assert
      expect(result).toBeDefined()
      expect(result?.children?.[0].children).toEqual([nodeToInsert])
    })

    test("should use custom children key", () => {
      // Setup
      interface CustomNode extends Node<"items"> {
        id: string
        items?: CustomNode[]
      }

      const tree: CustomNode = {
        id: "root",
        items: [{ id: "child1" }, { id: "child2" }],
      }

      const nodeToInsert: CustomNode = { id: "new-node" }

      // Execute
      const result = insert(tree, {
        nodeToInsert,
        testFn: (node) => node.id === "child1",
        direction: "below",
        childrenKey: "items",
      })

      // Assert
      expect(result).toBeDefined()
      expect(result?.items?.[0].items).toEqual([nodeToInsert])
    })

    test("should search deeply nested nodes", () => {
      // Setup
      const tree: Node = {
        id: "root",
        children: [
          {
            id: "child1",
            children: [
              {
                id: "grandchild1",
                children: [{ id: "great-grandchild1" }],
              },
            ],
          },
        ],
      }

      const nodeToInsert: Node = { id: "new-node" }

      // Execute
      const result = insert(tree, {
        childrenKey: "children",
        nodeToInsert,
        testFn: (node) => node.id === "great-grandchild1",
        direction: "below",
      })

      // Assert
      expect(result).toBeDefined()
      const greatGrandchild = result?.children?.[0].children?.[0].children?.[0]
      expect(greatGrandchild?.children).toEqual([nodeToInsert])
    })

    test("should return undefined if no matching node is found", () => {
      // Setup
      const tree: Node = {
        id: "root",
        children: [{ id: "child1" }, { id: "child2" }],
      }

      const nodeToInsert: Node = { id: "new-node" }

      // Execute
      const result = insert(tree, {
        childrenKey: "children",
        nodeToInsert,
        testFn: (node) => node.id === "non-existent",
        direction: "below",
      })

      // Assert
      expect(result).toBeUndefined()
    })

    test("should copy tree when copy option is true", () => {
      // Setup
      const tree: Node = {
        id: "root",
        children: [{ id: "child1" }],
      }

      const nodeToInsert: Node = { id: "new-node" }

      // Execute
      const result = insert(tree, {
        childrenKey: "children",
        nodeToInsert,
        testFn: (node) => node.id === "child1",
        direction: "below",
        copy: true,
      })

      // Assert
      expect(result).toBeDefined()
      expect(result).not.toBe(tree) // Should be a different object reference
      expect(result?.children?.[0].children).toEqual([nodeToInsert])
      expect(tree.children?.[0].children).toBeUndefined() // Original should be unchanged
    })

    test("should throw error when trying to insert before/after root", () => {
      // Setup
      const tree: Node = {
        id: "root",
        children: [{ id: "child1" }],
      }

      const nodeToInsert: Node = { id: "new-node" }

      // Execute & Assert
      expect(() => {
        insert(tree, {
          childrenKey: "children",
          nodeToInsert,
          testFn: (node) => node.id === "root",
          direction: "after",
        })
      }).toThrow("Cannot insert 'nodeToInsert' before the root of 'node'")
    })
  })

  // Test uniform node insertion
  describe("with uniform nodes", () => {
    interface MyNode
      extends UniformNode<"children", { id: string; value?: number }> {
      id: string
      value?: number
      children?: MyNode[]
    }

    test("should insert uniform node with proper typing", () => {
      // Setup
      const tree: MyNode = {
        id: "root",
        value: 1,
        children: [
          { id: "child1", value: 2 },
          { id: "child2", value: 3 },
        ],
      }

      const nodeToInsert: MyNode = { id: "new-node", value: 4 }

      // Execute
      const result = insert(tree, {
        childrenKey: "children",
        nodeToInsert,
        testFn: (node) => node.id === "child1",
        direction: "below",
      })

      // Assert
      expect(result).toBeDefined()
      expect(result?.children?.[0].children).toEqual([nodeToInsert])

      // Type safety check - accessing properties specific to MyNode
      expect(result?.children?.[0].children?.[0].value).toBe(4)
    })

    test("should use testFn with parent and depth parameters", () => {
      // Setup
      const tree: MyNode = {
        id: "root",
        value: 1,
        children: [
          {
            id: "child1",
            value: 2,
            children: [{ id: "grandchild1", value: 3 }],
          },
        ],
      }

      const nodeToInsert: MyNode = { id: "new-node", value: 4 }

      // Execute
      const result = insert(tree, {
        childrenKey: "children",
        nodeToInsert,
        testFn: (node, parent, depth) => {
          return parent?.id === "child1" && depth === 2
        },
        direction: "after",
      })

      // Assert
      expect(result).toBeDefined()
      expect(result?.children?.[0].children).toEqual([
        { id: "grandchild1", value: 3 },
        { id: "new-node", value: 4 },
      ])
    })
  })

  // Test default options
  describe("default options", () => {
    test('should use default direction "below" when not specified', () => {
      // Setup
      const tree: Node = {
        id: "root",
        children: [{ id: "child1" }],
      }

      const nodeToInsert: Node = { id: "new-node" }

      // Execute
      const result = insert(tree, {
        childrenKey: "children",
        nodeToInsert,
        testFn: (node) => node.id === "child1",
        // direction is omitted
      })

      // Assert
      expect(result).toBeDefined()
      expect(result?.children?.[0].children).toEqual([nodeToInsert])
    })

    test("should use default testFn when not specified", () => {
      // Setup
      const tree: Node = {
        id: "root",
        children: [{ id: "child1" }],
      }

      const nodeToInsert: Node = { id: "new-node" }

      // Execute
      const result = insert(tree, {
        childrenKey: "children",
        nodeToInsert,
        // testFn is omitted - should match root by default
      })

      // Assert
      expect(result).toBeDefined()
      expect(result?.children).toContain(nodeToInsert)
    })

    test('should use default childrenKey "children" when not specified', () => {
      // Setup
      const tree: Node = {
        id: "root",
        children: [{ id: "child1" }],
      }

      const nodeToInsert: Node = { id: "new-node" }

      // Execute
      const result = insert(tree, {
        childrenKey: "children",
        nodeToInsert,
        testFn: (node) => node.id === "child1",
        // childrenKey is omitted
      })

      // Assert
      expect(result).toBeDefined()
      expect(result?.children?.[0].children).toEqual([nodeToInsert])
    })
  })

  // Edge cases
  describe("edge cases", () => {
    test("should handle empty children array", () => {
      // Setup
      const tree: Node = {
        id: "root",
        children: [],
      }

      const nodeToInsert: Node = { id: "new-node" }

      // Execute
      const result = insert(tree, {
        childrenKey: "children",
        nodeToInsert,
        testFn: (node) => node.id === "root",
        direction: "below",
      })

      // Assert
      expect(result).toBeDefined()
      expect(result?.children).toEqual([nodeToInsert])
    })

    test("should handle undefined children property", () => {
      // Setup
      const tree: Node = {
        id: "root",
        // children is undefined
      }

      const nodeToInsert: Node = { id: "new-node" }

      // Execute
      const result = insert(tree, {
        childrenKey: "children",
        nodeToInsert,
        testFn: (node) => node.id === "root",
        direction: "below",
      })

      // Assert
      expect(result).toBeDefined()
      expect(result?.children).toEqual([nodeToInsert])
    })
  })
})
