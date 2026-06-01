import { useEffect, useState } from "react";

import { fetchBusinessHours, upsertBusinessHour } from "../../lib/queries";

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface HourState {
  weekday: number;
  open_time: string;
  close_time: string;
  is_open: boolean;
}

const defaultHours: HourState[] = weekdays.map((_, index) => ({
  weekday: index,
  open_time: "10:00",
  close_time: "20:00",
  is_open: index !== 0,
}));

export const SlotManager = ({ canEdit }: { canEdit: boolean }) => {
  const [hours, setHours] = useState<HourState[]>(defaultHours);
  const [saving, setSaving] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchBusinessHours();
        if (data.length > 0) {
          const next = defaultHours.map((row) => data.find((item) => item.weekday === row.weekday) ?? row);
          setHours(next);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load business hours");
      }
    };

    void load();
  }, []);

  const save = async (row: HourState) => {
    if (!canEdit) {
      return;
    }

    setMessage(null);
    setError(null);
    setSaving(row.weekday);

    try {
      await upsertBusinessHour(row);
      setMessage(`Saved ${weekdays[row.weekday]} timings.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save business hour");
    } finally {
      setSaving(null);
    }
  };

  return (
    <section className="panel">
      <h2 className="font-display text-2xl text-brand-900">Manage Time Slots</h2>
      <p className="mt-1 text-sm text-slate-600">Define opening and closing hours for each day.</p>
      <div className="mt-4 space-y-3">
        {hours.map((row) => (
          <div key={row.weekday} className="grid gap-2 rounded-xl border border-brand-100 bg-white p-3 md:grid-cols-[1.2fr,1fr,1fr,auto,auto] md:items-center">
            <div>
              <p className="font-medium text-slate-800">{weekdays[row.weekday]}</p>
            </div>
            <input
              className="input"
              type="time"
              value={row.open_time}
              onChange={(event) =>
                setHours((prev) =>
                  prev.map((item) => (item.weekday === row.weekday ? { ...item, open_time: event.target.value } : item)),
                )
              }
            />
            <input
              className="input"
              type="time"
              value={row.close_time}
              onChange={(event) =>
                setHours((prev) =>
                  prev.map((item) => (item.weekday === row.weekday ? { ...item, close_time: event.target.value } : item)),
                )
              }
            />
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={row.is_open}
                onChange={(event) =>
                  setHours((prev) =>
                    prev.map((item) => (item.weekday === row.weekday ? { ...item, is_open: event.target.checked } : item)),
                  )
                }
              />
              Open
            </label>
            <button className="btn-secondary" type="button" disabled={!canEdit || saving === row.weekday} onClick={() => void save(row)}>
              {saving === row.weekday ? "Saving..." : "Save"}
            </button>
          </div>
        ))}
      </div>
      {message && <p className="mt-3 text-sm text-emerald-700">{message}</p>}
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
    </section>
  );
};
