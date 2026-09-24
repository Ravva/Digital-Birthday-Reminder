"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import * as React from "react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type YearNavigationCalendarProps = React.ComponentProps<
  typeof DayPicker
> & {
  onYearChange?: (year: number) => void;
};

function YearNavigationCalendar({
  className,
  classNames,
  showOutsideDays = true,
  onYearChange,
  ...props
}: YearNavigationCalendarProps) {
  const defaultClassNames = getDefaultClassNames();
  const selected = (props as { selected?: Date | Date[] | undefined }).selected;
  const [currentDate, setCurrentDate] = React.useState<Date>(() => {
    if (props.defaultMonth instanceof Date) {
      return props.defaultMonth;
    }
    if (selected instanceof Date) {
      return selected;
    }
    if (Array.isArray(selected) && selected.length > 0) {
      const firstDate = selected[0];
      if (firstDate instanceof Date) {
        return firstDate;
      }
    }
    return new Date();
  });

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
        <button type="button"
          onClick={handlePreviousYear}
          className={cn(buttonVariants({ variant: "outline" }), "size-6 p-0")}
          title="Предыдущий год"
        >
          <ChevronsLeft className="size-3" />
        </button>
        <div className="text-xs font-medium px-2 py-1 rounded border min-w-[50px] text-center">
          {currentDate.getFullYear()}
        </div>
        <button type="button"
          onClick={handleNextYear}
          className={cn(buttonVariants({ variant: "outline" }), "size-6 p-0")}
          title="Следующий год"
        >
          <ChevronsRight className="size-3" />
        </button>
      </div>
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("p-2 pt-0 bg-background", className)}
        month={currentDate}
        defaultMonth={currentDate}
        onMonthChange={setCurrentDate}
        fixedWeeks
        classNames={{
          months: cn("relative flex flex-col gap-2", defaultClassNames.months),
          month: cn("flex w-full flex-col gap-2", defaultClassNames.month),
          month_grid: cn(
            "w-full border-collapse",
            defaultClassNames.month_grid,
          ),
          weekdays: cn("flex mb-1", defaultClassNames.weekdays),
          weekday:
            "text-muted-foreground rounded-md flex-1 font-medium text-[0.65rem] uppercase",
          week: cn("flex w-full mt-1", defaultClassNames.week),
          day: cn(
            "relative w-full aspect-square text-center text-sm p-0 select-none",
            defaultClassNames.day,
          ),
          day_button: cn(
            buttonVariants({ variant: "ghost" }),
            "size-7 p-0 font-medium text-xs aria-selected:opacity-100 rounded-md",
          ),
          selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground font-bold rounded-md",
          today: "bg-accent text-accent-foreground font-bold rounded-md",
          outside:
            "outside text-muted-foreground aria-selected:text-muted-foreground",
          disabled: "text-muted-foreground opacity-50",
          range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          hidden: "invisible",
          ...classNames,
        }}
        components={{
          Chevron: ({ className, orientation, ...props }) => {
            if (orientation === "left") {
              return (
                <ChevronLeft className={cn("size-3", className)} {...props} />
              );
            }
            if (orientation === "right") {
              return (
                <ChevronRight className={cn("size-3", className)} {...props} />
              );
            }
            return (
              <ChevronRight className={cn("size-3", className)} {...props} />
            );
          },
        }}
        {...props}
      />
    </div>
  );
}
YearNavigationCalendar.displayName = "YearNavigationCalendar";

export { YearNavigationCalendar };
