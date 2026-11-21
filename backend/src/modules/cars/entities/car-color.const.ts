// Fixed colour codes (§9.2). Thai labels live in the frontend.
// The DB CHECK (ck_cars_color) holds the same list; changing it needs a new migration.
export const CAR_COLORS = [
  'white',
  'black',
  'silver',
  'gray',
  'red',
  'blue',
  'green',
  'yellow',
  'orange',
  'brown',
  'gold',
  'other',
] as const;

export type CarColor = (typeof CAR_COLORS)[number];
