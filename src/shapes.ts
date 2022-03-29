export type Vertex2D = { x: number; y: number };

const defaultShape: Vertex2D[] = [
  { x: 0, y: 0 },
  { x: 3, y: -3 },
  { x: 0, y: 6 },
  { x: -3, y: -3 },
];

const triangleShape: Vertex2D[] = [
  { x: 3, y: 0 },
  { x: 0, y: 6 },
  { x: -3, y: 0 },
];

export const BuiltInShapes = {
  Default: defaultShape,
  Triangle: triangleShape,
} as const;

export function degToRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Rotate a 2D vertex of X degrees. Assuming the Vertex is centered.
 */
function rotateVertex(vtx: Vertex2D, deg: number): Vertex2D {
  const newVtx: Vertex2D = { x: 0, y: 0 };
  const radius = Math.sqrt(Math.pow(vtx.x, 2) + Math.pow(vtx.y, 2));

  const ang = Math.atan2(vtx.x, vtx.y);

  newVtx.x = Math.sin(degToRad(deg) + ang) * radius;
  newVtx.y = Math.cos(degToRad(deg) + ang) * radius;

  return newVtx;
}

export function rotateShape(vertices: Vertex2D[], deg: number): Vertex2D[] {
  const newShape: Vertex2D[] = [];

  for (let i = 0; i < vertices.length; i++) {
    const vertice = vertices[i];

    if (vertice) newShape[i] = rotateVertex(vertice, deg);
  }

  return newShape;
}

export function resizeShape(vertices: Vertex2D[], size: number): Vertex2D[] {
  const newShape: Vertex2D[] = [];

  for (let i = 0; i < vertices.length; i++) {
    const vertice = vertices[i];

    if (vertice) {
      const vtx: Vertex2D = { x: vertice.x, y: vertice.y };
      vtx.x *= size;
      vtx.y *= size;
      newShape[i] = vtx;
    }
  }

  return newShape;
}
