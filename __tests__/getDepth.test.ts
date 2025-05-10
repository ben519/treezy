import { getDepth } from "../src/getDepth"
import { Node } from "../src/types"

describe("getDepth", () => {
  // Test case 1: Empty tree (single node)
  test("returns 0 for a single node with no children", () => {
    const singleNode: Node<"children"> = { value: "single", children: [] }
    expect(getDepth(singleNode, { childrenKey: "children" })).toBe(0)
  })

  // Test case 2: Tree with one level of children
  test("returns 1 for a tree with one level of children", () => {
    const simpleTree: Node<"children"> = {
      value: "root",
      children: [
        { value: "child1", children: [] },
        { value: "child2", children: [] },
      ],
    }
    expect(getDepth(simpleTree, { childrenKey: "children" })).toBe(1)
  })

  // Test case 3: Tree with multiple levels
  test("returns correct depth for a tree with multiple levels", () => {
    const multiLevelTree: Node<"children"> = {
      value: "root",
      children: [
        {
          value: "child1",
          children: [
            { value: "grandchild1", children: [] },
            {
              value: "grandchild2",
              children: [{ value: "great-grandchild", children: [] }],
            },
          ],
        },
        { value: "child2", children: [] },
      ],
    }
    expect(getDepth(multiLevelTree, { childrenKey: "children" })).toBe(3)
  })

  // Test case 4: Testing with a custom childrenKey
  test("works with a custom childrenKey", () => {
    const treeWithCustomKey = {
      value: "root",
      subItems: [
        { value: "child1", subItems: [] },
        {
          value: "child2",
          subItems: [{ value: "grandchild", subItems: [] }],
        },
      ],
    }
    expect(getDepth(treeWithCustomKey, { childrenKey: "subItems" })).toBe(2)
  })

  // Test case 5: Unbalanced tree
  test("returns the maximum depth from an unbalanced tree", () => {
    const unbalancedTree: Node<"children"> = {
      value: "root",
      children: [
        { value: "short-branch", children: [] },
        {
          value: "medium-branch",
          children: [{ value: "leaf", children: [] }],
        },
        {
          value: "long-branch",
          children: [
            {
              value: "intermediate1",
              children: [
                {
                  value: "intermediate2",
                  children: [{ value: "deep-leaf", children: [] }],
                },
              ],
            },
          ],
        },
      ],
    }
    expect(getDepth(unbalancedTree, { childrenKey: "children" })).toBe(4)
  })

  // Test case 6: Node with undefined children
  test("handles a node with undefined children", () => {
    const nodeWithUndefinedChildren: Node<"children"> = {
      value: "root",
      children: undefined,
    }
    expect(
      getDepth(nodeWithUndefinedChildren, { childrenKey: "children" })
    ).toBe(0)
  })

  // Test case 7: A more complex tree with mixed depth paths
  test("calculates correct depth in a complex tree with various path lengths", () => {
    const complexTree: Node<"children"> = {
      value: "root",
      children: [
        // Path 1: depth 1
        { value: "leaf1", children: [] },
        // Path 2: depth 2
        {
          value: "branch1",
          children: [{ value: "leaf2", children: [] }],
        },
        // Path 3: depth 3
        {
          value: "branch2",
          children: [
            {
              value: "subbranch1",
              children: [{ value: "leaf3", children: [] }],
            },
            { value: "leaf4", children: [] },
          ],
        },
        // Path 4: depth 2 (different from path 2)
        {
          value: "branch3",
          children: [{ value: "leaf5", children: [] }],
        },
      ],
    }
    expect(getDepth(complexTree, { childrenKey: "children" })).toBe(3)
  })

  // Test case 8: Edge case - empty tree
  test("handles empty tree gracefully", () => {
    const emptyNode: any = {} // This doesn't match the Node interface but tests robustness
    expect(() => getDepth(emptyNode, { childrenKey: "children" })).not.toThrow()
  })

  // Test case 9: Deeply nested single-path tree
  test("correctly measures a deeply nested single-path tree", () => {
    // Create a tree with a single path 10 levels deep
    let deepTree: Node<"children"> = { value: "leaf", children: [] }

    // Build the tree from bottom up
    for (let i = 9; i >= 0; i--) {
      deepTree = {
        value: `level-${i}`,
        children: [deepTree],
      }
    }

    expect(getDepth(deepTree, { childrenKey: "children" })).toBe(10)
  })

  // --- Tests for Circular References ---

  // Test case 10: Direct self-reference
  test("throws 'Circular reference detected' for a direct self-reference", () => {
    const circularNode: Node<"children"> = { value: "circular", children: [] }
    // @ts-ignore - Intentionally creating a circular reference for testing
    circularNode.children.push(circularNode)

    expect(() => getDepth(circularNode, { childrenKey: "children" })).toThrow(
      "Circular reference detected"
    )
  })

  // Test case 11: Child references parent
  test("throws 'Circular reference detected' when a child references its parent", () => {
    const root: Node<"children"> = { value: "root", children: [] }
    const child: Node<"children"> = { value: "child", children: [] }
    root.children!.push(child)
    // @ts-ignore - Intentionally creating a circular reference for testing
    child.children.push(root)

    expect(() => getDepth(root, { childrenKey: "children" })).toThrow(
      "Circular reference detected"
    )
  })

  // Test case 12: Grandchild references grandparent
  test("throws 'Circular reference detected' when a grandchild references a grandparent", () => {
    const root: Node<"children"> = { value: "root", children: [] }
    const child: Node<"children"> = { value: "child", children: [] }
    const grandchild: Node<"children"> = { value: "grandchild", children: [] }
    root.children!.push(child)
    child.children!.push(grandchild)
    // @ts-ignore - Intentionally creating a circular reference for testing
    grandchild.children.push(root)

    expect(() => getDepth(root, { childrenKey: "children" })).toThrow(
      "Circular reference detected"
    )
  })

  // Test case 13: Circular reference within a deeper branch
  test("throws 'Circular reference detected' for a circular reference in a deeper branch", () => {
    const root: Node<"children"> = {
      value: "root",
      children: [
        { value: "child1", children: [] },
        { value: "child2", children: [] },
      ],
    }
    const branchNode: Node<"children"> = { value: "branch", children: [] }
    const circularNode: Node<"children"> = { value: "circular", children: [] }

    root.children!.push(branchNode)
    branchNode.children!.push(circularNode)
    // @ts-ignore - Intentionally creating a circular reference for testing
    circularNode.children.push(branchNode) // circular reference back to branchNode

    expect(() => getDepth(root, { childrenKey: "children" })).toThrow(
      "Circular reference detected"
    )
  })

  // Test case 14: Circular reference across different branches
  test("throws 'Circular reference detected' for a circular reference across branches", () => {
    const root: Node<"children"> = { value: "root", children: [] }
    const branchA: Node<"children"> = { value: "branchA", children: [] }
    const branchB: Node<"children"> = { value: "branchB", children: [] }
    const nodeA: Node<"children"> = { value: "nodeA", children: [] }
    const nodeB: Node<"children"> = { value: "nodeB", children: [] }

    root.children!.push(branchA, branchB)
    branchA.children!.push(nodeA)
    branchB.children!.push(nodeB)
    // @ts-ignore - Creating a cycle: nodeA -> nodeB -> nodeA
    nodeA.children.push(nodeB)
    // @ts-ignore - Creating a cycle: nodeA -> nodeB -> nodeA
    nodeB.children.push(nodeA)

    expect(() => getDepth(root, { childrenKey: "children" })).toThrow(
      "Circular reference detected"
    )
  })

  // Test case 15: Root references itself
  test("throws 'Circular reference detected' when the root node references itself", () => {
    const root: Node<"children"> = { value: "root", children: [] }
    // @ts-ignore - Intentionally creating a circular reference for testing
    root.children.push(root)

    expect(() => getDepth(root, { childrenKey: "children" })).toThrow(
      "Circular reference detected"
    )
  })
})
