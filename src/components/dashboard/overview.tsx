"use client"

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"

const data = [
  {
    name: "Янв",
    total: 3,
  },
  {
    name: "Фев",
    total: 5,
  },
  {
    name: "Мар",
    total: 2,
  },
  {
    name: "Апр",
    total: 4,
  },
  {
    name: "Май",
    total: 6,
  },
  {
    name: "Июн",
    total: 3,
  },
  {
    name: "Июл",
    total: 4,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
