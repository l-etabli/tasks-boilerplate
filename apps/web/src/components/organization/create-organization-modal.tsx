import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { generateUniqueSlug } from "@tasks/core";
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
import { authClient } from "@/auth-client";
import { useI18nContext } from "@/i18n/i18n-react";

const organizationSchema = z.object({
  name: z.string().min(1).max(100),
});

export function CreateOrganizationModal() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { LL } = useI18nContext();

  const form = useForm({
    defaultValues: {
      name: "",
    },
    validators: {
      onChange: organizationSchema,
    },
    onSubmit: async ({ value }) => {
      setIsCreating(true);
      setError(null);

      try {
        const slug = generateUniqueSlug(value.name);
        await authClient.organization.create({
          name: value.name,
          slug,
        });

        router.invalidate();
      } catch (err) {
        setError(err instanceof Error ? err.message : LL.organization.createFailed());
      } finally {
        setIsCreating(false);
      }
    },
  });

  return (
    <Dialog open={true}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{LL.organization.modalTitle()}</DialogTitle>
          <DialogDescription>{LL.organization.modalDescription()}</DialogDescription>
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
                  disabled={isCreating}
                  aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                />
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <FieldError errors={field.state.meta.errors} />
                )}
              </Field>
            )}
          </form.Field>

          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <Button
                id="btn-submit-org"
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? LL.organization.creating() : LL.organization.create()}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </DialogContent>
    </Dialog>
  );
}
