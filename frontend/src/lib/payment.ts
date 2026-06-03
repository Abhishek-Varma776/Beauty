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
  if (input.key === "rzp_test_simulation_mode" || input.orderId.startsWith("sim_")) {
    return new Promise<{
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }>((resolve, reject) => {
      // Create background overlay
      const overlay = document.createElement("div");
      overlay.style.position = "fixed";
      overlay.style.inset = "0";
      overlay.style.zIndex = "999999";
      overlay.style.backgroundColor = "rgba(0,0,0,0.85)";
      overlay.style.backdropFilter = "blur(8px)";
      overlay.style.display = "flex";
      overlay.style.alignItems = "center";
      overlay.style.justifyContent = "center";
      overlay.style.fontFamily = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      overlay.style.padding = "1.5rem";

      // Create modal container
      const container = document.createElement("div");
      container.style.width = "100%";
      container.style.maxWidth = "400px";
      container.style.backgroundColor = "#111111";
      container.style.border = "1px solid rgba(201,162,39,0.3)";
      container.style.borderRadius = "1.25rem";
      container.style.boxShadow = "0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(201,162,39,0.05)";
      container.style.padding = "2rem";
      container.style.textAlign = "center";
      container.style.color = "#e8d5a3";

      // Title
      const title = document.createElement("h3");
      title.innerText = "👑 Sandbox Payment Mode";
      title.style.margin = "0 0 0.5rem 0";
      title.style.fontSize = "1.35rem";
      title.style.color = "#e8d5a3";
      title.style.fontWeight = "700";

      // Details description
      const desc = document.createElement("p");
      desc.innerText = `Testing booking checkout for "${input.description}". Since no real Razorpay keys are configured, you are running in offline sandbox checkout mode.`;
      desc.style.color = "#888";
      desc.style.fontSize = "0.85rem";
      desc.style.lineHeight = "1.45";
      desc.style.margin = "0 0 1.5rem 0";

      // Amount Row
      const amtRow = document.createElement("div");
      amtRow.style.margin = "0 0 1.75rem 0";
      amtRow.style.padding = "0.75rem";
      amtRow.style.backgroundColor = "rgba(201,162,39,0.06)";
      amtRow.style.border = "1px dashed rgba(201,162,39,0.25)";
      amtRow.style.borderRadius = "0.75rem";
      amtRow.style.fontSize = "1.1rem";
      amtRow.style.fontWeight = "700";
      amtRow.style.color = "#c9a227";
      amtRow.innerText = `Amount: ₹${(input.amount / 100).toFixed(2)}`;

      // Success Button
      const successBtn = document.createElement("button");
      successBtn.innerText = "Simulate Success ✓";
      successBtn.style.width = "100%";
      successBtn.style.padding = "0.85rem";
      successBtn.style.marginBottom = "0.75rem";
      successBtn.style.borderRadius = "0.75rem";
      successBtn.style.border = "none";
      successBtn.style.background = "linear-gradient(135deg, #c9a227 0%, #a88118 100%)";
      successBtn.style.color = "#000";
      successBtn.style.fontWeight = "700";
      successBtn.style.cursor = "pointer";
      successBtn.style.fontSize = "0.9rem";
      successBtn.style.transition = "transform 0.2s";
      successBtn.onmouseover = () => { successBtn.style.transform = "scale(1.02)"; };
      successBtn.onmouseleave = () => { successBtn.style.transform = "scale(1)"; };

      // Cancel Button
      const cancelBtn = document.createElement("button");
      cancelBtn.innerText = "Simulate Failure ✗";
      cancelBtn.style.width = "100%";
      cancelBtn.style.padding = "0.85rem";
      cancelBtn.style.borderRadius = "0.75rem";
      cancelBtn.style.border = "1px solid rgba(255,255,255,0.1)";
      cancelBtn.style.backgroundColor = "transparent";
      cancelBtn.style.color = "#aaa";
      cancelBtn.style.fontWeight = "600";
      cancelBtn.style.cursor = "pointer";
      cancelBtn.style.fontSize = "0.9rem";
      cancelBtn.style.transition = "color 0.2s, border-color 0.2s";
      cancelBtn.onmouseover = () => { cancelBtn.style.color = "#ff4d4d"; cancelBtn.style.borderColor = "#ff4d4d"; };
      cancelBtn.onmouseleave = () => { cancelBtn.style.color = "#aaa"; cancelBtn.style.borderColor = "rgba(255,255,255,0.1)"; };

      // Button handlers
      successBtn.onclick = () => {
        document.body.removeChild(overlay);
        const mockPayId = `sim_pay_${Math.random().toString(36).substring(2, 9)}`;
        resolve({
          razorpay_order_id: input.orderId,
          razorpay_payment_id: mockPayId,
          razorpay_signature: "simulated_signature",
        });
      };

      cancelBtn.onclick = () => {
        document.body.removeChild(overlay);
        reject(new Error("Test sandbox payment simulated failure."));
      };

      // Append elements
      container.appendChild(title);
      container.appendChild(desc);
      container.appendChild(amtRow);
      container.appendChild(successBtn);
      container.appendChild(cancelBtn);
      overlay.appendChild(container);
      document.body.appendChild(overlay);
    });
  }

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

interface PhonepeCheckoutInput {
  key: string;
  amount: number;
  currency: string;
  orderId: string;
  name: string;
  description: string;
  redirectUrl?: string;
  isSimulated: boolean;
}

