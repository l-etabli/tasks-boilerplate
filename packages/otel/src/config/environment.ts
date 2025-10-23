export type Environment = "development" | "staging" | "production";

export const detectEnvironment = (): Environment => {
  const nodeEnv = process.env.NODE_ENV || "development";

  if (nodeEnv === "production") {
    return "production";
  }

  if (nodeEnv === "staging") {
    return "staging";
  }

  return "development";
};

export const isProduction = (): boolean => {
  return detectEnvironment() === "production";
};

export const isDevelopment = (): boolean => {
  return detectEnvironment() === "development";
};
