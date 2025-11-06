import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { generateUniqueSlug, type User } from "@tasks/core";
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

type CreateOrganizationModalProps = {
  currentUser: User;
};

const organizationSchema = z.object({
  name: z.string().min(1).max(100),
});

export function CreateOrganizationModal({ currentUser: user }: CreateOrganizationModalProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
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

  const createPersonalOrganization = async () => {
    setIsCreating(true);
    setError(null);

    try {
      const name = user.email.split("@")[0];
      const slug = generateUniqueSlug(name);

      await authClient.organization.create({
        name,
        slug,
        metadata: { type: "personal" },
      });

      router.invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : LL.organization.createFailed());
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
              <DialogTitle>{LL.organization.customFormTitle()}</DialogTitle>
              <DialogDescription>{LL.organization.customFormDescription()}</DialogDescription>
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

              <div className="flex gap-2">
                <Button
                  id="btn-back-org-modal"
                  type="button"
                  onClick={() => setShowCustomForm(false)}
                  variant="outline"
                  disabled={isCreating}
                  className="flex-1"
                >
                  {LL.organization.back()}
                </Button>
                <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                  {([canSubmit, isSubmitting]) => (
                    <Button
                      id="btn-submit-custom-org"
                      type="submit"
                      disabled={!canSubmit || isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? LL.organization.creating() : LL.organization.create()}
                    </Button>
                  )}
                </form.Subscribe>
              </div>
            </form>
          </>
        ) : (
          <>
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

            <div className="space-y-3">
              <Button
                id="btn-create-personal-org"
                type="button"
                onClick={createPersonalOrganization}
                disabled={isCreating}
                variant="outline"
                className="h-auto w-full justify-start p-4 text-left"
              >
                <div className="w-full">
                  <div className="font-semibold">{LL.organization.personalOptionTitle()}</div>
                  <div className="text-xs text-muted-foreground">
                    {LL.organization.personalOptionDescription()}
                  </div>
                </div>
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-background px-2 text-muted-foreground">{LL.common.or()}</span>
                </div>
              </div>

              <Button
                id="btn-show-custom-org-form"
                type="button"
                onClick={() => setShowCustomForm(true)}
                disabled={isCreating}
                variant="outline"
                className="h-auto w-full justify-start p-4 text-left"
              >
                <div className="w-full">
                  <div className="font-semibold">{LL.organization.customOptionTitle()}</div>
                  <div className="text-xs text-muted-foreground">
                    {LL.organization.customOptionDescription()}
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
