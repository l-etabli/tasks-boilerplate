import { useCaseBuilder } from "@tasks/trousse";
import { z } from "zod";
import type { User } from "../entities/user-and-organization.js";
import type { FileGateway } from "../ports/FileGateway.js";
import type { Uow } from "../ports/Uow.js";

const MAX_FILE_SIZE = 0.5 * 1024 * 1024; // 0.5 MB
const ACCEPTED_IMAGE_TYPES = ["image/svg+xml", "image/png", "image/jpeg", "image/jpg"];

const uploadOrganizationLogoSchema = z.object({
  organizationId: z.string(),
  file: z.any(), // Buffer - validated at runtime to avoid client-side bundling issues
  filename: z.string(),
  mimeType: z.string(),
});

type Deps = {
  fileGateway: FileGateway;
};

const createAuthTransacUseCase = useCaseBuilder()
  .withUow<Uow>()
  .withCurrentUser<User>()
  .withDeps<Deps>();

export const uploadOrganizationLogoUseCase = createAuthTransacUseCase
  .withInput(uploadOrganizationLogoSchema)
  .build(async ({ input, currentUser, uow, deps }): Promise<string> => {
    // Validate file is a Buffer (runtime check to avoid client-side bundling of Buffer)
    if (!Buffer.isBuffer(input.file)) {
      throw new Error("File must be a Buffer");
    }

    // Validate file type
    if (!ACCEPTED_IMAGE_TYPES.includes(input.mimeType)) {
      throw new Error("Invalid file type. Only SVG, PNG, and JPG images are allowed");
    }

    // Validate file size
    if (input.file.length > MAX_FILE_SIZE) {
      throw new Error("File size exceeds 0.5 MB limit");
    }

    // Get all user's organizations to check their role
    const userOrganizations = await uow.userRepository.getUserOrganizations(currentUser.id);

    const userOrg = userOrganizations.find((org) => org.id === input.organizationId);

    if (!userOrg) {
      throw new Error("Organization not found");
    }

    // Check if user is an owner
    const currentUserMember = userOrg.members.find((member) => member.userId === currentUser.id);
    if (!currentUserMember || currentUserMember.role !== "owner") {
      throw new Error("Only organization owners can upload organization logos");
    }

    // Generate a unique key for the file
    const extension = input.filename.split(".").pop();
    const key = `organizations/${input.organizationId}/logo-${Date.now()}.${extension}`;

    // Upload to public bucket
    const result = await deps.fileGateway.uploadPublic(input.file, key, input.mimeType);

    return result.url;
  });
