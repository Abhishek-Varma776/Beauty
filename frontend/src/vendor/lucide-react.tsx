import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
};

const createIcon = (label: string) => {
  const Icon = ({ size, className, ...props }: IconProps) => (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size ?? "1em"}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width={size ?? "1em"}
      {...props}
    >
      <title>{label}</title>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7v5l3 3" />
    </svg>
  );

  Icon.displayName = label;
  return Icon;
};

export const ArrowRight = createIcon("ArrowRight");
export const CheckCircle = createIcon("CheckCircle");
export const CheckCircle2 = createIcon("CheckCircle2");
export const Clock = createIcon("Clock");
export const Clock3 = createIcon("Clock3");
export const Eye = createIcon("Eye");
export const EyeOff = createIcon("EyeOff");
export const Heart = createIcon("Heart");
export const Home = createIcon("Home");
export const Images = createIcon("Images");
export const IndianRupee = createIcon("IndianRupee");
export const Mail = createIcon("Mail");
export const MailCheck = createIcon("MailCheck");
export const MapPin = createIcon("MapPin");
export const Menu = createIcon("Menu");
export const MessageCircle = createIcon("MessageCircle");
export const Phone = createIcon("Phone");
export const Sparkles = createIcon("Sparkles");
export const Star = createIcon("Star");
