import { useForm } from "@tanstack/react-form";
import { Button } from "@tasks/ui/components/button";
import { Field, FieldError, FieldLabel } from "@tasks/ui/components/field";
import { Input } from "@tasks/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tasks/ui/components/select";
import { useState } from "react";
import { z } from "zod";
import { authClient } from "@/auth-client";
import { useI18nContext } from "@/i18n/i18n-react";

const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "member"]),
});

interface InviteMemberFormProps {
  organizationId: string;
  onSuccess?: () => void;
}

export function InviteMemberForm({ organizationId, onSuccess }: InviteMemberFormProps) {
  const { LL } = useI18nContext();
  const t = LL.invitations.inviteMember;
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const form = useForm({
    defaultValues: {
      email: "",
      role: "" as "admin" | "member" | "",
    },
    validators: {
      onChange: inviteMemberSchema.partial(),
      onSubmit: inviteMemberSchema,
    },
    onSubmit: async ({ value }) => {
      setMessage(null);
      try {
        const result = await authClient.organization.inviteMember({
          organizationId,
          email: value.email,
          role: value.role,
        });

        if (result.error) {
          setMessage({
            type: "error",
            text: result.error.message || t.errorMessage(),
          });
          return;
        }

        setMessage({
          type: "success",
          text: t.successMessage({ email: value.email }),
        });

        // Reset form
        form.reset();

        // Call success callback to refresh invitations list
        onSuccess?.();
      } catch (error) {
        console.error("Failed to invite member:", error);
        setMessage({
          type: "error",
          text: t.errorMessage(),
        });
      }
    },
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{t.heading()}</h3>

      {message && (
        <div
          className={`rounded-md p-3 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
              : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <div className="space-y-4">
          <form.Field name="email" validators={{ onChange: z.string().email() }}>
            {(field) => (
              <Field
                data-invalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}
              >
                <FieldLabel htmlFor="invite-email">{t.emailLabel()}</FieldLabel>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder={t.emailPlaceholder()}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}
                />
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <FieldError errors={field.state.meta.errors} />
                )}
                <p className="text-sm text-muted-foreground">{t.emailHelper()}</p>
              </Field>
            )}
          </form.Field>

          <form.Field name="role">
            {(field) => (
              <Field
                data-invalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}
              >
                <FieldLabel htmlFor="invite-role">{t.roleLabel()}</FieldLabel>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value as "admin" | "member")}
                >
                  <SelectTrigger
                    id="invite-role"
                    aria-invalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}
                  >
                    <SelectValue placeholder={t.rolePlaceholder()} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">{LL.invitations.roles.admin()}</SelectItem>
                    <SelectItem value="member">{LL.invitations.roles.member()}</SelectItem>
                  </SelectContent>
                </Select>
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <FieldError errors={field.state.meta.errors} />
                )}
              </Field>
            )}
          </form.Field>

          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <Button
                id="btn-invite-member"
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? t.submitting() : t.submitButton()}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </div>
  );
}
