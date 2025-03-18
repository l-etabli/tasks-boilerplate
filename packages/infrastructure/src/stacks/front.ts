import * as pulumi from "@pulumi/pulumi";
import * as vercel from "@pulumiverse/vercel";
import { frontendConfig } from "../config";

export class FrontendStack extends pulumi.ComponentResource {
  public readonly project: vercel.Project;
  public readonly deployment: vercel.Deployment;

  constructor(name: string, opts?: pulumi.ComponentResourceOptions) {
    super("tasks:frontend", name, {}, opts);

    // Create a new Vercel project
    this.project = new vercel.Project("frontend-project", {
      name: frontendConfig.projectName,
      framework: frontendConfig.framework,
      rootDirectory: frontendConfig.rootDirectory,
      // Next.js build command and output directory will be automatically detected
    });

    // Create a new deployment
    this.deployment = new vercel.Deployment("frontend-deployment", {
      projectId: this.project.id,
      production: true,
    });

    this.registerOutputs({
      projectId: this.project.id,
      projectName: this.project.name,
      deploymentUrl: this.deployment.url,
    });
  }
}
