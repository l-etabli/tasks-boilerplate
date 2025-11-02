import { useForm } from "@tanstack/react-form";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Button } from "@tasks/ui/components/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@tasks/ui/components/field";
import { Input } from "@tasks/ui/components/input";
import { useState } from "react";
import { z } from "zod";
import { authClient } from "@/auth-client";
import { useI18nContext } from "@/i18n/i18n-react";

const nameSchema = z.object({
  name: z.string().min(1).max(100),
});

const emailSchema = z.object({
  email: z.string().email(),
});

export const Route = createFileRoute("/_authenticated/settings/account")({
  component: AccountSettings,
});

function AccountSettings() {
  const router = useRouter();
  const { currentUser } = Route.useRouteContext();
  const { data: session } = authClient.useSession();
  const { LL } = useI18nContext();
  const t = LL.settings.account;

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Disable email change for OAuth users (Google, etc)
  const canChangeEmail = !session?.user?.emailVerified;

  const nameForm = useForm({
    defaultValues: {
      name: currentUser.name || "",
    },
    validators: {
      onChange: nameSchema,
    },
    onSubmit: async ({ value }) => {
      setMessage(null);
      try {
        await authClient.updateUser({
          name: value.name,
        });
        setMessage({ type: "success", text: t.nameSuccess() });
        router.invalidate();
      } catch (err) {
        setMessage({
          type: "error",
          text: err instanceof Error ? err.message : t.nameError(),
        });
      }
    },
  });

  const emailForm = useForm({
    defaultValues: {
      email: currentUser.email,
    },
    validators: {
      onChange: emailSchema,
    },
    onSubmit: async ({ value }) => {
      setMessage(null);
      try {
        await authClient.changeEmail({
          newEmail: value.email,
        });
        setMessage({
          type: "success",
          text: t.emailSuccess(),
        });
        router.invalidate();
      } catch (err) {
        setMessage({
          type: "error",
          text: err instanceof Error ? err.message : t.emailError(),
        });
      }
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">{t.heading()}</h2>

        {message && (
          <div
            className={`mb-4 p-3 rounded ${
              message.type === "success"
                ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
                : "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          {/* Name Update */}
          <form
            id="form-update-name"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              nameForm.handleSubmit();
            }}
            className="space-y-3"
          >
            <nameForm.Field name="name">
              {(field) => (
                <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
                  <FieldLabel htmlFor="name">{t.nameLabel()}</FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      id="name"
                      type="text"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder={t.namePlaceholder()}
                      aria-invalid={!!(field.state.meta.isTouched && !field.state.meta.isValid)}
                      className="flex-1"
                    />
                    <nameForm.Subscribe
                      selector={(state) =>
                        [state.canSubmit, state.isSubmitting, state.values.name] as const
                      }
                    >
                      {([canSubmit, isSubmitting, formName]) => {
                        const isUnchanged = formName === currentUser.name;
                        return (
                          <Button
                            id="btn-save-name"
                            type="submit"
                            disabled={!canSubmit || isSubmitting || isUnchanged}
                          >
                            {isSubmitting ? LL.common.saving() : LL.common.save()}
                          </Button>
                        );
                      }}
                    </nameForm.Subscribe>
                  </div>
                  {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </Field>
              )}
            </nameForm.Field>
          </form>

          {/* Email Update - Only for email/password users */}
          {canChangeEmail ? (
            <form
              id="form-update-email"
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                emailForm.handleSubmit();
              }}
              className="space-y-3"
            >
              <emailForm.Field name="email">
                {(field) => (
                  <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
                    <FieldLabel htmlFor="email">{t.emailLabel()}</FieldLabel>
                    <div className="flex gap-2">
                      <Input
                        id="email"
                        type="email"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder={t.emailPlaceholder()}
                        aria-invalid={!!(field.state.meta.isTouched && !field.state.meta.isValid)}
                        className="flex-1"
                      />
                      <emailForm.Subscribe
                        selector={(state) =>
                          [state.canSubmit, state.isSubmitting, state.values.email] as const
                        }
                      >
                        {([canSubmit, isSubmitting, formEmail]) => {
                          const isUnchanged = formEmail === currentUser.email;
                          return (
                            <Button
                              id="btn-save-email"
                              type="submit"
                              disabled={!canSubmit || isSubmitting || isUnchanged}
                            >
                              {isSubmitting ? LL.common.saving() : LL.common.save()}
                            </Button>
                          );
                        }}
                      </emailForm.Subscribe>
                    </div>
                    <FieldDescription>{t.emailVerificationNote()}</FieldDescription>
                    {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )}
              </emailForm.Field>
            </form>
          ) : (
            <div>
              <div className="text-sm font-medium mb-1">{t.emailLabel()}</div>
              <div className="px-3 py-2 border border-gray-200 dark:border-slate-800 rounded bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-gray-300">
                {currentUser.email}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t.emailOAuthNote()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
