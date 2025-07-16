import { useState } from "react";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CreditCard, Shield } from "lucide-react";
import { useLocation } from "wouter";

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface StripeCheckoutProps {
  clientSecret: string;
  tier: any;
  isAnnual: boolean;
}

function CheckoutForm({ tier, isAnnual }: { tier: any; isAnnual: boolean }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const confirmPaymentMutation = useMutation({
    mutationFn: async (paymentIntentId: string) => {
      const response = await apiRequest('POST', '/api/confirm-payment', { paymentIntentId });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Payment Successful!",
        description: "Your tier has been activated. Welcome to your new plan!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout`,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Record payment transaction in database
        try {
          await apiRequest('POST', '/api/payments/record-transaction', {
            stripePaymentIntentId: paymentIntent.id,
            tierId: tier.id,
            amount: paymentIntent.amount / 100, // Convert from cents
            isAnnual: isAnnual
          });
        } catch (recordError) {
          console.error('Failed to record payment transaction:', recordError);
        }
        
        confirmPaymentMutation.mutate(paymentIntent.id);
      }
    } catch (err) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const calculatePrice = () => {
    return isAnnual ? parseFloat(tier.annualPrice) : parseFloat(tier.price);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Complete Your Purchase
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">{tier.name}</span>
              <span className="text-lg font-bold">
                ${calculatePrice().toFixed(2)}
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {isAnnual ? 'Annual billing' : 'Monthly billing'}
            </div>
          </div>

          <PaymentElement />

          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Shield className="h-4 w-4" />
            <span>Secured by Stripe</span>
          </div>

          <Button
            type="submit"
            disabled={!stripe || isProcessing || confirmPaymentMutation.isPending}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isProcessing || confirmPaymentMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Processing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Pay ${calculatePrice().toFixed(2)}
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function StripeCheckout({ clientSecret, tier, isAnnual }: StripeCheckoutProps) {
  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#2563eb',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <Elements options={options} stripe={stripePromise}>
      <CheckoutForm tier={tier} isAnnual={isAnnual} />
    </Elements>
  );
}