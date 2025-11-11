import { expect } from "vitest";

export const expectToEqual = <T>(actual: T, expected: T): void => {
  expect(actual).toEqual(expected);
};

export const expectToThrow = <T>(callback: () => Promise<T>, message: string): void => {
  expect(callback).rejects.toThrow(message);
};
