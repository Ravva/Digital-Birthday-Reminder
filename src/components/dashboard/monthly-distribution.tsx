"use client"

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, CartesianGrid } from "recharts"
import { Tables } from "@/types/supabase"
import { useEffect, useState } from "react"

const monthNames = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
]

interface MonthlyDistributionProps {
  contacts?: Tables<"contacts">[]
}

export function MonthlyDistribution({ contacts = [] }: MonthlyDistributionProps) {
  const [chartData, setChartData] = useState<{ name: string; total: number }[]>([])

  useEffect(() => {
    if (contacts.length === 0) {
      // Если контактов нет, создаем пустой график
      setChartData(monthNames.map(name => ({ name, total: 0 })))
      return
    }

    // Инициализируем массив с нулевыми значениями для всех месяцев
    const monthCounts = Array(12).fill(0)

    // Подсчитываем количество дней рождения в каждом месяце
    contacts.forEach(contact => {
      const birthDate = new Date(contact.birth_date)
      const month = birthDate.getMonth()
      monthCounts[month]++
    })

    // Формируем данные для графика
    const data = monthNames.map((name, index) => ({
      name,
      total: monthCounts[index]
    }))

    setChartData(data)
  }, [contacts])

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid-color, #ccc)" />
        <XAxis
          dataKey="name"
          stroke="var(--chart-axis-color, #888888)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis
          stroke="var(--chart-axis-color, #888888)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          formatter={(value) => [`${value} контактов`, 'Количество']}
          labelFormatter={(label) => `Месяц: ${label}`}
          contentStyle={{
            backgroundColor: 'var(--tooltip-bg, #fff)',
            color: 'var(--tooltip-color, #000)',
            border: '1px solid var(--tooltip-border, #ccc)',
            borderRadius: '6px',
          }}
        />
        <Legend />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
          name="Количество контактов"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
