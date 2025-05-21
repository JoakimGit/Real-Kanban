type PositionObj = { position: number };

export const orderByPosition = <T extends PositionObj>(a: T, b: T) =>
  a.position - b.position;
