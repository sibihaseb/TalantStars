import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Loader2 } from 'lucide-react';
import { apiRequest } from "@/lib/queryClient";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

interface PaymentFormProps {
  clientSecret: string;
  tierId: number;
  amount: number;
  tierName: string;
  isAnnual?: boolean;
  onSuccess?: () => void;
}

function CheckoutForm({ tierId, amount, tierName, isAnnual, onSuccess }: Omit<PaymentFormProps, 'clientSecret'>) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard?payment=success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Payment succeeded
        toast({
          title: "Payment Successful!",
          description: `Successfully upgraded to ${tierName}`,
        });
        
        // Update user tier in backend
        try {
          await apiRequest('POST', '/api/user/update-tier', {
            tierId,
            paymentIntentId: 'payment_succeeded'
          });
          
          onSuccess?.();
        } catch (updateError) {
          console.error('Error updating user tier:', updateError);
          toast({
            title: "Payment Processed",
            description: "Payment successful, but there was an issue updating your account. Please contact support.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900">Payment Summary</h3>
        <div className="flex justify-between items-center mt-2">
          <span className="text-blue-700">{tierName} {isAnnual ? '(Annual)' : '(Monthly)'}</span>
          <span className="text-xl font-bold text-blue-900">${amount.toFixed(2)}</span>
        </div>
      </div>
      
      <PaymentElement />
      
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Pay ${amount.toFixed(2)}
          </>
        )}
      </Button>
    </form>
  );
}

export default function StripePaymentForm({ clientSecret, tierId, amount, tierName, isAnnual, onSuccess }: PaymentFormProps) {
  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#2563eb',
      colorBackground: '#ffffff',
      colorText: '#374151',
      colorDanger: '#ef4444',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Complete Your Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm 
            tierId={tierId} 
            amount={amount} 
            tierName={tierName} 
            isAnnual={isAnnual}
            onSuccess={onSuccess}
          />
        </Elements>
      </CardContent>
    </Card>
  );
}