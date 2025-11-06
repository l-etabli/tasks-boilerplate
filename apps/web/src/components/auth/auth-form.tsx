import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@tasks/ui/components/button";
import { Field, FieldError, FieldLabel, FieldSeparator } from "@tasks/ui/components/field";
import { Input } from "@tasks/ui/components/input";
import { useEffect, useState } from "react";
import { z } from "zod";
import { authClient } from "@/auth-client";
import { useI18nContext } from "@/i18n/i18n-react";
import { authSessionStorage } from "@/utils/auth-session-storage";

type AuthFormProps = {
  callbackURL?: string;
  className?: string;
};

type AuthMode = "signIn" | "signUp";

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export function AuthForm({ callbackURL = "/", className }: AuthFormProps) {
  const { LL } = useI18nContext();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("signIn");
  const [apiError, setApiError] = useState<string>("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    validators: {
      onChange: ({ value }) => {
        const schema = mode === "signUp" ? signUpSchema : signInSchema;
        const result = schema.safeParse(value);
        if (!result.success) {
          const formatted = result.error.flatten();
          return {
            form: formatted.formErrors.join(", "),
            fields: formatted.fieldErrors,
          };
        }
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      setApiError("");
      setShowResendVerification(false);

      // Better Auth returns { data, error } instead of throwing
      let result: { data?: any; error?: any };
      if (mode === "signUp") {
        result = await authClient.signUp.email({
          email: value.email,
          password: value.password,
          name: value.name,
          callbackURL,
        });

        // If signup succeeded, send verification email
        if (!result.error && result.data) {
          try {
            await authClient.sendVerificationEmail({
              email: value.email,
              callbackURL: "/verify-email",
            });
          } catch (_emailError) {
            // Don't fail the signup if email sending fails
          }
        }
      } else {
        result = await authClient.signIn.email({
          email: value.email,
          password: value.password,
          callbackURL,
        });
      }

      // Check for errors in the response
      if (result.error) {
        let errorMessage: string = LL.auth.authenticationFailed();
        let isEmailNotVerified = false;

        // Better Auth error has { code, message, status }
        const errorCode = result.error.code;
        const message = result.error.message;

        // Compare error codes as strings (ERROR_CODES is a Proxy)
        if (errorCode === "EMAIL_NOT_VERIFIED") {
          errorMessage = LL.auth.emailNotVerified();
          isEmailNotVerified = true;

          // Automatically send verification email when sign-in fails due to unverified email
          try {
            await authClient.sendVerificationEmail({
              email: value.email,
              callbackURL: "/verify-email",
            });
          } catch (_emailError) {
            // Failed to auto-send verification email
          }
        } else if (
          errorCode === "USER_ALREADY_EXISTS" ||
          errorCode === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
        ) {
          errorMessage = LL.auth.emailAlreadyExists();
        } else if (message) {
          // Use the actual error message
          errorMessage = message;
        }

        setApiError(errorMessage);
        setShowResendVerification(isEmailNotVerified);
      } else if (mode === "signUp") {
        // Success for sign-up
        authSessionStorage.clearAuthData();
        setVerificationSent(true);
      } else {
        // Success for sign-in - clear sessionStorage before redirect
        authSessionStorage.clearAuthData();
      }
      // Success for sign-in - redirects automatically
    },
  });

  // Initialize form with values from sessionStorage
  useEffect(() => {
    const savedEmail = authSessionStorage.getAuthEmail();
    const savedName = authSessionStorage.getAuthName();

    if (savedEmail) {
      form.setFieldValue("email", savedEmail);
    }
    if (savedName) {
      form.setFieldValue("name", savedName);
    }
  }, [form]);

  const handleResendVerification = async () => {
    setApiError("");

    try {
      const email = form.getFieldValue("email");
      await authClient.sendVerificationEmail({
        email,
        callbackURL: "/verify-email",
      });
      setVerificationSent(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : LL.auth.authenticationFailed();
      setApiError(errorMessage);
    }
  };

  const handleGoogleLogin = () => {
    authClient.signIn.social({
      provider: "google",
      callbackURL,
    });
  };

  const toggleMode = () => {
    const currentEmail = form.getFieldValue("email");
    const currentName = form.getFieldValue("name");
    setMode(mode === "signIn" ? "signUp" : "signIn");
    setApiError("");
    setShowResendVerification(false);
    form.reset();

    // Preserve email and name when switching between sign-in and sign-up
    if (currentEmail) {
      form.setFieldValue("email", currentEmail);
    }
    if (currentName) {
      form.setFieldValue("name", currentName);
    }
  };

  if (verificationSent) {
    return (
      <div className={className}>
        <div className="space-y-4">
          <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800 p-4">
            <p className="text-sm text-green-800 dark:text-green-200">
              {LL.auth.verificationEmailSent()}
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setVerificationSent(false);
              setMode("signIn");
            }}
          >
            {LL.common.back()}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-4"
      >
        {mode === "signUp" && (
          <form.Field name="name">
            {(field) => (
              <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
                <FieldLabel htmlFor="name">{LL.auth.name()}</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  value={field.state.value}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.handleChange(value);
                    authSessionStorage.saveAuthName(value);
                  }}
                  onBlur={field.handleBlur}
                  autoComplete="name"
                  aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                />
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <FieldError
                    errors={field.state.meta.errors.map((error) => ({
                      message: error,
                    }))}
                  />
                )}
              </Field>
            )}
          </form.Field>
        )}

        <form.Field name="email">
          {(field) => (
            <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
              <FieldLabel htmlFor="email">{LL.auth.email()}</FieldLabel>
              <Input
                id="email"
                type="email"
                value={field.state.value}
                onChange={(e) => {
                  const value = e.target.value;
                  field.handleChange(value);
                  authSessionStorage.saveAuthEmail(value);
                }}
                onBlur={field.handleBlur}
                autoComplete="email"
                aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
              />
              {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                <FieldError
                  errors={field.state.meta.errors.map((error) => ({
                    message: error,
                  }))}
                />
              )}
            </Field>
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
              <FieldLabel htmlFor="password">{LL.auth.password()}</FieldLabel>
              <Input
                id="password"
                type="password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                autoComplete={mode === "signIn" ? "current-password" : "new-password"}
                aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
              />
              {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                <FieldError
                  errors={field.state.meta.errors.map((error) => ({
                    message: error,
                  }))}
                />
              )}
            </Field>
          )}
        </form.Field>

        {apiError && (
          <div className="space-y-2">
            <FieldError>{apiError}</FieldError>
            {showResendVerification && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleResendVerification}
              >
                {LL.auth.resendVerification()}
              </Button>
            )}
          </div>
        )}

        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting
                ? LL.common.loading()
                : mode === "signUp"
                  ? LL.auth.signUp()
                  : LL.auth.signIn()}
            </Button>
          )}
        </form.Subscribe>

        {mode === "signIn" && (
          <div className="flex items-center justify-between text-sm">
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto"
              onMouseDown={(e) => {
                e.preventDefault();
              }}
              onClick={() => {
                navigate({ to: "/forgot-password" });
              }}
            >
              {LL.auth.forgotPassword()}
            </Button>
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto"
              onMouseDown={(e) => {
                e.preventDefault();
                toggleMode();
              }}
            >
              {LL.auth.signUp()}
            </Button>
          </div>
        )}

        {mode === "signUp" && (
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onMouseDown={(e) => {
              e.preventDefault();
              toggleMode();
            }}
          >
            {LL.auth.alreadyHaveAccount()}
          </Button>
        )}

        <FieldSeparator className="mt-4">{LL.auth.orContinueWith()}</FieldSeparator>

        <Button
          id="btn-login-google"
          type="button"
          onClick={handleGoogleLogin}
          className="w-full mt-4"
          size="lg"
          variant="outline"
        >
          <GoogleIcon />
          {LL.auth.signInWithGoogle()}
        </Button>
      </form>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      xmlns="http://www.w3.org/2000/svg"
      className="mr-2"
    >
      <title>Google</title>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
