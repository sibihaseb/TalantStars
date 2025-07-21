// Route component to handle pricing page
import { Route, Switch, Redirect } from "wouter";

const PricingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Upgrade Your Plan</h1>
          <p className="text-gray-600">Choose a plan to access premium profile templates and features</p>
        </div>
        {/* Add pricing tiers here */}
      </div>
    </div>
  );
};

export default PricingPage;