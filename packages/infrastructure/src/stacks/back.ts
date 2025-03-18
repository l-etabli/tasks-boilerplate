import * as pulumi from "@pulumi/pulumi";
import * as vercel from "@pulumiverse/vercel";
import { backendConfig } from "../config";

export class BackendStack extends pulumi.ComponentResource {
  public readonly project: vercel.Project;
  public readonly deployment: vercel.Deployment;

  constructor(name: string, opts?: pulumi.ComponentResourceOptions) {
    super("tasks:backend", name, {}, opts);

    // Create a new Vercel project
    this.project = new vercel.Project("backend-project", {
      name: backendConfig.projectName,
      framework: backendConfig.framework,
      rootDirectory: backendConfig.rootDirectory,
      buildCommand: backendConfig.buildCommand,
      outputDirectory: backendConfig.outputDirectory,
      // Add git repository configuration when ready
      // gitRepository: {
      //     type: "github",
      //     repo: "your-org/your-repo",
      // },
    });

    // Create a new deployment
    this.deployment = new vercel.Deployment("backend-deployment", {
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
