import { useRouter } from "@tanstack/react-router";
import type { User } from "@tasks/core";
import { Button } from "@tasks/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@tasks/ui/components/dialog";
import { Input } from "@tasks/ui/components/input";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { authClient } from "@/auth-client";

type CreateOrganizationModalProps = {
  currentUser: User;
};

export function CreateOrganizationModal({ currentUser: user }: CreateOrganizationModalProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [orgName, setOrgName] = useState("");

  const createPersonalOrganization = async () => {
    setIsCreating(true);
    setError(null);

    try {
      const name = user.email.split("@")[0];
      const slug = `personal-${user.id.slice(0, 8)}`;

      await authClient.organization.create({
        name,
        slug,
        metadata: { type: "personal" },
      });

      router.invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create organization");
    } finally {
      setIsCreating(false);
    }
  };

  const createCustomOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);

    try {
      const slug = orgName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      await authClient.organization.create({
        name: orgName,
        slug,
      });

      router.invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create organization");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="max-w-md">
        {showCustomForm ? (
          <>
            <DialogHeader>
              <DialogTitle>Create organization</DialogTitle>
              <DialogDescription>Set up your workspace with a custom name</DialogDescription>
            </DialogHeader>

            {error && (
              <div className="flex items-start gap-3 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={createCustomOrganization} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="orgName" className="text-sm font-medium">
                  Organization name
                </label>
                <Input
                  id="orgName"
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Acme Inc"
                  required
                  disabled={isCreating}
                />
                <p className="text-xs text-muted-foreground">
                  Slug will be auto-generated from the name
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => setShowCustomForm(false)}
                  variant="outline"
                  disabled={isCreating}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="submit" disabled={isCreating || !orgName.trim()} className="flex-1">
                  {isCreating ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create your organization</DialogTitle>
              <DialogDescription>Choose how you'll use this workspace</DialogDescription>
            </DialogHeader>

            {error && (
              <div className="flex items-start gap-3 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <Button
                type="button"
                onClick={createPersonalOrganization}
                disabled={isCreating}
                variant="outline"
                className="h-auto w-full justify-start p-4 text-left"
              >
                <div className="w-full">
                  <div className="font-semibold">Personal workspace</div>
                  <div className="text-xs text-muted-foreground">
                    Quick setup for individual use
                  </div>
                </div>
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-background px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => setShowCustomForm(true)}
                disabled={isCreating}
                variant="outline"
                className="h-auto w-full justify-start p-4 text-left"
              >
                <div className="w-full">
                  <div className="font-semibold">Custom organization</div>
                  <div className="text-xs text-muted-foreground">
                    Set up with custom name and settings
                  </div>
                </div>
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
