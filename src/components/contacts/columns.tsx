"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tables } from "@/types/supabase";
import { formatDate } from "@/utils/utils";
import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Функция для разделения имени и фамилии (новый формат: Lastname Firstname Patronymic)
const splitName = (fullName: string) => {
  const parts = fullName.trim().split(" ");
  if (parts.length >= 2) {
    // В новом формате первая часть - это фамилия, остальные - имя и отчество
    const lastName = parts[0];
    const firstName = parts.slice(1).join(" ");
    return { firstName, lastName };
  }
  return { firstName: fullName, lastName: "" };
};

// Функция для отображения фамилии и имени (универсальная для разных форматов)
const displayLastNameFirst = (fullName: string) => {
  const parts = fullName.trim().split(" ");

  // Если только одно слово, возвращаем как есть
  if (parts.length < 2) {
    return fullName;
  }

  // Простой подход: предполагаем, что новый формат уже правильный (Фамилия Имя Отчество)
  // А старый формат был (Имя Фамилия) или (Имя Отчество Фамилия)
  // Проверяем по количеству частей:
  // 2 части: скорее всего Имя Фамилия -> меняем на Фамилия Имя
  // 3 и более частей: предполагаем, что это уже Фамилия Имя Отчество

  if (parts.length === 2) {
    // Старый формат: Имя Фамилия -> меняем на Фамилия Имя
    return `${parts[1]} ${parts[0]}`;
  } else {
    // Новый формат: Фамилия Имя Отчество -> оставляем как есть
    return fullName;
  }
};

// Calculate days until birthday
const calculateDaysUntilBirthday = (birthDateStr: string): number => {
  const today = new Date();
  const birthDate = new Date(birthDateStr);

  // Set birth date to current year
  const birthDateThisYear = new Date(
    today.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate(),
  );

  // If birthday has already occurred this year, set to next year
  if (birthDateThisYear < today) {
    birthDateThisYear.setFullYear(today.getFullYear() + 1);
  }

  // Calculate difference in days
  const diffTime = birthDateThisYear.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

// Функция для расчета возраста
const calculateAge = (birthDateStr: string): number => {
  const today = new Date();
  const birthDate = new Date(birthDateStr);

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // Если день рождения еще не наступил в этом году
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

function DeleteContactButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("contacts").delete().eq("id", id);

      if (error) {
        console.error("Error deleting contact:", error);
        return;
      }

      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error deleting contact:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="icon" title="Удалить">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить контакт?</AlertDialogTitle>
          <AlertDialogDescription>
            Вы уверены, что хотите удалить контакт «{name}»? Это действие
            нельзя отменить.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Отмена</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Удаление..." : "Удалить"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const columns: ColumnDef<Tables<"contacts">>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Имя
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">
        {displayLastNameFirst(row.getValue("name"))}
      </div>
    ),
    sortingFn: (rowA, rowB, columnId) => {
      // Сортировка по фамилии
      const nameA = rowA.getValue(columnId) as string;
      const nameB = rowB.getValue(columnId) as string;

      // Определяем фамилию для обоих форматов
      const getLastName = (fullName: string) => {
        const parts = fullName.trim().split(" ");
        if (parts.length < 2) return fullName;

        // Если 2 части: Имя Фамилия -> фамилия вторая
        // Если 3+ части: Фамилия Имя Отчество -> фамилия первая
        if (parts.length === 2) {
          return parts[1]; // вторая часть - фамилия
        } else {
          return parts[0]; // первая часть - фамилия
        }
      };

      const lastNameA = getLastName(nameA);
      const lastNameB = getLastName(nameB);

      return lastNameA.localeCompare(lastNameB, "ru");
    },
  },
  {
    accessorKey: "birth_date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          День рождения
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const birthDate = new Date(row.getValue("birth_date"));
      return (
        <div>
          {birthDate.toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </div>
      );
    },
    sortingFn: (rowA, rowB, columnId) => {
      // For birth_date, sort by full date including year
      const dateA = new Date(rowA.getValue(columnId));
      const dateB = new Date(rowB.getValue(columnId));

      return dateA.getTime() - dateB.getTime();
    },
  },
  {
    accessorKey: "age",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Возраст
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const age = calculateAge(row.original.birth_date);
      return <div>{age} лет</div>;
    },
    sortingFn: (rowA, rowB, columnId) => {
      const ageA = calculateAge(rowA.original.birth_date);
      const ageB = calculateAge(rowB.original.birth_date);
      return ageA - ageB;
    },
  },
  {
    accessorKey: "days_until",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Дней до ДР
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const daysUntil = calculateDaysUntilBirthday(row.original.birth_date);
      if (daysUntil === 0) {
        return <span className="font-bold text-green-600">Сегодня!</span>;
      } else if (daysUntil === 1) {
        return <span className="font-medium text-orange-500">Завтра</span>;
      } else {
        return <span>{daysUntil}</span>;
      }
    },
    sortingFn: (rowA, rowB, columnId) => {
      const daysUntilA = calculateDaysUntilBirthday(rowA.original.birth_date);
      const daysUntilB = calculateDaysUntilBirthday(rowB.original.birth_date);
      return daysUntilA - daysUntilB;
    },
  },
  {
    accessorKey: "notes",
    header: "Заметки",
    cell: ({ row }) => (
      <div className="max-w-xs truncate">{row.getValue("notes") || ""}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const contact = row.original;

      return (
        <div className="flex justify-end gap-2">
          <Link href={`/dashboard/contacts/edit/${contact.id}`}>
            <Button variant="outline" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <DeleteContactButton id={contact.id} name={contact.name} />
        </div>
      );
    },
  },
];
