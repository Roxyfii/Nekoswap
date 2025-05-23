"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Team", value: 20 },
  { name: "Community", value: 30 },
  { name: "Staking Rewards", value: 25 },
  { name: "Liquidity", value: 15 },
  { name: "Marketing", value: 10 },
];

const COLORS = ["#FF69B4", "#FFB6C1", "#8A2BE2", "#00C49F", "#FF8042"];

export default function TokenomicsChart() {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-6">Tokenomics</h1>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            dataKey="value"
            isAnimationActive={true}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