export const openPhonepeCheckout = (input: PhonepeCheckoutInput) => {
  return new Promise<{
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }>((resolve, reject) => {
    if (input.isSimulated || input.key === "phonepe_simulation_mode" || input.orderId.startsWith("sim_")) {
      // Create background overlay
      const overlay = document.createElement("div");
      overlay.style.position = "fixed";
      overlay.style.inset = "0";
      overlay.style.zIndex = "999999";
      overlay.style.backgroundColor = "rgba(0,0,0,0.85)";
      overlay.style.backdropFilter = "blur(8px)";
      overlay.style.display = "flex";
      overlay.style.alignItems = "center";
      overlay.style.justifyContent = "center";
      overlay.style.fontFamily = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      overlay.style.padding = "1.5rem";

      // Create modal container
      const container = document.createElement("div");
      container.style.width = "100%";
      container.style.maxWidth = "400px";
      container.style.backgroundColor = "#111111";
      container.style.border = "1px solid rgba(201,162,39,0.3)";
      container.style.borderRadius = "1.25rem";
      container.style.boxShadow = "0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(201,162,39,0.05)";
      container.style.padding = "2rem";
      container.style.textAlign = "center";
      container.style.color = "#e8d5a3";

      // Title
      const title = document.createElement("h3");
      title.innerText = "🟣 PhonePe Sandbox Checkout";
      title.style.margin = "0 0 0.5rem 0";
      title.style.fontSize = "1.35rem";
      title.style.color = "#e8d5a3";
      title.style.fontWeight = "700";

      // Details description
      const desc = document.createElement("p");
      desc.innerText = `Testing booking checkout for "${input.description}". Since no real PhonePe credentials are configured, you are running in offline sandbox checkout mode.`;
      desc.style.color = "#888";
      desc.style.fontSize = "0.85rem";
      desc.style.lineHeight = "1.45";
      desc.style.margin = "0 0 1.5rem 0";

      // Amount Row
      const amtRow = document.createElement("div");
      amtRow.style.margin = "0 0 1.75rem 0";
      amtRow.style.padding = "0.75rem";
      amtRow.style.backgroundColor = "rgba(201,162,39,0.06)";
      amtRow.style.border = "1px dashed rgba(201,162,39,0.25)";
      amtRow.style.borderRadius = "0.75rem";
      amtRow.style.fontSize = "1.1rem";
      amtRow.style.fontWeight = "700";
      amtRow.style.color = "#c9a227";
      amtRow.innerText = `Amount: ₹${(input.amount / 100).toFixed(2)}`;

      // Success Button
      const successBtn = document.createElement("button");
      successBtn.innerText = "Simulate Success ✓";
      successBtn.style.width = "100%";
      successBtn.style.padding = "0.85rem";
      successBtn.style.marginBottom = "0.75rem";
      successBtn.style.borderRadius = "0.75rem";
      successBtn.style.border = "none";
      successBtn.style.background = "linear-gradient(135deg, #c9a227 0%, #a88118 100%)";
      successBtn.style.color = "#000";
      successBtn.style.fontWeight = "700";
      successBtn.style.cursor = "pointer";
      successBtn.style.fontSize = "0.9rem";
      successBtn.style.transition = "transform 0.2s";
      successBtn.onmouseover = () => { successBtn.style.transform = "scale(1.02)"; };
      successBtn.onmouseleave = () => { successBtn.style.transform = "scale(1)"; };

      // Cancel Button
      const cancelBtn = document.createElement("button");
      cancelBtn.innerText = "Simulate Failure ✗";
      cancelBtn.style.width = "100%";
      cancelBtn.style.padding = "0.85rem";
      cancelBtn.style.borderRadius = "0.75rem";
      cancelBtn.style.border = "1px solid rgba(255,255,255,0.1)";
      cancelBtn.style.backgroundColor = "transparent";
      cancelBtn.style.color = "#aaa";
      cancelBtn.style.fontWeight = "600";
      cancelBtn.style.cursor = "pointer";
      cancelBtn.style.fontSize = "0.9rem";
      cancelBtn.style.transition = "color 0.2s, border-color 0.2s";
      cancelBtn.onmouseover = () => { cancelBtn.style.color = "#ff4d4d"; cancelBtn.style.borderColor = "#ff4d4d"; };
      cancelBtn.onmouseleave = () => { cancelBtn.style.color = "#aaa"; cancelBtn.style.borderColor = "rgba(255,255,255,0.1)"; };

      // Button handlers
      successBtn.onclick = () => {
        document.body.removeChild(overlay);
        const mockPayId = `pp_pay_${Math.random().toString(36).substring(2, 9)}`;
        resolve({
          razorpay_order_id: input.orderId,
          razorpay_payment_id: mockPayId,
          razorpay_signature: "simulated_signature",
        });
      };

      cancelBtn.onclick = () => {
        document.body.removeChild(overlay);
        reject(new Error("Test sandbox PhonePe payment simulated failure."));
      };

      // Append elements
      container.appendChild(title);
      container.appendChild(desc);
      container.appendChild(amtRow);
      container.appendChild(successBtn);
      container.appendChild(cancelBtn);
      overlay.appendChild(container);
      document.body.appendChild(overlay);
    } else {
      if (input.redirectUrl) {
        window.location.href = input.redirectUrl;
      } else {
        reject(new Error("PhonePe redirect URL is missing."));
      }
    }
  });
};

