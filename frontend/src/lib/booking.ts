import { parseISO } from "date-fns";

export const canCancelBooking = (startsAtIso: string) => {
  const startsAt = parseISO(startsAtIso).getTime();
  const fourHours = 4 * 60 * 60 * 1000;
  return startsAt - Date.now() > fourHours;
};

export const formatDateIST = (dateStr: string) => {
  const d = new Date(dateStr);
  const day = d.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit" });
  const month = d.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", month: "long" });
  const year = d.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", year: "numeric" });
  return `${day} ${month} ${year}`;
};

export const formatDateISTShort = (dateStr: string) => {
  const d = new Date(dateStr);
  const day = d.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit" });
  const month = d.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", month: "short" });
  const year = d.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", year: "numeric" });
  return `${day} ${month} ${year}`;
};

export const formatTimeIST = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
};

export const formatBookingDateTime = (startsAtIso: string, endsAtIso: string) => {
  const datePart = formatDateISTShort(startsAtIso);
  const startPart = formatTimeIST(startsAtIso);
  const endPart = formatTimeIST(endsAtIso);
  return `${datePart}, ${startPart} - ${endPart}`;
};
