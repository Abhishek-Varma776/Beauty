import { useEffect, useState } from "react";

import { fetchGalleryItems, uploadGalleryItem } from "../../lib/queries";
import type { GalleryItem } from "../../types/domain";

export const GalleryManager = ({ canEdit }: { canEdit: boolean }) => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchGalleryItems();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load gallery");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const upload = async () => {
    if (!canEdit || !file || !title.trim()) {
      return;
    }

    setUploading(true);
    setError(null);
    setMessage(null);

    try {
      await uploadGalleryItem({ title: title.trim(), file });
      setTitle("");
      setFile(null);
      setMessage("Gallery image uploaded.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="grid gap-5 lg:grid-cols-[320px,1fr]">
      <div className="panel space-y-3">
        <h2 className="font-display text-2xl text-brand-900">Upload Gallery</h2>
        <input className="input" placeholder="Photo title" value={title} onChange={(event) => setTitle(event.target.value)} />
        <input className="input" type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
        <button className="btn-primary w-full" type="button" disabled={!canEdit || !file || !title || uploading} onClick={() => void upload()}>
          {uploading ? "Uploading..." : "Upload Photo"}
        </button>
        {message && <p className="text-sm text-emerald-700">{message}</p>}
        {error && <p className="text-sm text-red-700">{error}</p>}
      </div>

      <div className="panel">
        <h2 className="font-display text-2xl text-brand-900">Gallery Items</h2>
        {loading ? (
          <p className="mt-3 text-sm text-slate-600">Loading gallery...</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <figure key={item.id} className="rounded-xl border border-brand-100 bg-white p-2">
                <img src={item.image_url} alt={item.title} className="h-32 w-full rounded-lg object-cover" />
                <figcaption className="mt-2 text-sm font-medium text-slate-700">{item.title}</figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
