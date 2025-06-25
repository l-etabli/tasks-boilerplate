import { Link, createFileRoute } from "@tanstack/react-router";

type SubscriptionRequiredSearch = {
  redirect?: string;
};

export const Route = createFileRoute("/_authenticated/subscription-required")({
  validateSearch: (search: Record<string, unknown>): SubscriptionRequiredSearch => {
    return {
      redirect: (search.redirect as string) || "/",
    };
  },
  component: SubscriptionRequired,
});

function SubscriptionRequired() {
  const { redirect } = Route.useSearch();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Subscription Required</h2>
          <p className="mt-2 text-sm text-gray-600">
            You need an active paid subscription to access this feature.
          </p>
        </div>

        <div className="rounded-md bg-yellow-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Premium Feature</h3>
              <p className="mt-2 text-sm text-yellow-700">
                This feature is only available to subscribers. Upgrade your account to continue.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            type="button"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => {
              // TODO: Implement subscription/payment flow
              // This could redirect to Stripe Checkout, your pricing page, etc.
              console.log("TODO: Implement subscription flow");
              alert("Subscription flow not implemented yet");
            }}
          >
            Upgrade to Premium
          </button>

          <Link
            to={redirect}
            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Go Back
          </Link>
        </div>
      </div>
    </div>
  );
}
