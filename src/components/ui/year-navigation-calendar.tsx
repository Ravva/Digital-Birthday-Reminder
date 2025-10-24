"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type YearNavigationCalendarProps = React.ComponentProps<typeof DayPicker> & {
  onYearChange?: (year: number) => void;
}

function YearNavigationCalendar({
  className,
  classNames,
  showOutsideDays = true,
  onYearChange,
  ...props
}: YearNavigationCalendarProps) {
  const [currentDate, setCurrentDate] = React.useState<Date>(() => {
    // Проверяем defaultMonth
    if (props.defaultMonth instanceof Date) {
      return props.defaultMonth;
    }
    
    // Проверяем selected
    if (props.selected instanceof Date) {
      return props.selected;
    }
    
    // Проверяем массив selected
    if (Array.isArray(props.selected) && props.selected.length > 0) {
      const firstDate = props.selected[0];
      if (firstDate instanceof Date) {
        return firstDate;
      }
    }
    
    // По умолчанию используем текущую дату
    return new Date();
  });

  // Обработчик изменения месяца из DayPicker
  React.useEffect(() => {
    if (props.month) {
      setCurrentDate(props.month);
    }
  }, [props.month]);

  const handlePreviousYear = () => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(newDate.getFullYear() - 1);
    setCurrentDate(newDate);

    if (onYearChange) {
      onYearChange(newDate.getFullYear());
    }

    if (props.onMonthChange) {
      props.onMonthChange(newDate);
    }
  };

  const handleNextYear = () => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(newDate.getFullYear() + 1);
    setCurrentDate(newDate);

    if (onYearChange) {
      onYearChange(newDate.getFullYear());
    }

    if (props.onMonthChange) {
      props.onMonthChange(newDate);
    }
  };

  return (
    <div className="flex flex-col select-none overflow-x-hidden">
      <div className="flex justify-between items-center mb-1 px-2 pt-2">
        <button
          onClick={handlePreviousYear}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-6 w-6 bg-card/80 p-0 opacity-70 hover:opacity-100 border-border/50 hover:bg-card"
          )}
          title="Предыдущий год"
        >
          <ChevronsLeft className="h-3 w-3" />
        </button>
        <div className="text-xs font-medium px-2 py-1 bg-card/80 rounded border border-border/50 min-w-[50px] text-center">
          {currentDate.getFullYear()}
        </div>
        <button
          onClick={handleNextYear}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-6 w-6 bg-card/80 p-0 opacity-70 hover:opacity-100 border-border/50 hover:bg-card"
          )}
          title="Следующий год"
        >
          <ChevronsRight className="h-3 w-3" />
        </button>
      </div>
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("p-2 pt-0", className)}
        month={currentDate}
        defaultMonth={currentDate}
        onMonthChange={setCurrentDate}
        fixedWeeks
        classNames={{
          months: "flex flex-col space-y-2 overflow-x-hidden",
          month: "space-y-2 overflow-x-hidden",
          caption: "flex justify-center pt-1 pb-1 relative items-center",
          caption_label: "text-xs font-medium px-2 py-1 bg-card/80 rounded border border-border/50",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-6 w-6 bg-card/80 p-0 opacity-70 hover:opacity-100 border-border/50 hover:bg-card"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1 overflow-x-hidden",
          head_row: "flex mb-1 overflow-x-hidden",
          head_cell:
            "text-muted-foreground rounded-md w-7 font-medium text-[0.65rem] uppercase",
          row: "flex w-full mt-1 mb-1 overflow-x-hidden",
          cell: "h-7 w-7 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-7 w-7 p-0 font-medium aria-selected:opacity-100 hover:bg-card/80 rounded-md text-xs"
          ),
          day_range_end: "day-range-end",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground font-bold rounded-md",
          day_today: "bg-accent/50 text-accent-foreground font-bold border border-accent/50 rounded-md",
          day_outside:
            "day-outside text-muted-foreground opacity-selected:bg-accent/50 aria-selected:text-muted-foreground",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{
          IconLeft: ({ ...props }) => <ChevronLeft className="h-3 w-3" {...props} />,
          IconRight: ({ ...props }) => <ChevronRight className="h-3 w-3" {...props} />
        }}
        {...props}
      />
    </div>
  )
}
YearNavigationCalendar.displayName = "YearNavigationCalendar"

export { YearNavigationCalendar }
