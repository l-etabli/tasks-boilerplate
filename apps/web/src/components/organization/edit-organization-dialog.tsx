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
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { useI18nContext } from "@/i18n/i18n-react";
import { updateOrganization } from "@/server/functions/user";

type EditOrganizationDialogProps = {
  organization: Organization;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const organizationSchema = z.object({
  name: z.string().trim().min(1).max(100),
});

export function EditOrganizationDialog({
  organization,
  open,
  onOpenChange,
}: EditOrganizationDialogProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { LL } = useI18nContext();

  const form = useForm({
    defaultValues: {
      name: organization.name,
    },
    validators: {
      onChange: organizationSchema,
    },
    onSubmit: async ({ value }) => {
      setIsUpdating(true);
      setError(null);

      try {
        await updateOrganization({
          data: {
            organizationId: organization.id,
            name: value.name,
          },
        });

        onOpenChange(false);
        router.invalidate();
      } catch (err) {
        setError(err instanceof Error ? err.message : LL.organization.updateFailed());
      } finally {
        setIsUpdating(false);
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{LL.organization.editTitle()}</DialogTitle>
          <DialogDescription>{LL.organization.editDescription()}</DialogDescription>
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
          <form.Field name="name">
            {(field) => (
              <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
                <FieldLabel htmlFor="orgName">{LL.organization.nameLabel()}</FieldLabel>
                <Input
                  id="orgName"
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={LL.organization.namePlaceholder()}
                  disabled={isUpdating}
                  aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                />
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <FieldError errors={field.state.meta.errors} />
                )}
              </Field>
            )}
          </form.Field>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              variant="outline"
              disabled={isUpdating}
              className="flex-1"
            >
              {LL.common.cancel()}
            </Button>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting} className="flex-1">
                  {isSubmitting ? LL.organization.updating() : LL.organization.saveChanges()}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
