"use client";

import { useEffect } from "react";

/**
 * Компонент для блокировки масштабирования страницы с помощью Ctrl+/Ctrl-
 * и колесика мыши с Ctrl
 */
export function ZoomLock() {
  useEffect(() => {
    // Функция для предотвращения масштабирования с помощью клавиатуры (Ctrl+/Ctrl-)
    const preventZoomKeyboard = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) && // Ctrl или Cmd (для Mac)
        (e.key === "+" ||
          e.key === "-" ||
          e.key === "=" ||
          e.key === "_" ||
          e.key === "0")
      ) {
        e.preventDefault();
        return false;
      }
      return true;
    };

    // Функция для предотвращения масштабирования с помощью колесика мыши
    const preventZoomWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        return false;
      }
      return true;
    };

    // Функция для сброса масштаба при загрузке страницы
    const resetZoom = () => {
      // Устанавливаем масштаб на 100%
      document.body.style.zoom = "100%";
      // Альтернативный способ для браузеров, которые не поддерживают zoom
      document.body.style.transform = "scale(1)";
      document.body.style.transformOrigin = "0 0";
    };

    // Добавляем обработчики событий
    document.addEventListener("keydown", preventZoomKeyboard, {
      passive: false,
    });
    document.addEventListener("wheel", preventZoomWheel, { passive: false });

    // Сбрасываем масштаб при загрузке
    resetZoom();

    // Добавляем мета-тег для запрета масштабирования на мобильных устройствах
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (metaViewport) {
      metaViewport.setAttribute(
        "content",
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
      );
    } else {
      const meta = document.createElement("meta");
      meta.name = "viewport";
      meta.content =
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
      document.head.appendChild(meta);
    }

    // Очистка при размонтировании компонента
    return () => {
      document.removeEventListener("keydown", preventZoomKeyboard);
      document.removeEventListener("wheel", preventZoomWheel);
    };
  }, []);

  // Компонент не рендерит никакой UI
  return null;
}
