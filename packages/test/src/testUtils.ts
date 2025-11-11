import { expect } from "vitest";

export const expectToEqual = <T>(actual: T, expected: T): void => {
  expect(actual).toEqual(expected);
};
