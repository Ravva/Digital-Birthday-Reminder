"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Tables } from "@/types/supabase"
import { useEffect, useState } from "react"

// Цвета для диаграммы
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

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
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={true}
          outerRadius={150}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [`${value} контактов`, 'Количество']}
          contentStyle={{
            backgroundColor: 'var(--tooltip-bg, #fff)',
            color: 'var(--tooltip-color, #000)',
            border: '1px solid var(--tooltip-border, #ccc)',
            borderRadius: '6px',
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
