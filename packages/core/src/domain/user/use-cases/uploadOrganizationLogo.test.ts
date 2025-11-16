import { expectPromiseToFailWith, expectToEqual } from "@tasks/test";
import { beforeEach, describe, it } from "vitest";
import { createInMemoryFileGateway } from "../../../adapters/file/InMemoryFileGateway.js";
import {
  createWithInMemoryUnitOfWork,
  type InMemoryHelpers,
} from "../../../adapters/inMemory/withInMemoryUow.js";
import { memberFactory, organizationFactory } from "../entities/organizationFactory.js";
import { userFactory } from "../entities/userFactory.js";
import { uploadOrganizationLogoUseCase } from "./uploadOrganizationLogo.js";

describe("uploadOrganizationLogo", () => {
  let uploadOrganizationLogo: ReturnType<typeof uploadOrganizationLogoUseCase>;
  const currentUser = userFactory();
  let helpers: InMemoryHelpers;
  let fileGateway: ReturnType<typeof createInMemoryFileGateway>;

  beforeEach(() => {
    const uowConfig = createWithInMemoryUnitOfWork();
    helpers = uowConfig.helpers;
    fileGateway = createInMemoryFileGateway();
    uploadOrganizationLogo = uploadOrganizationLogoUseCase({
      withUow: uowConfig.withUow,
      deps: { fileGateway },
    });
  });

  it("should upload a valid SVG logo", async () => {
    const org = organizationFactory({
      id: "org-1",
      members: [memberFactory({ user: currentUser, role: "owner" })],
    });
    helpers.user.setOrganizations([org]);

    const svgBuffer = Buffer.from("<svg></svg>");
    const url = await uploadOrganizationLogo({
      input: {
        organizationId: org.id,
        file: svgBuffer,
        filename: "logo.svg",
        mimeType: "image/svg+xml",
      },
      currentUser,
    });

    expectToEqual(url.startsWith("test://organizations/"), true);
    expectToEqual(url.includes("/logo-"), true);
    expectToEqual(url.endsWith(".svg"), true);

    // Verify file was uploaded to public bucket
    const uploadedKey = Object.keys(fileGateway.store.publicFiles)[0];
    if (!uploadedKey) throw new Error("No file uploaded");
    expectToEqual(fileGateway.store.publicFiles[uploadedKey], svgBuffer);
  });

  it("should upload a valid PNG logo", async () => {
    const org = organizationFactory({
      id: "org-1",
      members: [memberFactory({ user: currentUser, role: "owner" })],
    });
    helpers.user.setOrganizations([org]);

    const pngBuffer = Buffer.from("fake-png-data");
    const url = await uploadOrganizationLogo({
      input: {
        organizationId: org.id,
        file: pngBuffer,
        filename: "logo.png",
        mimeType: "image/png",
      },
      currentUser,
    });

    expectToEqual(url.endsWith(".png"), true);
    const uploadedKey = Object.keys(fileGateway.store.publicFiles)[0];
    if (!uploadedKey) throw new Error("No file uploaded");
    expectToEqual(fileGateway.store.publicFiles[uploadedKey], pngBuffer);
  });

  it("should upload a valid JPG logo", async () => {
    const org = organizationFactory({
      id: "org-1",
      members: [memberFactory({ user: currentUser, role: "owner" })],
    });
    helpers.user.setOrganizations([org]);

    const jpgBuffer = Buffer.from("fake-jpg-data");
    const url = await uploadOrganizationLogo({
      input: {
        organizationId: org.id,
        file: jpgBuffer,
        filename: "logo.jpg",
        mimeType: "image/jpeg",
      },
      currentUser,
    });

    expectToEqual(url.endsWith(".jpg"), true);
    const uploadedKey = Object.keys(fileGateway.store.publicFiles)[0];
    if (!uploadedKey) throw new Error("No file uploaded");
    expectToEqual(fileGateway.store.publicFiles[uploadedKey], jpgBuffer);
  });

  it("should reject invalid file types", async () => {
    const org = organizationFactory({
      id: "org-1",
      members: [memberFactory({ user: currentUser, role: "owner" })],
    });
    helpers.user.setOrganizations([org]);

    await expectPromiseToFailWith(
      uploadOrganizationLogo({
        input: {
          organizationId: org.id,
          file: Buffer.from("fake-data"),
          filename: "logo.pdf",
          mimeType: "application/pdf",
        },
        currentUser,
      }),
      "Invalid file type. Only SVG, PNG, and JPG images are allowed",
    );

    // Verify no file was uploaded
    expectToEqual(Object.keys(fileGateway.store.publicFiles).length, 0);
  });

  it("should reject files larger than 0.5 MB", async () => {
    const org = organizationFactory({
      id: "org-1",
      members: [memberFactory({ user: currentUser, role: "owner" })],
    });
    helpers.user.setOrganizations([org]);

    const largeFile = Buffer.alloc(0.6 * 1024 * 1024); // 0.6 MB

    await expectPromiseToFailWith(
      uploadOrganizationLogo({
        input: {
          organizationId: org.id,
          file: largeFile,
          filename: "logo.svg",
          mimeType: "image/svg+xml",
        },
        currentUser,
      }),
      "File size exceeds 0.5 MB limit",
    );

    // Verify no file was uploaded
    expectToEqual(Object.keys(fileGateway.store.publicFiles).length, 0);
  });

  it("should reject if organization does not exist", async () => {
    await expectPromiseToFailWith(
      uploadOrganizationLogo({
        input: {
          organizationId: "non-existent-org",
          file: Buffer.from("<svg></svg>"),
          filename: "logo.svg",
          mimeType: "image/svg+xml",
        },
        currentUser,
      }),
      "Organization not found",
    );
  });

  it("should reject if user is not an owner", async () => {
    const org = organizationFactory({
      id: "org-1",
      members: [memberFactory({ user: currentUser, role: "member" })],
    });
    helpers.user.setOrganizations([org]);

    await expectPromiseToFailWith(
      uploadOrganizationLogo({
        input: {
          organizationId: org.id,
          file: Buffer.from("<svg></svg>"),
          filename: "logo.svg",
          mimeType: "image/svg+xml",
        },
        currentUser,
      }),
      "Only organization owners can upload organization logos",
    );

    // Verify no file was uploaded
    expectToEqual(Object.keys(fileGateway.store.publicFiles).length, 0);
  });

  it("should reject if user is not a member of the organization", async () => {
    const otherUser = userFactory();
    const org = organizationFactory({
      id: "org-1",
      members: [memberFactory({ user: otherUser, role: "owner" })],
    });
    helpers.user.setOrganizations([org]);

    await expectPromiseToFailWith(
      uploadOrganizationLogo({
        input: {
          organizationId: org.id,
          file: Buffer.from("<svg></svg>"),
          filename: "logo.svg",
          mimeType: "image/svg+xml",
        },
        currentUser,
      }),
      "Organization not found",
    );
  });

  it("should generate unique keys for different uploads", async () => {
    const org = organizationFactory({
      id: "org-1",
      members: [memberFactory({ user: currentUser, role: "owner" })],
    });
    helpers.user.setOrganizations([org]);

    const url1 = await uploadOrganizationLogo({
      input: {
        organizationId: org.id,
        file: Buffer.from("<svg></svg>"),
        filename: "logo.svg",
        mimeType: "image/svg+xml",
      },
      currentUser,
    });

    // Wait a tiny bit to ensure different timestamps
    await new Promise((resolve) => setTimeout(resolve, 2));

    const url2 = await uploadOrganizationLogo({
      input: {
        organizationId: org.id,
        file: Buffer.from("<svg>v2</svg>"),
        filename: "logo.svg",
        mimeType: "image/svg+xml",
      },
      currentUser,
    });

    expectToEqual(url1 === url2, false);
  });
});
