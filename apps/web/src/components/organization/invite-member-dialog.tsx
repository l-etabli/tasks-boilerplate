import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import type { Organization } from "@tasks/core";
import { Button } from "@tasks/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@tasks/ui/components/dialog";
import { Field, FieldError, FieldLabel } from "@tasks/ui/components/field";
import { Input } from "@tasks/ui/components/input";
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

type InviteMemberDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization: Organization;
};

const inviteSchema = z.object({
  email: z.email(),
  role: z.enum(["member", "admin"]),
});

export function InviteMemberDialog({ open, onOpenChange, organization }: InviteMemberDialogProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { LL } = useI18nContext();
  const { data: session } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      email: "",
      role: "member" as "member" | "admin",
    },
    validators: {
      onChange: inviteSchema,
    },
    onSubmit: async ({ value }) => {
      setError(null);

      // Validation: Check if inviting self
      if (session?.user?.email && value.email.toLowerCase() === session.user.email.toLowerCase()) {
        const errorMsg = LL.invitation.errorSelfInvitation();
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      // Validation: Check if email is already a member
      if (organization?.members) {
        const isAlreadyMember = organization.members.some(
          (member) => member.email.toLowerCase() === value.email.toLowerCase(),
        );
        if (isAlreadyMember) {
          const errorMsg = LL.invitation.errorAlreadyMemberInvite({ email: value.email });
          setError(errorMsg);
          toast.error(errorMsg);
          return;
        }
      }

      // Validation: Check if email already has a pending invitation
      if (organization?.invitations) {
        const hasInvitation = organization.invitations.some(
          (invitation) => invitation.email.toLowerCase() === value.email.toLowerCase(),
        );
        if (hasInvitation) {
          const errorMsg = LL.invitation.errorAlreadyInvited({ email: value.email });
          setError(errorMsg);
          toast.error(errorMsg);
          return;
        }
      }

      try {
        await authClient.organization.inviteMember({
          email: value.email,
          role: value.role,
          organizationId: organization.id,
        });

        toast.success(LL.settings.organizations.inviteSuccess());
        onOpenChange(false);
        form.reset();
        router.invalidate();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : LL.settings.organizations.inviteError();
        setError(errorMessage);
        toast.error(errorMessage);
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{LL.settings.organizations.inviteDialogTitle()}</DialogTitle>
          <DialogDescription>
            {LL.settings.organizations.inviteDialogDescription()}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-start gap-3 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field name="email">
            {(field) => (
              <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
                <FieldLabel htmlFor="inviteEmail">
                  {LL.settings.organizations.inviteEmailLabel()}
                </FieldLabel>
                <Input
                  id="inviteEmail"
                  type="email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={LL.settings.organizations.inviteEmailPlaceholder()}
                  aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                />
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <FieldError errors={field.state.meta.errors} />
                )}
              </Field>
            )}
          </form.Field>

          <form.Field name="role">
            {(field) => (
              <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
                <FieldLabel htmlFor="inviteRole">
                  {LL.settings.organizations.inviteRoleLabel()}
                </FieldLabel>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value as "member" | "admin")}
                >
                  <SelectTrigger id="inviteRole" className="w-full">
                    <SelectValue
                      placeholder={LL.settings.organizations.inviteRoleSelectPlaceholder()}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">
                      {LL.settings.organizations.inviteRoleMember()}
                    </SelectItem>
                    <SelectItem value="admin">
                      {LL.settings.organizations.inviteRoleAdmin()}
                    </SelectItem>
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
              id="btn-cancel-invite"
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
                <Button
                  id="btn-submit-invite"
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting
                    ? LL.settings.organizations.inviteSending()
                    : LL.settings.organizations.inviteSubmit()}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
