import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import type { Organization, OrganizationMember, OrganizationRole } from "@tasks/core";
import { Button } from "@tasks/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@tasks/ui/components/dialog";
import { Field, FieldError, FieldLabel } from "@tasks/ui/components/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tasks/ui/components/select";
import { toast } from "@tasks/ui/components/sonner";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { authClient } from "@/auth-client";
import { useI18nContext } from "@/i18n/i18n-react";

type ChangeRoleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: OrganizationMember;
  organization: Organization;
  currentUserRole: OrganizationRole;
};

const roleSchema = z.object({
  role: z.enum(["member", "admin", "owner"]),
});

export function ChangeRoleDialog({
  open,
  onOpenChange,
  member,
  organization,
  currentUserRole,
}: ChangeRoleDialogProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { LL } = useI18nContext();

  const form = useForm({
    defaultValues: {
      role: member.role as OrganizationRole,
    },
    validators: {
      onChange: roleSchema,
    },
    onSubmit: async ({ value }) => {
      setError(null);

      // Validation: Check if trying to demote the last owner
      const ownerCount = organization.members.filter((m) => m.role === "owner").length;
      if (member.role === "owner" && value.role !== "owner" && ownerCount === 1) {
        const errorMsg = LL.settings.organizations.cannotDemoteLastOwner();
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      try {
        await authClient.organization.updateMemberRole({
          memberId: member.id,
          organizationId: organization.id,
          role: value.role,
        });

        toast.success(LL.settings.organizations.changeRoleSuccess());
        onOpenChange(false);
        form.reset();
        router.invalidate();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : LL.settings.organizations.changeRoleError();
        setError(errorMessage);
        toast.error(errorMessage);
      }
    },
  });

  // Determine available roles based on current user's role
  const availableRoles: OrganizationRole[] =
    currentUserRole === "owner" ? ["member", "admin", "owner"] : ["member", "admin"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{LL.settings.organizations.changeRoleDialogTitle()}</DialogTitle>
          <DialogDescription>
            {LL.settings.organizations.changeRoleDialogDescription({
              memberName: member.name || member.email,
              organizationName: organization.name,
            })}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-start gap-3 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 p-4 space-y-3">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              {LL.settings.organizations.memberLabel()}
            </p>
            <p className="text-sm font-medium">
              {member.name || member.email}
              {member.name && (
                <span className="text-muted-foreground font-normal"> ({member.email})</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              {LL.settings.organizations.organizationLabel()}
            </p>
            <p className="text-sm font-medium">{organization.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              {LL.settings.organizations.currentRole()}
            </p>
            <p className="text-sm font-medium">
              {member.role === "member" && LL.settings.organizations.roleMember()}
              {member.role === "admin" && LL.settings.organizations.roleAdmin()}
              {member.role === "owner" && LL.settings.organizations.roleOwner()}
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field name="role">
            {(field) => (
              <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
                <FieldLabel htmlFor="roleSelect">{LL.settings.organizations.newRole()}</FieldLabel>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value as OrganizationRole)}
                >
                  <SelectTrigger id="roleSelect" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.includes("member") && (
                      <SelectItem value="member">
                        {LL.settings.organizations.roleMember()}
                      </SelectItem>
                    )}
                    {availableRoles.includes("admin") && (
                      <SelectItem value="admin">{LL.settings.organizations.roleAdmin()}</SelectItem>
                    )}
                    {availableRoles.includes("owner") && (
                      <SelectItem value="owner">{LL.settings.organizations.roleOwner()}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <FieldError errors={field.state.meta.errors} />
                )}
              </Field>
            )}
          </form.Field>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => {
                onOpenChange(false);
                form.reset();
              }}
              variant="outline"
              className="flex-1"
            >
              {LL.common.cancel()}
            </Button>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting} className="flex-1">
                  {isSubmitting
                    ? LL.settings.organizations.changingRole()
                    : LL.settings.organizations.changeRole()}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
