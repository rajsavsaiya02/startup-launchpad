import React from "react";
import { Card } from "../../../../components/ui/Card";

export function FoundationsPage() {
  return (
    <div className="space-y-16 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-4xl font-black text-text-primary dark:text-white mb-4 tracking-tight">
          Design System Tokens
        </h1>
        <p className="text-lg text-text-secondary">
          Core visual values for the Startup LaunchPad identity.
        </p>
      </div>

      {/* 1. COLOR PALETTE */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark pb-4">
          <h2 className="text-2xl font-bold text-text-primary dark:text-white">
            Color Palette
          </h2>
        </div>

        {/* Brand & Accents */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {[
            { name: "Primary Blue", hex: "#2F6CE5", bg: "bg-[#2F6CE5]" },
            { name: "Primary Hover", hex: "#2457C9", bg: "bg-[#2457C9]" },
            {
              name: "Primary Light",
              hex: "#E8F0FF",
              bg: "bg-[#E8F0FF] border border-gray-200",
            },
            { name: "Green Accent", hex: "#10B981", bg: "bg-[#10B981]" },
            { name: "Yellow Accent", hex: "#F59E0B", bg: "bg-[#F59E0B]" },
            { name: "Red Accent", hex: "#EF4444", bg: "bg-[#EF4444]" },
          ].map((c) => (
            <div
              key={c.name}
              className="flex flex-col items-center gap-3 group"
            >
              <div
                className={`h-20 w-20 rounded-full shadow-sm ${c.bg} ring-1 ring-black/5 dark:ring-white/10 transition-transform group-hover:scale-110`}
              ></div>
              <div className="text-center">
                <p className="font-bold text-sm text-text-primary dark:text-white">
                  {c.name}
                </p>
                <p className="text-xs text-text-tertiary font-mono">{c.hex}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Neutrals */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 pt-4">
          {[
            { name: "Gray-900", hex: "#111827", bg: "bg-[#111827]" },
            { name: "Gray-800", hex: "#1F2937", bg: "bg-[#1F2937]" },
            { name: "Gray-700", hex: "#374151", bg: "bg-[#374151]" },
            { name: "Gray-600", hex: "#4B5563", bg: "bg-[#4B5563]" },
            { name: "Gray-500", hex: "#6B7280", bg: "bg-[#6B7280]" },
            { name: "Gray-400", hex: "#9CA3AF", bg: "bg-[#9CA3AF]" },
            { name: "Gray-300", hex: "#D1D5DB", bg: "bg-[#D1D5DB]" },
            {
              name: "Gray-50",
              hex: "#F9FAFB",
              bg: "bg-[#F9FAFB] border border-gray-200",
            },
          ].map((c) => (
            <div key={c.name} className="flex flex-col items-center gap-2">
              <div className={`h-16 w-full rounded-xl ${c.bg}`}></div>
              <div className="text-center">
                <p className="font-semibold text-xs text-text-primary dark:text-white">
                  {c.name}
                </p>
                <p className="text-[10px] text-text-tertiary font-mono">
                  {c.hex}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. TYPOGRAPHY */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold border-b border-border-light dark:border-border-dark pb-4">
          Typography — Inter
        </h2>
        <Card className="p-8 space-y-6">
          {[
            {
              name: "H1 Display",
              size: "text-4xl",
              weight: "font-bold",
              lh: "1.2",
            },
            {
              name: "H2 Title",
              size: "text-3xl",
              weight: "font-semibold",
              lh: "1.2",
            },
            {
              name: "H3 Heading",
              size: "text-2xl",
              weight: "font-semibold",
              lh: "1.2",
            },
            {
              name: "Body Large",
              size: "text-xl",
              weight: "font-medium",
              lh: "1.5",
            },
            {
              name: "Body Base",
              size: "text-base",
              weight: "font-normal",
              lh: "1.5",
            },
            {
              name: "Caption",
              size: "text-xs",
              weight: "font-normal",
              lh: "1.5",
            },
          ].map((t) => (
            <div
              key={t.name}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center"
            >
              <span className="text-sm text-text-tertiary">{t.name}</span>
              <p
                className={`md:col-span-3 ${t.size} ${t.weight} text-text-primary dark:text-white`}
                style={{ lineHeight: t.lh }}
              >
                The quick brown fox jumps over the lazy dog
              </p>
            </div>
          ))}
        </Card>
      </section>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <section>
      <div>
      <h2 className="text-2xl font-bold leading-tight tracking-[-0.015em] text-slate-900 dark:text-white pb-6">
        Spacing Scale — 4px Base
      </h2>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-4 bg-primary rounded" style={{ width: "4px" }}></div>
          <p className="text-sm text-slate-500 dark:text-slate-400">4px — space-1</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-4 bg-primary rounded" style={{ width: "8px" }}></div>
          <p className="text-sm text-slate-500 dark:text-slate-400">8px — space-2</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-4 bg-primary rounded" style={{ width: "12px" }}></div>
          <p className="text-sm text-slate-500 dark:text-slate-400">12px — space-3</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-4 bg-primary rounded" style={{ width: "16px" }}></div>
          <p className="text-sm text-slate-500 dark:text-slate-400">16px — space-4</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-4 bg-primary rounded" style={{ width: "24px" }}></div>
          <p className="text-sm text-slate-500 dark:text-slate-400">24px — space-6</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-4 bg-primary rounded" style={{ width: "32px" }}></div>
          <p className="text-sm text-slate-500 dark:text-slate-400">32px — space-8</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-4 bg-primary rounded" style={{ width: "40px" }}></div>
          <p className="text-sm text-slate-500 dark:text-slate-400">40px — space-10</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-4 bg-primary rounded" style={{ width: "64px" }}></div>
          <p className="text-sm text-slate-500 dark:text-slate-400">64px — space-16</p>
        </div>
      </div>
    </div>
</section>
</div>
      {/* 3. SHADOWS & RADIUS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <section>
          <h2 className="text-2xl font-bold mb-6">Shadow System</h2>
          <div className="grid grid-cols-2 gap-6">
            {["XS", "SM", "MD", "LG"].map((s) => (
              <div key={s} className="flex flex-col items-center gap-3">
                <div
                  className={`h-24 w-full bg-white dark:bg-surface-dark rounded-lg shadow-${s.toLowerCase()} flex items-center justify-center text-xs font-medium text-text-tertiary border border-transparent dark:border-border-dark`}
                >
                  Shadow {s}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Border Radius</h2>
          <div className="grid grid-cols-2 gap-6">
            {[
              { label: "Radius-SM (4px)", class: "rounded-sm" },
              { label: "Radius-MD (6px)", class: "rounded-md" },
              { label: "Radius-LG (10px)", class: "rounded-lg" },
              { label: "Full (999px)", class: "rounded-full" },
            ].map((r) => (
              <div key={r.label} className="flex flex-col items-center gap-2">
                <div
                  className={`h-20 w-32 bg-primary/10 border-2 border-primary/20 ${r.class} flex items-center justify-center`}
                ></div>
                <p className="text-xs text-text-tertiary">{r.label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 4. CSS VARIABLES */}
      <section>
        <h2 className="text-2xl font-bold leading-tight tracking-[-0.015em] text-slate-900 dark:text-white pb-6">
          CSS Variables (Light Theme)
        </h2>
        <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 uppercase">
              <tr>
                <th className="px-6 py-3" scope="col">
                  Variable
                </th>
                <th className="px-6 py-3" scope="col">
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <td className="px-6 py-4 font-mono">--color-primary</td>
                <td className="px-6 py-4 font-mono">#2F6CE5</td>
              </tr>
              <tr className="bg-white dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <td className="px-6 py-4 font-mono">--color-primary-hover</td>
                <td className="px-6 py-4 font-mono">#2457C9</td>
              </tr>
              <tr className="bg-white dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <td className="px-6 py-4 font-mono">--gray-900</td>
                <td className="px-6 py-4 font-mono">#111827</td>
              </tr>
              <tr className="bg-white dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <td className="px-6 py-4 font-mono">--gray-50</td>
                <td className="px-6 py-4 font-mono">#F9FAFB</td>
              </tr>
              <tr className="bg-white dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <td className="px-6 py-4 font-mono">--radius-md</td>
                <td className="px-6 py-4 font-mono">6px</td>
              </tr>
              <tr className="bg-white dark:bg-slate-800/50">
                <td className="px-6 py-4 font-mono">--shadow-sm</td>
                <td className="px-6 py-4 font-mono">
                  0 1px 2px 0 rgba(0, 0, 0, 0.05)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
