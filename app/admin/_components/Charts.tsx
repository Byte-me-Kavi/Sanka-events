"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { money, moneyShort } from "@/lib/budget";

// Categorical slots validated against the white card surface: blue = money in, orange = money out.
export const INCOME_COLOR = "#2a78d6";
export const SPENDING_COLOR = "#eb6834";

const ink = { secondary: "#4a4a4a" };
const grid = "#ececec";

type TipPayload = { name?: string | number; value?: number | string; color?: string; payload?: { name?: string; category?: string } };

function ChartTip({ active, payload }: { active?: boolean; payload?: TipPayload[] }) {
  if (!active || !payload?.length) return null;
  const title = payload[0].payload?.name ?? payload[0].payload?.category;
  return (
    <div className="adm-tip">
      <p className="adm-tip-title">{title}</p>
      {payload.map((p) => (
        <p key={String(p.name)} className="adm-tip-row">
          <span className="adm-tip-key" style={{ background: p.color }} aria-hidden />
          <span>{p.name}</span>
          <strong>{money(Number(p.value))}</strong>
        </p>
      ))}
    </div>
  );
}

const truncate = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

// One-line category labels; Recharts' default tick wraps long names onto two lines.
function NameTick({ x, y, payload, max }: { x?: number | string; y?: number | string; payload?: { value: string }; max: number }) {
  return (
    <text x={x} y={y} dy={4} textAnchor="end" fill={ink.secondary} fontSize={13}>
      <title>{payload?.value}</title>
      {truncate(String(payload?.value ?? ""), max)}
    </text>
  );
}

const tickStyle = { fill: ink.secondary, fontSize: 13 };

export function IncomeSpendChart({ data }: { data: { name: string; income: number; spending: number }[] }) {
  const height = data.length * 64 + 56;
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 4 }} barGap={2} barCategoryGap={14}>
          <CartesianGrid horizontal={false} stroke={grid} />
          <XAxis type="number" tickFormatter={moneyShort} tick={tickStyle} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={136}
            tick={(props) => <NameTick {...props} max={17} />}
            axisLine={{ stroke: grid }}
            tickLine={false}
          />
          <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(0, 0, 0, 0.04)" }} />
          <Legend
            verticalAlign="top"
            align="left"
            iconType="circle"
            iconSize={10}
            wrapperStyle={{ paddingBottom: 16, fontSize: 14, color: ink.secondary }}
            formatter={(value) => <span style={{ color: ink.secondary }}>{value}</span>}
          />
          <Bar dataKey="income" name="Money in" fill={INCOME_COLOR} radius={[0, 4, 4, 0]} maxBarSize={16} isAnimationActive={false} />
          <Bar dataKey="spending" name="Money out" fill={SPENDING_COLOR} radius={[0, 4, 4, 0]} maxBarSize={16} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Ranked single-series bars: one colour for every bar, the title names the series.
export function CategoryBars({ data, color, label }: { data: { category: string; amount: number }[]; color: string; label: string }) {
  const height = data.length * 40 + 32;
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, bottom: 4, left: 4 }} barCategoryGap={10}>
          <CartesianGrid horizontal={false} stroke={grid} />
          <XAxis type="number" tickFormatter={moneyShort} tick={tickStyle} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="category"
            width={136}
            tick={(props) => <NameTick {...props} max={18} />}
            axisLine={{ stroke: grid }}
            tickLine={false}
          />
          <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(0, 0, 0, 0.04)" }} />
          <Bar dataKey="amount" name={label} fill={color} radius={[0, 4, 4, 0]} maxBarSize={18} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
