import { format, parseISO } from "date-fns";

export const canCancelBooking = (startsAtIso: string) => {
  const startsAt = parseISO(startsAtIso).getTime();
  const fourHours = 4 * 60 * 60 * 1000;
  return startsAt - Date.now() > fourHours;
};

export const formatBookingDateTime = (startsAtIso: string, endsAtIso: string) =>
  `${format(parseISO(startsAtIso), "dd MMM yyyy, hh:mm a")} - ${format(parseISO(endsAtIso), "hh:mm a")}`;
