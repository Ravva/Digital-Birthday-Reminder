"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Tables } from "@/types/supabase"
import { useEffect, useState } from "react"

// Цвета для диаграммы
const COLORS = ['#3b82f6', '#4f46e5', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e'];

interface AgeDistributionProps {
  contacts?: Tables<"contacts">[]
}

interface AgeGroup {
  name: string;
  value: number;
}

export function AgeDistribution({ contacts = [] }: AgeDistributionProps) {
  const [chartData, setChartData] = useState<AgeGroup[]>([])

  useEffect(() => {
    if (contacts.length === 0) {
      setChartData([])
      return
    }

    // Определяем возрастные группы
    const ageGroups: Record<string, number> = {
      "0-18": 0,
      "19-30": 0,
      "31-45": 0,
      "46-60": 0,
      "61+": 0
    }

    // Функция для расчета возраста
    const calculateAge = (birthDateStr: string): number => {
      const birthDate = new Date(birthDateStr);
      const today = new Date();

      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return age;
    }

    // Распределяем контакты по возрастным группам
    contacts.forEach(contact => {
      const age = calculateAge(contact.birth_date);

      if (age <= 18) {
        ageGroups["0-18"]++;
      } else if (age <= 30) {
        ageGroups["19-30"]++;
      } else if (age <= 45) {
        ageGroups["31-45"]++;
      } else if (age <= 60) {
        ageGroups["46-60"]++;
      } else {
        ageGroups["61+"]++;
      }
    });

    // Преобразуем в формат для диаграммы
    const data = Object.entries(ageGroups)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0); // Убираем пустые группы

    setChartData(data);
  }, [contacts])

  // Если нет данных, показываем сообщение
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        Нет данных для отображения
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-muted-foreground">Распределение по возрастным группам</h3>
        <div className="text-xs text-muted-foreground bg-card/80 px-2 py-1 rounded-md border border-border/30">
          Всего: {contacts.length} контактов
        </div>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={true}
            outerRadius={140}
            innerRadius={60}
            fill="#8884d8"
            dataKey="value"
            paddingAngle={2}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            labelStyle={{ fill: 'var(--foreground, #fff)', fontSize: '12px' }}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="var(--background, #1e293b)"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value} контактов`, 'Количество']}
            contentStyle={{
              backgroundColor: 'var(--tooltip-bg, rgba(30, 41, 59, 0.9))',
              color: 'var(--tooltip-color, #fff)',
              border: '1px solid var(--tooltip-border, rgba(71, 85, 105, 0.5))',
              borderRadius: '8px',
              padding: '8px 12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            }}
          />
          <Legend
            formatter={(value, entry) => (
              <span style={{ color: 'var(--foreground, #fff)', fontSize: '12px' }}>
                {value}
              </span>
            )}
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ paddingTop: '20px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
