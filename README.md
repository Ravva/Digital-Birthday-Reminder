
<div align="center">
  <img src="/logo.svg" alt="Digital Birthday Reminder" width="200"/>
  <h1>Напоминание о днях рождения</h1>
  <p>Никогда не забывайте о днях рождения! 🎂</p>
</div>

## ✨ Возможности

- 🎯 **Автоматические напоминания** - Получайте уведомления прямо в Telegram
- 👥 **Неограниченное количество контактов** - Храните дни рождения всех друзей и близких
- 🔔 **Настраиваемые уведомления** - Персонализируйте текст сообщений
- ⏰ **Выбор часового пояса** - Получайте уведомления в удобное время
- 🔒 **Безопасная авторизация** - Вход через Google, GitHub или email
- 🎨 **Современный интерфейс** - Чистый и адаптивный дизайн на Tailwind CSS
- 🌙 **Тёмная тема** - Комфортное использование днём и ночью
- ⌨️ **Горячие клавиши** - Быстрый доступ к основным функциям

## 🚀 Технологии

- **Фреймворк:** Next.js 14
- **Стилизация:** Tailwind CSS
- **UI компоненты:** shadcn/ui
- **База данных:** Supabase
- **Авторизация:** NextAuth.js
- **Уведомления:** Telegram Bot API
- **Хостинг:** Vercel

## 🛠️ Локальный запуск

1. Клонируйте репозиторий:
```bash
git clone https://github.com/yourusername/digital-birthday-reminder.git
```

2. Установите зависимости:
```bash
npm install
```

3. Скопируйте `.env.example` в `.env.local` и заполните переменные окружения:
```bash
cp .env.example .env.local
```

4. Запустите сервер разработки:
```bash
npm run dev
```

## 📝 Переменные окружения

Необходимые переменные окружения:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
```

## 🤝 Участие в разработке

Мы открыты для вашего участия! Не стесняйтесь создавать Pull Request'ы.

## 📄 Лицензия

Этот проект распространяется под лицензией MIT - подробности в файле [LICENSE](LICENSE).

## 🌟 Основные преимущества

- 💫 **Простота использования** - Интуитивно понятный интерфейс
- 🔄 **Регулярные обновления** - Постоянное улучшение функционала
- 🆓 **Бесплатное использование** - Основные функции доступны бесплатно
- 📱 **Кроссплатформенность** - Работает на всех устройствах

## ⌨️ Горячие клавиши

| Комбинация клавиш | Действие |
|-------------------|----------|
| `Alt + T` | Переключение между светлой и тёмной темой |
| `Tab` | Навигация по элементам интерфейса |
| `Enter` | Активация выбранного элемента |
| `Esc` | Закрытие модальных окон и выпадающих меню |

## 🙏 Благодарности

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)