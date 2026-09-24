"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Workbook } from "exceljs";
import { AlertCircle, CheckCircle2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "../../../supabase/client";

interface ContactImportProps {
  userId: string;
}

interface ImportedContact {
  name: string;
  birth_date: string;
}

export default function ContactImport({ userId }: ContactImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    imported?: number;
    failed?: number;
  } | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const parseExcel = async (file: File): Promise<ImportedContact[]> => {
    const result: ImportedContact[] = [];
    const workbook = new Workbook();

    try {
      if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
          // Handle Excel file
          const buffer = await file.arrayBuffer();
          await workbook.xlsx.load(buffer);

          // Get first worksheet
          const worksheet = workbook.worksheets[0];

          if (!worksheet) {
            throw new Error("No worksheet found");
          }

          // Determine if first row is header
          const firstRow = worksheet.getRow(1);
          const hasHeader =
            firstRow.values &&
            Array.isArray(firstRow.values) &&
            firstRow.values.some(
              (cell) =>
                cell &&
                typeof cell === "string" &&
                (cell.toLowerCase().includes("surname") ||
                  cell.toLowerCase().includes("name") ||
                  cell.toLowerCase().includes("birth")),
            );

          const startRow = hasHeader ? 2 : 1;

          worksheet.eachRow((row, rowNumber) => {
            if (rowNumber < startRow) return;

            const values = row.values as unknown[];
            if (!values || values.length < 3) return;

            // Handle the new name format: Lastname Firstname Patronymic
            const fullName = String(values[1] || "").trim();
            let surname = "";
            let firstName = "";

            if (fullName) {
              const nameParts = fullName.split(" ");
              if (nameParts.length >= 1) {
                surname = nameParts[0]; // First part is surname
              }
              if (nameParts.length >= 2) {
                // Combine remaining parts as first name (including patronymic)
                firstName = nameParts.slice(1).join(" ");
              }
            }

            let birthDate: Date | null = null;

            const birthDateValue = values[2];
            if (birthDateValue instanceof Date) {
              birthDate = birthDateValue;
            } else if (
              typeof birthDateValue === "string" &&
              birthDateValue.includes(".")
            ) {
              const [day, month, year] = birthDateValue.split(".").map(Number);
              if (
                !Number.isNaN(day) &&
                !Number.isNaN(month) &&
                !Number.isNaN(year)
              ) {
                birthDate = new Date(year, month - 1, day, 12);
              }
            }

            if (
              surname &&
              firstName &&
              birthDate &&
              !Number.isNaN(birthDate.getTime())
            ) {
              // Store in format: Lastname Firstname Patronymic (as expected by the display functions)
              result.push({
                name: `${surname} ${firstName}`,
                birth_date: birthDate.toISOString().split("T")[0],
              });
            }
          });
        } else {
          // Handle CSV file
          const text = await file.text();
          const lines = text.split("\n");

          const hasHeader =
            lines[0].toLowerCase().includes("surname") ||
            lines[0].toLowerCase().includes("name") ||
            lines[0].toLowerCase().includes("birth");

          const startRow = hasHeader ? 1 : 0;

          for (let i = startRow; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const columns = line.split(",");
            if (columns.length < 3) continue;

            // Handle the new name format: Lastname Firstname Patronymic
            const fullName = columns[0].trim();
            let surname = "";
            let firstName = "";

            if (fullName) {
              const nameParts = fullName.split(" ");
              if (nameParts.length >= 1) {
                surname = nameParts[0]; // First part is surname
              }
              if (nameParts.length >= 2) {
                // Combine remaining parts as first name (including patronymic)
                firstName = nameParts.slice(1).join(" ");
              }
            }

            const birthDateStr = columns[1].trim();

            let birthDate: Date | null = null;
            if (birthDateStr.includes(".")) {
              const [day, month, year] = birthDateStr.split(".").map(Number);
              if (
                !Number.isNaN(day) &&
                !Number.isNaN(month) &&
                !Number.isNaN(year)
              ) {
                birthDate = new Date(year, month - 1, day, 12);
              }
            }

            if (
              surname &&
              firstName &&
              birthDate &&
              !Number.isNaN(birthDate.getTime())
            ) {
              // Store in format: Lastname Firstname Patronymic (as expected by the display functions)
              result.push({
                name: `${surname} ${firstName}`,
                birth_date: birthDate.toISOString().split("T")[0],
              });
            }
          }
        }
      return result;
    } catch (error) {
      console.error("Error parsing file:", error);
      throw error;
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsUploading(true);
    setResult(null);

    try {
      const contacts = await parseExcel(file);

      if (contacts.length === 0) {
        setResult({
          success: false,
          message: "No valid contacts found in the file.",
        });
        return;
      }

      // Add user_id to each contact
      const contactsWithUserId = contacts.map((contact) => ({
        ...contact,
        user_id: userId,
      }));

      // Insert contacts in batches to avoid hitting limits
      const batchSize = 50;
      let imported = 0;
      let failed = 0;

      for (let i = 0; i < contactsWithUserId.length; i += batchSize) {
        const batch = contactsWithUserId.slice(i, i + batchSize);
        const { error } = await supabase.from("contacts").insert(batch);

        if (error) {
          console.error("Error importing contacts:", error);
          failed += batch.length;
        } else {
          imported += batch.length;
        }
      }

      setResult({
        success: imported > 0,
        message: `Import completed. ${imported} contacts imported successfully.${failed > 0 ? ` ${failed} contacts failed.` : ""}`,
        imported,
        failed,
      });

      // Refresh the page to show new contacts
      if (imported > 0) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error processing file:", error);
      setResult({
        success: false,
        message:
          "Error processing file. Please make sure it's a valid Excel or CSV file with the correct format.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Импорт контактов</h2>

      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-2">
          Загрузите файл Excel (.xlsx) или CSV с вашими контактами. Файл должен
          содержать столбцы для фамилии, имени и даты рождения (в формате
          дд.мм.гггг).
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Пример:{" "}
          <code className="rounded border bg-card px-1.5 py-0.5">
            Иванов Иван Иванович,01.05.1990
          </code>
        </p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <input
          type="file"
          accept=".xlsx,.xls,.csv,.txt"
          onChange={handleFileChange}
          className="block w-full text-sm text-foreground
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-primary/10 file:text-primary
            hover:file:bg-primary/20"
        />

        <Button
          onClick={handleImport}
          disabled={!file || isUploading}
          variant="default"
          className="flex items-center gap-2"
        >
          {isUploading ? (
            "Импорт..."
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Импортировать
            </>
          )}
        </Button>
      </div>

      {result && (
        <Alert
          variant={result.success ? "default" : "destructive"}
          className={
            result.success
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }
        >
          <div className="flex items-center gap-2">
            {result.success ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <AlertTitle>{result.success ? "Успешно" : "Ошибка"}</AlertTitle>
          </div>
          <AlertDescription
            className={
              result.success ? "text-primary/90" : "text-destructive/90"
            }
          >
            {result.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
