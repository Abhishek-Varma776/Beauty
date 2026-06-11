import API from "../api/axios";
import type { Booking, BookingStatus, BusinessHour, GalleryItem, PaymentType, Service, SlotOption } from "../types/domain";

type MongoEntity = {
  _id?: string;
  id?: string;
  createdAt?: string;
  created_at?: string;
};

const withId = <T extends MongoEntity>(item: T) => ({
  ...item,
  id: item.id ?? item._id ?? "",
  created_at: item.created_at ?? item.createdAt ?? new Date().toISOString(),
});

const normalizeService = (service: Service & MongoEntity): Service => withId(service);

const normalizeBooking = (booking: Booking & MongoEntity & { service?: Service & MongoEntity }): Booking => ({
  ...withId(booking),
  service: booking.service ? normalizeService(booking.service) : undefined,
});

const normalizeGalleryItem = (item: GalleryItem & MongoEntity & { createdAt?: string }): GalleryItem => ({
  ...withId(item),
  uploaded_at: item.uploaded_at ?? item.createdAt ?? new Date().toISOString(),
});

const normalizeBusinessHour = (hour: BusinessHour & MongoEntity): BusinessHour => withId(hour);

export const seedDefaultServicesIfEmpty = async (_services?: Service[]) => undefined;

export const fetchAllServices = async () => {
  const response = await API.get("/services", { params: { all: true } });
  return (response.data.services as Array<Service & MongoEntity>).map(normalizeService);
};

export const fetchActiveServices = async () => {
  const response = await API.get("/services");
  return (response.data.services as Array<Service & MongoEntity>).map(normalizeService);
};

export const fetchServiceById = async (serviceId: string) => {
  const response = await API.get(`/services/${serviceId}`);
  return normalizeService(response.data.service as Service & MongoEntity);
};

export const createService = async (input: FormData | Partial<Service>) => {
  const response = await API.post("/services", input);
  return normalizeService(response.data.service as Service & MongoEntity);
};

export const updateService = async (input: FormData | (Partial<Service> & { id: string })) => {
  if (input instanceof FormData) {
    const id = input.get("id");
    const response = await API.patch(`/services/${id}`, input);
    return normalizeService(response.data.service as Service & MongoEntity);
  }
  const { id, ...payload } = input;
  const response = await API.patch(`/services/${id}`, payload);
  return normalizeService(response.data.service as Service & MongoEntity);
};

export const fetchGalleryItems = async () => {
  const response = await API.get("/gallery");
  return (response.data.items as Array<GalleryItem & MongoEntity>).map(normalizeGalleryItem);
};

export const uploadGalleryItem = async ({ title, file }: { title: string; file: File }) => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("image", file);
  const response = await API.post("/gallery", formData);
  return normalizeGalleryItem(response.data.item as GalleryItem & MongoEntity);
};

export const fetchBusinessHours = async () => {
  const response = await API.get("/business-hours");
  return (response.data.hours as Array<BusinessHour & MongoEntity>).map(normalizeBusinessHour);
};

export const upsertBusinessHour = async (nextHour: Partial<BusinessHour> & { weekday: number }) => {
  const response = await API.put("/business-hours", nextHour);
  return normalizeBusinessHour(response.data.hour as BusinessHour & MongoEntity);
};

export const fetchAvailableSlots = async ({ targetDate, service }: { targetDate: string; service: Service }) => {
  const response = await API.get("/bookings/slots", {
    params: { targetDate, serviceId: service.id },
  });
  return response.data.slots as SlotOption[];
};

export const createBooking = async ({
  service,
  slot,
  paymentType,
  serviceType = "home",
  customerName,
  address,
  addressLat,
  addressLng,
}: {
  userId: string;
  service: Service;
  slot: SlotOption;
  paymentType: PaymentType;
  serviceType?: "home" | "salon";
  customerName?: string;
  address?: string;
  addressLat?: number;
  addressLng?: number;
}) => {
  const response = await API.post("/bookings", {
    service_id: service.id,
    starts_at: slot.startsAtIso,
    ends_at: slot.endsAtIso,
    payment_type: paymentType,
    service_type: serviceType,
    customer_name: customerName || "",
    address: address || "",
    address_lat: addressLat || null,
    address_lng: addressLng || null,
  });
  return normalizeBooking(response.data.booking as Booking & MongoEntity);
};

export const fetchCustomerBookings = async (_userId: string) => {
  const response = await API.get("/bookings/my");
  return (response.data.bookings as Array<Booking & MongoEntity>).map(normalizeBooking);
};

export const fetchAdminBookings = async () => {
  const response = await API.get("/bookings/admin");
  return (response.data.bookings as Array<Booking & MongoEntity>).map(normalizeBooking);
};

export const fetchBookingById = async (bookingId: string) => {
  const response = await API.get(`/bookings/${bookingId}`);
  return normalizeBooking(response.data.booking as Booking & MongoEntity);
};

export const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
  const response = await API.patch(`/bookings/${bookingId}/status`, { status });
  return normalizeBooking(response.data.booking as Booking & MongoEntity);
};

export const cancelBooking = async (bookingId: string) => {
  const response = await API.patch(`/bookings/${bookingId}/cancel`);
  return normalizeBooking(response.data.booking as Booking & MongoEntity);
};

export const createOnlineOrder = async ({ bookingId, amount }: { bookingId: string; amount: number; accessToken: string }) => {
  const response = await API.post("/bookings/payments/order", { bookingId, amount });
  return response.data as { keyId: string; amount: number; currency: string; orderId: string; redirectUrl?: string; isSimulated: boolean };
};

export const verifyPaymentAndConfirm = async (payload: {
  bookingId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  accessToken?: string;
}) => {
  const response = await API.post("/bookings/payments/verify", payload);
  return normalizeBooking(response.data.booking as Booking & MongoEntity);
};
