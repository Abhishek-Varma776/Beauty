import { motion } from "framer-motion";

import type { GalleryItem } from "../../types/domain";

export const GalleryScroller = ({ items }: { items: GalleryItem[] }) => {
  const repeated = [...items, ...items];

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-100 bg-white py-4">
      <motion.div
        className="flex gap-4 px-4"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
      >
        {repeated.map((item, index) => (
          <figure key={`${item.id}-${index}`} className="w-64 flex-shrink-0 space-y-2">
            <img src={item.image_url} alt={item.title} className="h-44 w-full rounded-xl object-cover" />
            <figcaption className="text-sm font-medium text-slate-700">{item.title}</figcaption>
          </figure>
        ))}
      </motion.div>
    </div>
  );
};
