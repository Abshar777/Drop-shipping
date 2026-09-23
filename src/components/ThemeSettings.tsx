"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  THEME_PRESETS,
  THEME_FONTS,
  THEME_CORNERS,
  THEME_COLOR_LABELS,
  hasCustomizations,
  normalizeHex,
  resolvePreset,
  type ThemeColors,
  type ThemeCorners,
  type ThemeFont,
  type ThemePreset,
  type ThemeSettings as Settings,
} from "@/lib/themes";

const JSON_HEADERS = { "Content-Type": "application/json" };

// Every colour, grouped the way Shopify's theme settings group them.
const COLOR_GROUPS: Array<{ title: string; keys: Array<keyof ThemeColors> }> = [
  { title: "Base", keys: ["background", "surface", "foreground", "muted", "border"] },
  { title: "Buttons & links", keys: ["primary", "primaryHover", "primaryForeground", "primarySoft"] },
  { title: "Badges & icons", keys: ["accent", "accentForeground", "accentSoft"] },
  { title: "Hero banner", keys: ["heroFrom", "heroTo", "heroForeground", "heroButton", "heroButtonForeground"] },
  { title: "Footer", keys: ["footer", "footerForeground"] },
];

/** Small mock storefront painted with a theme's colours, like a theme card in Shopify's library. */
function ThemePreview({ theme }: { theme: ThemePreset }) {
  const c = theme.colors;
  const corners = THEME_CORNERS[theme.corners];
  return (
    <div
      className="w-full overflow-hidden border"
      style={{
        background: c.background,
        borderColor: c.border,
        borderRadius: corners.card,
        fontFamily: `"${THEME_FONTS[theme.font].family}", sans-serif`,
      }}
    >
      <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: `1px solid ${c.border}` }}>
        <span className="text-xs font-extrabold" style={{ color: c.primary }}>
          anyitems<span style={{ color: c.foreground }}>.in</span>
        </span>
        <span className="h-2 w-10 rounded-full" style={{ background: c.border }} />
      </div>
      <div
        className="mx-3 mt-3 px-3 py-4"
        style={{
          backgroundImage: `linear-gradient(135deg, ${c.heroFrom}, ${c.heroTo})`,
          color: c.heroForeground,
          borderRadius: corners.card,
        }}
      >
        <div className="text-sm font-extrabold leading-tight">Trending finds</div>
        <span
          className="mt-2 inline-block px-3 py-1 text-[10px] font-semibold"
          style={{ background: c.heroButton, color: c.heroButtonForeground, borderRadius: corners.button }}
        >
          Shop Now
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 px-3 py-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="overflow-hidden border"
            style={{ background: c.surface, borderColor: c.border, borderRadius: corners.card }}
          >
            <div className="h-8 relative" style={{ background: c.primarySoft }}>
              {i === 0 && (
                <span
                  className="absolute top-1 left-1 px-1 text-[8px] font-bold"
                  style={{ background: c.accent, color: c.accentForeground, borderRadius: corners.button }}
                >
                  -20%
                </span>
              )}
            </div>
            <div className="p-1.5">
              <div className="h-1.5 w-3/4 rounded-full" style={{ background: c.muted, opacity: 0.5 }} />
              <div className="mt-1 h-1.5 w-1/2 rounded-full" style={{ background: c.foreground }} />
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between px-3 py-2 text-[10px]" style={{ background: c.footer, color: c.footerForeground }}>
        <span>anyitems.in</span>
        <span style={{ opacity: 0.7 }}>
          {THEME_FONTS[theme.font].label} · {THEME_CORNERS[theme.corners].label}
        </span>
      </div>
    </div>
  );
}

/** Colour picker plus an editable hex code. Commits only valid colours; tolerates typing in between. */
function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  const [text, setText] = useState(value);
  // When the committed colour changes from outside (picker, discard, reset), show it in the text box.
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setText(value);
  }
  const valid = normalizeHex(text) !== null;

  function handleText(next: string) {
    setText(next);
    const hex = normalizeHex(next);
    if (hex) onChange(hex);
  }

  return (
    <label className="flex items-center gap-2 text-xs text-gray-700">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-9 shrink-0 cursor-pointer rounded border border-gray-300 bg-white p-0.5"
        aria-label={`${label} colour`}
      />
      <input
        type="text"
        value={text}
        onChange={(e) => handleText(e.target.value)}
        onBlur={() => setText(value)}
        spellCheck={false}
        maxLength={7}
        className={`w-[5.5rem] shrink-0 font-mono text-xs border rounded px-1.5 py-1 bg-white ${
          valid ? "border-gray-300" : "border-red-400 text-red-600"
        }`}
        aria-label={`${label} hex code`}
      />
      <span className="leading-tight">{label}</span>
    </label>
  );
}

