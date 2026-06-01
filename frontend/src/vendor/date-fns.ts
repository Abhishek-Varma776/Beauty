const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const pad = (value: number) => String(value).padStart(2, "0");

export const parseISO = (value: string) => new Date(value);

export const format = (dateInput: Date | string | number, pattern: string) => {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  const hours12 = date.getHours() % 12 || 12;
  const replacements: Record<string, string> = {
    yyyy: String(date.getFullYear()),
    MMM: monthNames[date.getMonth()] ?? "",
    dd: pad(date.getDate()),
    MM: pad(date.getMonth() + 1),
    HH: pad(date.getHours()),
    hh: pad(hours12),
    mm: pad(date.getMinutes()),
    a: date.getHours() >= 12 ? "PM" : "AM",
  };

  return pattern.replace(/yyyy|MMM|dd|MM|HH|hh|mm|a/g, (token) => replacements[token] ?? token);
};
