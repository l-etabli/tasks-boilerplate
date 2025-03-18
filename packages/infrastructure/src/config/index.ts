import * as pulumi from "@pulumi/pulumi";

// Get stack-specific config
const config = new pulumi.Config();

interface ProjectConfig {
  projectName: string;
  framework: string;
  rootDirectory: string;
  buildCommand?: string;
  outputDirectory?: string;
}

export const frontendConfig: ProjectConfig = {
  projectName: "tasks-front",
  framework: "vite",
  rootDirectory: "apps/front",
  buildCommand: "pnpm build",
  outputDirectory: "dist",
};

export const backendConfig: ProjectConfig = {
  projectName: "tasks-back",
  framework: "node",
  rootDirectory: "apps/back",
  buildCommand: "pnpm build",
  outputDirectory: "dist",
};
