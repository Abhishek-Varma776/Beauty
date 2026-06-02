export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "https://beauty-backend-8i3u.onrender.com/api",
  homeServiceCity: import.meta.env.VITE_HOME_SERVICE_CITY ?? "Your City",
  homeServiceRadiusKm: Number(import.meta.env.VITE_HOME_SERVICE_RADIUS_KM ?? 10),
  razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID ?? "",
};
