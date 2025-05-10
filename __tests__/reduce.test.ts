import { reduce } from "../src/reduce"
import { Node, UniformNode } from "../src/types"

describe("reduce function", () => {
  // Test case 1: Simple tree with default children key
  test("should correctly reduce a simple tree with default children key", () => {
    const simpleTree: Node<"children"> = {
      value: 1,
      children: [
        { value: 2 },
        {
          value: 3,
          children: [{ value: 4 }],
        },
      ],
    }

    const result = reduce(simpleTree, {
      childrenKey: "children",
      reduceFn: (node, acc) => acc + (node.value as number),
      initialVal: 0,
    })

    expect(result).toBe(10) // 1 + 2 + 3 + 4 = 10
  })

  // Test case 2: Custom children key
  test("should correctly reduce a tree with custom children key", () => {
    const treeWithCustomKey: Node<"items"> = {
      value: 5,
      items: [
        { value: 10 },
        {
          value: 15,
          items: [{ value: 20 }],
        },
      ],
    }

    const result = reduce(treeWithCustomKey, {
      reduceFn: (node, acc) => acc + (node.value as number),
      initialVal: 0,
      childrenKey: "items",
    })

    expect(result).toBe(50) // 5 + 10 + 15 + 20 = 50
  })

  // Test case 3: Using parent reference
  test("should provide parent node reference to the reducer function", () => {
    const tree: Node<"children"> = {
      id: "root",
      children: [
        { id: "child1" },
        {
          id: "child2",
          children: [{ id: "grandchild" }],
        },
      ],
    }

    const paths: string[] = []

    reduce(tree, {
      childrenKey: "children",
      reduceFn: (node, acc, parent) => {
        const currentId = node.id as string
        const parentId = parent ? (parent.id as string) : "null"
        paths.push(`${currentId} -> ${parentId}`)
        return acc
      },
      initialVal: null,
    })

    expect(paths).toEqual([
      "root -> null",
      "child1 -> root",
      "child2 -> root",
      "grandchild -> child2",
    ])
  })

  // Test case 4: Using depth parameter
  test("should provide correct depth to the reducer function", () => {
    const tree: Node<"children"> = {
      level: "root",
      children: [
        { level: "level1-1" },
        {
          level: "level1-2",
          children: [{ level: "level2" }],
        },
      ],
    }

    const depthMap: Record<string, number> = {}

    reduce(tree, {
      childrenKey: "children",
      reduceFn: (node, acc, _parent, depth = 0) => {
        depthMap[node.level as string] = depth
        return acc
      },
      initialVal: null,
    })

    expect(depthMap).toEqual({
      root: 0,
      "level1-1": 1,
      "level1-2": 1,
      level2: 2,
    })
  })

  // Test case 5: Accumulating values with complex logic
  test("should accumulate values with complex reducer logic", () => {
    const fileSystem: Node<"children"> = {
      name: "root",
      type: "dir",
      size: 0,
      children: [
        { name: "file1.txt", type: "file", size: 100 },
        {
          name: "dir1",
          type: "dir",
          size: 0,
          children: [
            { name: "file2.txt", type: "file", size: 200 },
            { name: "file3.txt", type: "file", size: 300 },
          ],
        },
        {
          name: "dir2",
          type: "dir",
          size: 0,
          children: [{ name: "file4.txt", type: "file", size: 400 }],
        },
      ],
    }

    const totalSize = reduce(fileSystem, {
      childrenKey: "children",
      reduceFn: (node, acc) => {
        if (node.type === "file") {
          return acc + (node.size as number)
        }
        return acc
      },
      initialVal: 0,
    })

    expect(totalSize).toBe(1000) // 100 + 200 + 300 + 400 = 1000
  })

  // Test case 6: Testing UniformNode with extra properties
  test("should work with UniformNode containing extra properties", () => {
    interface FileSystemNode {
      name: string
      type: "file" | "dir"
      size: number
    }

    const fileSystem: UniformNode<"children", FileSystemNode> = {
      name: "root",
      type: "dir",
      size: 0,
      children: [
        { name: "file1.txt", type: "file", size: 100 },
        {
          name: "dir1",
          type: "dir",
          size: 0,
          children: [{ name: "file2.txt", type: "file", size: 200 }],
        },
      ],
    }

    const fileCount = reduce(fileSystem, {
      childrenKey: "children",
      reduceFn: (node, acc) => {
        if (node.type === "file") {
          return acc + 1
        }
        return acc
      },
      initialVal: 0,
    })

    expect(fileCount).toBe(2) // Two files in the tree
  })

  // Test case 7: Empty tree
  test("should handle empty tree correctly", () => {
    const emptyTree: Node<"children"> = { value: 5 } // No children

    const result = reduce(emptyTree, {
      childrenKey: "children",
      reduceFn: (node, acc) => acc + (node.value as number),
      initialVal: 0,
    })

    expect(result).toBe(5) // Just the root value
  })

  // Test case 8: Using initialVal other than numbers
  test("should work with non-numeric initialVal", () => {
    const familyTree: Node<"children"> = {
      name: "Grandparent",
      generation: 1,
      children: [
        {
          name: "Parent1",
          generation: 2,
          children: [
            { name: "Child1", generation: 3 },
            { name: "Child2", generation: 3 },
          ],
        },
        { name: "Parent2", generation: 2 },
      ],
    }

    const namesByGeneration = reduce(familyTree, {
      childrenKey: "children",
      reduceFn: (node, acc) => {
        const generation = node.generation as number
        const name = node.name as string

        if (!acc[generation]) {
          acc[generation] = []
        }

        acc[generation].push(name)
        return acc
      },
      initialVal: {} as Record<number, string[]>,
    })

    expect(namesByGeneration).toEqual({
      1: ["Grandparent"],
      2: ["Parent1", "Parent2"],
      3: ["Child1", "Child2"],
    })
  })

  // Test case 9: Multiple property accumulation
  test("should allow accumulating multiple properties", () => {
    interface Employee {
      name: string
      salary: number
      department: string
    }

    const orgChart: UniformNode<"reports", Employee> = {
      name: "CEO",
      salary: 200000,
      department: "Executive",
      reports: [
        {
          name: "CTO",
          salary: 180000,
          department: "Tech",
          reports: [
            { name: "Dev1", salary: 100000, department: "Tech" },
            { name: "Dev2", salary: 110000, department: "Tech" },
          ],
        },
        {
          name: "CFO",
          salary: 180000,
          department: "Finance",
          reports: [
            { name: "Accountant", salary: 90000, department: "Finance" },
          ],
        },
      ],
    }

    interface Stats {
      totalSalary: number
      departmentCount: Record<string, number>
      employeeCount: number
    }

    const companyStats = reduce(orgChart, {
      reduceFn: (node, acc) => {
        // Update stats
        acc.totalSalary += node.salary
        acc.employeeCount += 1

        if (!acc.departmentCount[node.department]) {
          acc.departmentCount[node.department] = 0
        }
        acc.departmentCount[node.department] += 1

        return acc
      },
      initialVal: {
        totalSalary: 0,
        departmentCount: {},
        employeeCount: 0,
      } as Stats,
      childrenKey: "reports",
    })

    expect(companyStats).toEqual({
      totalSalary: 860000,
      departmentCount: {
        Executive: 1,
        Tech: 3,
        Finance: 2,
      },
      employeeCount: 6,
    })
  })

  describe("reduce function - Circular Reference Detection", () => {
    // Test case 10: Direct circular reference (node is its own child)
    test("should throw 'Circular reference detected' for a direct self-referencing cycle", () => {
      const circularTree: any = {
        value: 1,
        children: [],
      }
      circularTree.children.push(circularTree) // Node points to itself

      expect(() =>
        reduce(circularTree, {
          childrenKey: "children",
          reduceFn: (node, acc) => acc + (node.value as number),
          initialVal: 0,
        })
      ).toThrow("Circular reference detected")
    })

    // Test case 11: Circular reference to an ancestor (child points to parent)
    test("should throw 'Circular reference detected' for a child referencing its parent", () => {
      const parentNode: any = {
        value: 1,
        children: [],
      }
      const childNode: any = {
        value: 2,
        children: [],
      }
      parentNode.children.push(childNode)
      childNode.children.push(parentNode) // Child points back to parent

      expect(() =>
        reduce(parentNode, {
          childrenKey: "children",
          reduceFn: (node, acc) => acc + (node.value as number),
          initialVal: 0,
        })
      ).toThrow("Circular reference detected")
    })

    // Test case 12: Deeper circular reference to an ancestor (grandchild points to grandparent)
    test("should throw 'Circular reference detected' for a grandchild referencing its grandparent", () => {
      const grandparentNode: any = {
        value: 1,
        children: [],
      }
      const parentNode: any = {
        value: 2,
        children: [],
      }
      const childNode: any = {
        value: 3,
        children: [],
      }
      grandparentNode.children.push(parentNode)
      parentNode.children.push(childNode)
      childNode.children.push(grandparentNode) // Grandchild points back to grandparent

      expect(() =>
        reduce(grandparentNode, {
          childrenKey: "children",
          reduceFn: (node, acc) => acc + (node.value as number),
          initialVal: 0,
        })
      ).toThrow("Circular reference detected")
    })

    // Test case 13: Circular reference involving a sibling's descendant
    test("should throw 'Circular reference detected' for a cycle involving a sibling's descendant", () => {
      const root: any = { value: 1, children: [] }
      const child1: any = { value: 2, children: [] }
      const child2: any = { value: 3, children: [] }
      const grandchild1: any = { value: 4, children: [] }

      root.children.push(child1, child2)
      child1.children.push(grandchild1)
      child2.children.push(grandchild1) // child2 points to grandchild of child1 - NOT a cycle in itself, but building up to it.

      // To create a cycle: grandchild1 now points back to the root
      grandchild1.children.push(root)

      expect(() =>
        reduce(root, {
          childrenKey: "children",
          reduceFn: (node, acc) => acc + (node.value as number),
          initialVal: 0,
        })
      ).toThrow("Circular reference detected")
    })

    // Test case 14: Complex circular reference path
    test("should throw 'Circular reference detected' for a complex circular path", () => {
      const nodeA: any = { value: "A", children: [] }
      const nodeB: any = { value: "B", children: [] }
      const nodeC: any = { value: "C", children: [] }
      const nodeD: any = { value: "D", children: [] }

      nodeA.children.push(nodeB)
      nodeB.children.push(nodeC)
      nodeC.children.push(nodeD)
      nodeD.children.push(nodeB) // D points back to B, creating a cycle A -> B -> C -> D -> B

      expect(() =>
        reduce(nodeA, {
          childrenKey: "children",
          reduceFn: (node, acc) => acc + node.value,
          initialVal: "",
        })
      ).toThrow("Circular reference detected")
    })
  })
})
