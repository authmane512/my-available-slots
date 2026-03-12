import { useState } from "react";
import "./App.css";

interface EventTypeSlots {
  title: string;
  slug: string;
  lengthInMinutes?: number;
  slots: Record<string, Array<{ time: string }>>;
}

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const today = new Date();
const in10Days = new Date(today);
in10Days.setDate(today.getDate() + 10);

type Lang = "fr" | "en";

const labels: Record<Lang, {
  title: string;
  startDate: string;
  endDate: string;
  timeZone: string;
  language: string;
  loadBtn: string;
  loadingBtn: string;
  noSlots: string;
  copied: string;
  copy: string;
}> = {
  fr: {
    title: "Mes disponibilités",
    startDate: "Date de début",
    endDate: "Date de fin",
    timeZone: "Fuseau horaire (optionnel)",
    language: "Langue",
    loadBtn: "Charger les disponibilités",
    loadingBtn: "Chargement…",
    noSlots: "Aucune disponibilité trouvée pour cette période.",
    copied: "Copié !",
    copy: "Copier",
  },
  en: {
    title: "My Availabilities",
    startDate: "Start Date",
    endDate: "End Date",
    timeZone: "Time Zone (optional)",
    language: "Language",
    loadBtn: "Load available slots",
    loadingBtn: "Loading…",
    noSlots: "No available slots found for this period.",
    copied: "Copied!",
    copy: "Copy",
  },
};

function App() {
  const [start, setStart] = useState(toDateString(today));
  const [end, setEnd] = useState(toDateString(in10Days));
  const [timeZone, setTimeZone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [lang, setLang] = useState<Lang>("fr");
  const [results, setResults] = useState<EventTypeSlots[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const t = labels[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResults(null);
    setCopied(false);

    if (!start || !end) {
      setError(lang === "fr" ? "Veuillez sélectionner les deux dates." : "Please select both dates.");
      return;
    }

    const params = new URLSearchParams({
      start: new Date(start).toISOString(),
      end: new Date(end).toISOString(),
    });

    if (timeZone) {
      params.set("timeZone", timeZone);
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/availability?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to fetch slots.");
        return;
      }

      setResults(data.data ?? []);
    } catch {
      setError(lang === "fr" ? "Impossible de se connecter au serveur." : "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    const d = new Date(timeStr);
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: timeZone || undefined,
    });
  };

  // Merge all event type slots into a single map grouped by date
  const mergedSlots: Record<string, string[]> = {};
  if (results) {
    for (const et of results) {
      for (const [date, times] of Object.entries(et.slots)) {
        if (!mergedSlots[date]) {
          mergedSlots[date] = [];
        }
        for (const slot of times) {
          const formatted = formatTime(slot.time);
          if (!mergedSlots[date].includes(formatted)) {
            mergedSlots[date].push(formatted);
          }
        }
      }
    }
    // Sort times within each day
    for (const date of Object.keys(mergedSlots)) {
      mergedSlots[date].sort();
    }
  }

  const sortedDates = Object.keys(mergedSlots).sort();
  const hasSlots = sortedDates.length > 0;

  // Build plain text output
  const plainText = sortedDates
    .map((date) => {
      const header = formatDate(date);
      const times = mergedSlots[date].map((t) => `  • ${t}`).join("\n");
      return `${header}\n${times}`;
    })
    .join("\n\n");

  const noSlotsText = results !== null && !hasSlots ? t.noSlots : "";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container">
      <h1>{t.title}</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label>
            {t.startDate}
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              required
            />
          </label>
          <label>
            {t.endDate}
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              required
            />
          </label>
        </div>

        <div className="form-row">
          <label>
            {t.timeZone}
            <input
              type="text"
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
              placeholder="e.g. Europe/Zurich"
            />
          </label>
          <label>
            {t.language}
            <select value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? t.loadingBtn : t.loadBtn}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {noSlotsText && <p className="empty">{noSlotsText}</p>}

      {hasSlots && (
        <div className="results">
          <div className="textarea-header">
            <button
              type="button"
              className="copy-btn"
              onClick={handleCopy}
            >
              {copied ? t.copied : t.copy}
            </button>
          </div>
          <textarea
            className="slots-text"
            readOnly
            value={plainText}
            rows={Math.min(plainText.split("\n").length + 1, 30)}
          />
        </div>
      )}
    </div>
  );
}

export default App;