export default function ThemeSettings() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [draft, setDraft] = useState<Settings | null>(null);
  const [editingId, setEditingId] = useState<string>(THEME_PRESETS[0].id);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/theme")
      .then((res) => res.json())
      .then((data) => {
        if (!data.settings) return;
        setSettings(data.settings);
        setDraft(data.settings);
        setEditingId(data.settings.preset);
      });
  }, []);

  async function save(next: Settings, okText: string) {
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/theme", { method: "PUT", headers: JSON_HEADERS, body: JSON.stringify(next) });
    const data = await res.json();
    if (res.ok) {
      setSettings(data.settings);
      setDraft(data.settings);
      setMessage({ kind: "ok", text: okText });
      router.refresh();
    } else {
      setMessage({ kind: "error", text: data.error || "Could not save the theme." });
    }
    setSaving(false);
  }

  if (!settings || !draft) return <p className="text-gray-500">Loading...</p>;

  const editing = resolvePreset(draft, editingId);
  const editingIsActive = editingId === settings.preset;
  const dirty = JSON.stringify(draft.customizations[editingId] ?? {}) !== JSON.stringify(settings.customizations[editingId] ?? {});
  const customised = hasCustomizations(draft.customizations[editingId]);

  function updateOverrides(mutate: (o: NonNullable<Settings["customizations"][string]>) => void) {
    setDraft((d) => {
      if (!d) return d;
      const current = { ...(d.customizations[editingId] ?? {}) };
      current.colors = { ...(current.colors ?? {}) };
      mutate(current);
      return { ...d, customizations: { ...d.customizations, [editingId]: current } };
    });
  }

  function startEditing(id: string) {
    setEditingId(id);
    setMessage(null);
    editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Theme library</h2>
        <p className="text-sm text-gray-500 mb-4">
          Each theme keeps its own colour settings. Apply one to use it on the storefront, or Customize to edit its
          colours first.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {THEME_PRESETS.map((preset) => {
            const isActive = preset.id === settings.preset;
            const isEditing = preset.id === editingId;
            const resolved = resolvePreset(settings, preset.id);
            const tweaked = hasCustomizations(settings.customizations[preset.id]);
            return (
              <div
                key={preset.id}
                className={`bg-white border rounded-lg p-3 flex flex-col gap-3 ${
                  isActive ? "border-orange-500 ring-2 ring-orange-200" : isEditing ? "border-gray-400" : "border-gray-200"
                }`}
              >
                <ThemePreview theme={resolved} />
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 flex items-center gap-2 flex-wrap">
                      {preset.name}
                      {isActive && (
                        <span className="text-[10px] uppercase tracking-wide bg-green-100 text-green-700 rounded-full px-2 py-0.5">
                          Active
                        </span>
                      )}
                      {tweaked && (
                        <span className="text-[10px] uppercase tracking-wide bg-blue-50 text-blue-700 rounded-full px-2 py-0.5">
                          Customised
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">{preset.tagline}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEditing(preset.id)}
                    className={`flex-1 text-sm font-medium px-3 py-1.5 rounded-md border hover:bg-gray-50 ${
                      isEditing ? "border-gray-800 text-gray-900" : "border-gray-300 text-gray-700"
                    }`}
                  >
                    Customize
                  </button>
                  <button
                    onClick={() => save({ ...settings, preset: preset.id }, `“${preset.name}” is now live on the storefront.`)}
                    disabled={saving || isActive}
                    className="flex-1 text-sm font-semibold px-3 py-1.5 rounded-md bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-500"
                  >
                    {isActive ? "Applied" : "Apply"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section ref={editorRef} className="bg-white border border-gray-200 rounded-lg p-5 scroll-mt-4">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Customise “{editing.name}”</h2>
            <p className="text-sm text-gray-500 mb-4">
              {editingIsActive
                ? "This theme is live. Saved changes show on the storefront straight away."
                : "This theme is not live. Changes are saved with the theme and used when you apply it."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <label className="text-sm text-gray-700 flex flex-col gap-1">
                Font
                <select
                  value={editing.font}
                  onChange={(e) => updateOverrides((o) => { o.font = e.target.value as ThemeFont; })}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                >
                  {Object.entries(THEME_FONTS).map(([id, f]) => (
                    <option key={id} value={id}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-gray-700 flex flex-col gap-1">
                Corners
                <select
                  value={editing.corners}
                  onChange={(e) => updateOverrides((o) => { o.corners = e.target.value as ThemeCorners; })}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                >
                  {Object.entries(THEME_CORNERS).map(([id, c]) => (
                    <option key={id} value={id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex flex-col gap-4">
              {COLOR_GROUPS.map((group) => (
                <div key={group.title}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">{group.title}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                    {group.keys.map((key) => (
                      <ColorField
                        key={key}
                        label={THEME_COLOR_LABELS[key]}
                        value={editing.colors[key]}
                        onChange={(hex) => updateOverrides((o) => { o.colors![key] = hex; })}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              <button
                onClick={() => save(draft, editingIsActive ? "Saved. The storefront now uses these colours." : `Saved with “${editing.name}”.`)}
                disabled={saving || !dirty}
                className="bg-orange-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-orange-700 text-sm disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
              {!editingIsActive && (
                <button
                  onClick={() => save({ ...draft, preset: editingId }, `Saved and applied “${editing.name}”.`)}
                  disabled={saving}
                  className="border border-orange-600 text-orange-700 font-semibold px-4 py-2 rounded-md hover:bg-orange-50 text-sm disabled:opacity-50"
                >
                  Save &amp; apply
                </button>
              )}
              <button
                onClick={() => setDraft(settings)}
                disabled={saving || !dirty}
                className="border border-gray-300 text-gray-700 font-medium px-4 py-2 rounded-md hover:bg-gray-50 text-sm disabled:opacity-50"
              >
                Discard
              </button>
              <button
                onClick={() => {
                  const next = { ...settings, customizations: { ...settings.customizations } };
                  delete next.customizations[editingId];
                  save(next, `“${editing.name}” is back to its default colours.`);
                }}
                disabled={saving || !customised}
                className="text-sm text-gray-500 hover:text-red-600 disabled:opacity-50"
              >
                Reset to defaults
              </button>
              {message && (
                <span className={`text-sm ${message.kind === "ok" ? "text-green-700" : "text-red-600"}`}>{message.text}</span>
              )}
            </div>
          </div>

          <div className="md:w-72 shrink-0">
            <p className="text-xs font-medium text-gray-500 mb-2">Live preview</p>
            <ThemePreview theme={editing} />
          </div>
        </div>
      </section>
    </div>
  );
}
