interface CheckoutInput {
  key: string;
  amount: number;
  currency: string;
  orderId: string;
  name: string;
  description: string;
  customerName?: string;
  customerContact?: string;
  customerEmail?: string;
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
  return new Promise<{
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }>((resolve, reject) => {
    const options = {
      key: input.key,
      amount: input.amount,
      currency: input.currency || "INR",
      name: input.name,
      description: input.description,
      // Always pass the real Razorpay order_id from backend
      order_id: input.orderId,
      handler: (response: any) => {
        resolve({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
      prefill: {
        name: input.customerName || "",
        contact: input.customerContact || "",
        email: input.customerEmail || "",
      },
      theme: {
        color: "#c9a227", // Mani's Elite Gold
      },
      modal: {
        ondismiss: () => {
          reject(new Error("Payment was cancelled. Please try again."));
        },
        escape: true,
        animation: true,
      },
    };

    const rzp = new (window as any).Razorpay(options);

    rzp.on("payment.failed", (response: any) => {
      reject(new Error(response.error?.description || "Payment failed. Please try again."));
    });

    rzp.open();
  });
};
