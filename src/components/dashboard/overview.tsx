"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
} from "recharts";
import { Tables } from "@/types/supabase";
import { useEffect, useState } from "react";

// Цвета для графика
const COLORS = [
  "#3b82f6",
  "#4f46e5",
  "#8b5cf6",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
];

const monthNames = [
  "Янв",
  "Фев",
  "Мар",
  "Апр",
  "Май",
  "Июн",
  "Июл",
  "Авг",
  "Сен",
  "Окт",
  "Ноя",
  "Дек",
];

interface OverviewProps {
  contacts?: Tables<"contacts">[];
}

export function Overview({ contacts = [] }: OverviewProps) {
  const [chartData, setChartData] = useState<{ name: string; total: number }[]>(
    [],
  );

  useEffect(() => {
    if (contacts.length === 0) {
      // Если контактов нет, создаем пустой график
      setChartData(monthNames.map((name) => ({ name, total: 0 })));
      return;
    }

    // Инициализируем массив с нулевыми значениями для всех месяцев
    const monthCounts = Array(12).fill(0);

    // Подсчитываем количество дней рождения в каждом месяце
    contacts.forEach((contact) => {
      const birthDate = new Date(contact.birth_date);
      const month = birthDate.getMonth();
      monthCounts[month]++;
    });

    // Формируем данные для графика
    const data = monthNames.map((name, index) => ({
      name,
      total: monthCounts[index],
    }));

    setChartData(data);
  }, [contacts]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-muted-foreground">
          Распределение дней рождения по месяцам
        </h3>
        <div className="text-xs text-muted-foreground bg-card/80 px-2 py-1 rounded-md border border-border/30">
          Всего контактов: {contacts.length}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
          barGap={8}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border, #333)"
            opacity={0.2}
            vertical={false}
          />
          <XAxis
            dataKey="name"
            stroke="var(--chart-axis-color, #888888)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="var(--chart-axis-color, #888888)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            formatter={(value) => [`${value} дней рождения`, "Количество"]}
            labelFormatter={(label) => `Месяц: ${label}`}
            contentStyle={{
              backgroundColor: "var(--tooltip-bg, rgba(30, 41, 59, 0.9))",
              color: "var(--tooltip-color, #fff)",
              border: "1px solid var(--tooltip-border, rgba(71, 85, 105, 0.5))",
              borderRadius: "8px",
              padding: "8px 12px",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
            cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
          />
          <Legend
            wrapperStyle={{ paddingTop: "10px" }}
            formatter={(value) => (
              <span
                style={{ color: "var(--foreground, #fff)", fontSize: "12px" }}
              >
                {value}
              </span>
            )}
          />
          <Bar dataKey="total" name="Дней рождения/месяц" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
