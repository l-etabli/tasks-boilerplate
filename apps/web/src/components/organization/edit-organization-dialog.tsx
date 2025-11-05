import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { type Organization, sanitizeSlug } from "@tasks/core";
import { Button } from "@tasks/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@tasks/ui/components/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@tasks/ui/components/field";
import { Input } from "@tasks/ui/components/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@tasks/ui/components/tooltip";
import { AlertCircle, Pencil } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { useI18nContext } from "@/i18n/i18n-react";
import { updateOrganization } from "@/server/functions/user";

type EditOrganizationDialogProps = {
  organization: Organization;
};

const organizationSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
});

export function EditOrganizationDialog({ organization }: EditOrganizationDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { LL } = useI18nContext();

  const form = useForm({
    defaultValues: {
      name: organization.name,
      slug: organization.slug || "",
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
            slug: value.slug,
          },
        });

        setIsOpen(false);
        router.invalidate();
      } catch (err) {
        setError(err instanceof Error ? err.message : LL.organization.updateFailed());
      } finally {
        setIsUpdating(false);
      }
    },
  });

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Pencil className="h-4 w-4" />
                <span className="sr-only">{LL.organization.edit()}</span>
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{LL.organization.edit()}</p>
          </TooltipContent>
        </Tooltip>
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

            <form.Field name="slug">
              {(field) => (
                <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
                  <FieldLabel htmlFor="orgSlug">{LL.organization.slugLabel()}</FieldLabel>
                  <Input
                    id="orgSlug"
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(sanitizeSlug(e.target.value))}
                    onBlur={field.handleBlur}
                    placeholder={LL.organization.slugPlaceholder()}
                    disabled={isUpdating}
                    aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                  />
                  <FieldDescription>{LL.organization.slugDescription()}</FieldDescription>
                  {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </Field>
              )}
            </form.Field>

            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => setIsOpen(false)}
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
    </TooltipProvider>
  );
}
