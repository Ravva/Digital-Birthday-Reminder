"use client";

import { Tables } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { formatDate } from "@/utils/utils";
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
} from "@/components/ui/alert-dialog";

interface ContactListProps {
  contacts: Tables<"contacts">[];
}

export default function ContactList({ contacts }: ContactListProps) {
  const [sortField, setSortField] = useState<"name" | "birth_date">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] =
    useState<Tables<"contacts"> | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Функция для разделения имени и фамилии
  const splitName = (fullName: string) => {
    const parts = fullName.trim().split(" ");
    if (parts.length >= 2) {
      const firstName = parts[0];
      const lastName = parts.slice(1).join(" ");
      return { firstName, lastName };
    }
    return { firstName: fullName, lastName: "" };
  };

  const sortedContacts = [...contacts].sort((a, b) => {
    if (sortField === "name") {
      // Сортировка по фамилии, затем по имени
      const { lastName: lastNameA, firstName: firstNameA } = splitName(a.name);
      const { lastName: lastNameB, firstName: firstNameB } = splitName(b.name);

      // Если есть фамилии, сортируем по ним
      if (lastNameA && lastNameB) {
        const lastNameCompare =
          sortDirection === "asc"
            ? lastNameA.localeCompare(lastNameB, "ru")
            : lastNameB.localeCompare(lastNameA, "ru");

        // Если фамилии одинаковые, сортируем по имени
        if (lastNameCompare === 0) {
          return sortDirection === "asc"
            ? firstNameA.localeCompare(firstNameB, "ru")
            : firstNameB.localeCompare(firstNameA, "ru");
        }

        return lastNameCompare;
      }

      // Если фамилий нет, сортируем по полному имени
      return sortDirection === "asc"
        ? a.name.localeCompare(b.name, "ru")
        : b.name.localeCompare(a.name, "ru");
    } else {
      // For birth_date, we want to sort by month and day, ignoring year
      const dateA = new Date(a.birth_date);
      const dateB = new Date(b.birth_date);

      // Create comparison values based on month and day only
      const monthDayA = dateA.getMonth() * 100 + dateA.getDate();
      const monthDayB = dateB.getMonth() * 100 + dateB.getDate();

      return sortDirection === "asc"
        ? monthDayA - monthDayB
        : monthDayB - monthDayA;
    }
  });

  const toggleSort = (field: "name" | "birth_date") => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleDeleteClick = (contact: Tables<"contacts">) => {
    setContactToDelete(contact);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!contactToDelete) return;

    const { error } = await supabase
      .from("contacts")
      .delete()
      .eq("id", contactToDelete.id);

    if (error) {
      console.error("Error deleting contact:", error);
    } else {
      router.refresh();
    }

    setDeleteDialogOpen(false);
    setContactToDelete(null);
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

  // Функция для отображения фамилии и имени
  const displayLastNameFirst = (fullName: string) => {
    const { firstName, lastName } = splitName(fullName);
    if (lastName) {
      return `${lastName} ${firstName}`;
    }
    return firstName;
  };

  return (
    <>
      <div className="rounded-md border border-border/30 bg-card/80 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer"
                onClick={() => toggleSort("name")}
              >
                <div className="flex items-center">
                  Имя
                  {sortField === "name" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => toggleSort("birth_date")}
              >
                <div className="flex items-center">
                  День рождения
                  {sortField === "birth_date" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead>Возраст</TableHead>
              <TableHead>Дней до ДР</TableHead>
              <TableHead>Заметки</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedContacts.map((contact) => {
              const daysUntil = calculateDaysUntilBirthday(contact.birth_date);
              return (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">
                    {displayLastNameFirst(contact.name)}
                  </TableCell>
                  <TableCell>
                    {new Date(contact.birth_date).toLocaleDateString("ru-RU")}
                  </TableCell>
                  <TableCell>{calculateAge(contact.birth_date)} лет</TableCell>
                  <TableCell>
                    {daysUntil === 0 ? (
                      <span className="font-bold text-green-600">Сегодня!</span>
                    ) : daysUntil === 1 ? (
                      <span className="font-medium text-orange-500">
                        Завтра
                      </span>
                    ) : (
                      <span>{daysUntil} дней</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {contact.notes}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/contacts/edit/${contact.id}`}>
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteClick(contact)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это навсегда удалит контактную информацию {contactToDelete?.name}.
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
