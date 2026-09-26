
export const round2 = (value: number): number => {
  return Math.round((value + Number.EPSILON) * 100) / 100;
};

export const randomRate = (min: number, max: number): number => {
  return round2(Math.random() * (max - min) + min);
};

export const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
