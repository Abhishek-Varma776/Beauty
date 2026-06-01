import { useEffect, useState } from "react";

import { createService, fetchAllServices, updateService } from "../../lib/queries";
import type { Service } from "../../types/domain";

interface ServiceManagerProps {
  canEdit: boolean;
}

const initialForm = {
  name: "",
  description: "",
  price: 0,
  duration_min: 30,
  image_url: "",
};

export const ServiceManager = ({ canEdit }: ServiceManagerProps) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const next = await fetchAllServices();
      setServices(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const submit = async () => {
    if (!canEdit) {
      return;
    }

    setError(null);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", String(form.price));
      formData.append("duration_min", String(form.duration_min));
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await createService(formData);
      setForm(initialForm);
      setImageFile(null);
      setMessage("Service created successfully.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create service");
    }
  };

  const toggleActive = async (service: Service) => {
    if (!canEdit) {
      return;
    }

    try {
      await updateService({ id: service.id, is_active: !service.is_active });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update service");
    }
  };

  return (
    <section className="grid gap-5 lg:grid-cols-[320px,1fr]">
      <div className="panel space-y-3">
        <h2 className="font-display text-2xl text-brand-900">Add Service</h2>
        <input className="input" placeholder="Service name" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
        <textarea
          className="input min-h-24"
          placeholder="Service description"
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
        />
        <input
          className="input"
          placeholder="Price (INR)"
          type="number"
          min={0}
          value={form.price}
          onChange={(event) => setForm((prev) => ({ ...prev, price: Number(event.target.value) }))}
        />
        <input
          className="input"
          placeholder="Duration (minutes)"
          type="number"
          min={15}
          step={15}
          value={form.duration_min}
          onChange={(event) => setForm((prev) => ({ ...prev, duration_min: Number(event.target.value) }))}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <label style={{ color: "#888", fontSize: "0.75rem", fontWeight: 500 }}>SERVICE IMAGE</label>
          <div style={{
            border: "1px dashed rgba(201,162,39,0.4)",
            borderRadius: "0.75rem",
            padding: "1rem",
            textAlign: "center",
            background: "rgba(201,162,39,0.02)",
            cursor: "pointer",
            position: "relative"
          }}>
            <input
              type="file"
              accept="image/*"
              style={{
                position: "absolute", inset: 0, opacity: 0, cursor: "pointer"
              }}
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setImageFile(file);
              }}
            />
            <p style={{ color: "#c9a227", fontSize: "0.85rem", margin: 0, fontWeight: 500 }}>
              {imageFile ? `📸 ${imageFile.name}` : "📂 Upload Service Image"}
            </p>
            <p style={{ color: "#555", fontSize: "0.7rem", margin: "4px 0 0" }}>
              PNG, JPG or JPEG up to 5MB
            </p>
          </div>
        </div>
        <button className="btn-primary w-full" type="button" onClick={() => void submit()} disabled={!canEdit || !form.name || !form.description}>
          Create Service
        </button>
        {message && <p className="text-sm text-emerald-700">{message}</p>}
        {error && <p className="text-sm text-red-700">{error}</p>}
      </div>

      <div className="panel">
        <h2 className="font-display text-2xl text-brand-900">Current Services</h2>
        {loading ? (
          <p className="mt-3 text-sm text-slate-600">Loading services...</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-brand-100 text-left text-slate-600">
                  <th className="p-2">Name</th>
                  <th className="p-2">Price</th>
                  <th className="p-2">Duration</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id} className="border-b border-brand-50">
                    <td className="p-2 font-medium">{service.name}</td>
                    <td className="p-2">INR {service.price}</td>
                    <td className="p-2">{service.duration_min}m</td>
                    <td className="p-2">{service.is_active ? "Active" : "Inactive"}</td>
                    <td className="p-2">
                      <button className="btn-secondary" type="button" disabled={!canEdit} onClick={() => void toggleActive(service)}>
                        {service.is_active ? "Disable" : "Enable"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};
