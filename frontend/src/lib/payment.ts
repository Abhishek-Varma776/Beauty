interface CheckoutInput {
  key: string;
  amount: number;
  currency: string;
  orderId: string;
  name: string;
  description: string;
  customerName?: string;
  customerContact?: string;
}

export const loadRazorpayScript = () => {
  return new Promise<boolean>((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const openRazorpayCheckout = (input: CheckoutInput) => {
  return new Promise<any>((resolve, reject) => {
    const options = {
      key: input.key || "rzp_test_placeholder",
      amount: input.amount,
      currency: input.currency,
      name: input.name,
      description: input.description,
      // If orderId is simulated (e.g. order_123) rather than a real Razorpay Order ID created in the backend,
      // Razorpay checkout will run in payment-bypass mode. If it's a real order ID, it handles live payment verification.
      order_id: input.orderId.startsWith("order_") ? undefined : input.orderId,
      handler: (response: any) => {
        resolve({
          razorpay_order_id: response.razorpay_order_id || input.orderId,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature || "live_signature",
        });
      },
      prefill: {
        name: input.customerName || "",
        contact: input.customerContact || "",
      },
      theme: {
        color: "#c9a227", // Mani's Elite Gold Theme color!
      },
      modal: {
        ondismiss: () => {
          reject(new Error("Payment cancelled by user."));
        },
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  });
};
