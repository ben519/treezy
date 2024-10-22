export const tree1 = {
  id: 1,
  children: [],
}

export const tree2 = {
  id: 1,
  children: [
    { id: 2, children: [] },
    { id: 3, children: [] },
  ],
}

export const tree3 = {
  id: 1,
  children: [{ id: 3, children: [] }],
}

export const tree4 = {
  id: 1,
  children: [
    { id: 2, children: [] },
    { id: 3, children: [{ id: 4, children: [] }] },
  ],
}

export const tree5 = {
  id: 1,
  children: [
    {
      id: 2,
      children: [
        { id: 6, children: [] },
        { id: 7, children: [] },
      ],
    },
    { id: 3, children: [{ id: 8, children: [] }] },
    {
      id: 4,
      children: [
        { id: 9, children: [] },
        { id: 10, children: [{ id: 11, children: [] }] },
      ],
    },
  ],
}

export const tree6 = {
  id: 1,
  children: [
    {
      id: 2,
      children: [
        {
          id: 3,
          children: [
            { id: 6, children: [] },
            { id: 7, children: [] },
          ],
        },
        { id: 4, children: [{ id: 8, children: [] }] },
      ],
    },
    {
      id: 5,
      children: [
        {
          id: 9,
          children: [
            { id: 10, children: [] },
            { id: 11, children: [{ id: 12, children: [] }] },
          ],
        },
        { id: 13, children: [] },
      ],
    },
  ],
}

export const tree7 = {
  id: 1,
  color: "red",
  children: [],
}

export const tree8 = {
  id: 1,
  color: "red",
  children: [
    { id: 2, color: "green", isNew: true, children: [] },
    { id: 3, color: "red", children: [] },
  ],
}