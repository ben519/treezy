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
    expect(() => getDepth(emptyNode)).not.toThrow()
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
})
