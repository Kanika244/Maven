import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const axis = { stroke: "var(--muted-foreground)", fontSize: 11 };
const grid = "var(--border)";

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  color: "var(--popover-foreground)",
  fontSize: 12,
};

export function PerformanceChart({
  data,
  height = 280,
}: {
  data: { month: string; portfolio: number; nifty: number }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ left: -12, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="gPort" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.45} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={axis} />
        <YAxis tickLine={false} axisLine={false} tick={axis} width={44} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: grid }} />
        <Area
          type="monotone"
          dataKey="portfolio"
          name="Portfolio (₹K)"
          stroke="var(--chart-1)"
          strokeWidth={2.5}
          fill="url(#gPort)"
        />
        <Line
          type="monotone"
          dataKey="nifty"
          name="Nifty 50 (₹K)"
          stroke="var(--chart-2)"
          strokeWidth={2}
          dot={false}
          strokeDasharray="4 4"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function GrowthChart({ data, height = 260 }: { data: { year: string; value: number }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ left: -12, right: 8, top: 8 }}>
        <XAxis dataKey="year" tickLine={false} axisLine={false} tick={axis} />
        <YAxis tickLine={false} axisLine={false} tick={axis} width={44} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
        <Bar dataKey="value" name="Value (₹K)" radius={[6, 6, 0, 0]} fill="var(--chart-1)" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DonutChart({
  data,
  height = 240,
}: {
  data: { name: string; value: number; color?: string }[];
  height?: number;
}) {
  const palette = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={62}
          outerRadius={92}
          paddingAngle={2}
          stroke="var(--card)"
          strokeWidth={2}
        >
          {data.map((d, i) => (
            <Cell key={d.name} fill={d.color ?? palette[i % palette.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function SectorBars({
  data,
  height = 300,
}: {
  data: { name: string; pct?: number; value?: number }[];
  height?: number;
}) {
  const key = data[0]?.pct !== undefined ? "pct" : "value";
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <XAxis type="number" tickLine={false} axisLine={false} tick={axis} />
        <YAxis
          type="category"
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tick={axis}
          width={92}
        />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
        <Bar dataKey={key} radius={[0, 6, 6, 0]}>
          {data.map((d) => (
            <Cell
              key={d.name}
              fill={
                key === "pct"
                  ? (d.pct ?? 0) >= 0
                    ? "var(--positive)"
                    : "var(--negative)"
                  : "var(--chart-1)"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}