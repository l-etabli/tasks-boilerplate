import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "../../../providers/SessionProvider";

export const Route = createFileRoute("/_authenticated/_subscribed/premium-feature")({
  component: PremiumFeature,
});

function PremiumFeature() {
  const { session } = useSession();
  const user = session?.user;

  if (!user) {
    return <div>Loading user...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Premium Feature</h1>
            <p className="text-lg text-gray-600 mb-6">
              Congratulations! You have access to this premium feature.
            </p>

            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <title>Checkmark</title>
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">Subscription Active</p>
                  <p className="text-sm text-green-700">
                    Welcome, {user.name || user.email}! Your subscription is active.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Premium Content</h2>
              <p className="text-gray-600 mb-4">
                This is where you would implement your premium features. Some examples:
              </p>
              <ul className="text-left text-gray-600 space-y-2">
                <li>• Advanced analytics and reporting</li>
                <li>• Priority customer support</li>
                <li>• Extended API limits</li>
                <li>• Advanced customization options</li>
                <li>• Export functionality</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
