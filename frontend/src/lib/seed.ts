import type { GalleryItem, Service } from "../types/domain";

const now = new Date().toISOString();

export const seededServices: Service[] = [
  {
    id: "bridal-makeup",
    name: "Bridal Makeup",
    description: "HD bridal makeup with skin prep, draping support, and long-wear finish.",
    price: 7999,
    duration_min: 180,
    image_url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80",
    is_active: true,
    created_at: now,
  },
  {
    id: "glow-facial",
    name: "Glow Facial",
    description: "A relaxing herbal facial for brighter, refreshed skin at home.",
    price: 1499,
    duration_min: 75,
    image_url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=80",
    is_active: true,
    created_at: now,
  },
  {
    id: "hair-spa",
    name: "Hair Spa",
    description: "Deep conditioning treatment with massage and steam care.",
    price: 1299,
    duration_min: 60,
    image_url: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=900&q=80",
    is_active: true,
    created_at: now,
  },
];

export const fallbackGallery: GalleryItem[] = seededServices.map((service) => ({
  id: `gallery-${service.id}`,
  image_url: service.image_url ?? "",
  title: service.name,
  uploaded_by: "seed",
  uploaded_at: now,
}));

export const customerReviews = [
  { author: "Priya S.", text: "The facial was calm, hygienic, and my skin looked fresh for days." },
  { author: "Ananya R.", text: "Bridal makeup at home saved so much time. The finish was beautiful." },
  { author: "Meera K.", text: "Easy booking and punctual service. I will book the hair spa again." },
];
