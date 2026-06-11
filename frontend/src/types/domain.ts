export type Role = "admin" | "customer";
export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type PaymentType = "online" | "cash";
export type PaymentStatus = "created" | "paid" | "failed" | "not_required" | "refunded";

export interface Profile {
  id: string;
  phone: string;
  name: string;
  email?: string;
  role: Role;
  created_at: string;
  dob?: string | null;
  gender?: string;
  beautyUse?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  price_home?: number;
  duration_min: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  service_id: string;
  starts_at: string;
  ends_at: string;
  status: BookingStatus;
  payment_type: PaymentType;
  payment_status: PaymentStatus;
  service_type?: "home" | "salon";
  created_at: string;
  service?: Service;
  customer_name?: string;
  address?: string;
  address_lat?: number | null;
  address_lng?: number | null;
}

export interface GalleryItem {
  id: string;
  image_url: string;
  title: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface BusinessHour {
  id: string;
  weekday: number;
  open_time: string;
  close_time: string;
  is_open: boolean;
}

export interface SlotOption {
  startsAtIso: string;
  endsAtIso: string;
  label: string;
  isBooked?: boolean;
}
