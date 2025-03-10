"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "../../../supabase/client";
import { useRouter } from "next/navigation";
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import * as XLSX from "xlsx";

interface ContactImportProps {
  userId: string;
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
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const parseExcel = async (file: File) => {
    return new Promise<any[]>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = [];

          // Check if file is Excel or CSV
          if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
            // Handle Excel file
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: "array" });

            // Get first sheet
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // Convert to JSON
            const rows = XLSX.utils.sheet_to_json(worksheet, {
              header: 1,
            }) as any[];

            // Skip header row if exists
            const startRow =
              rows.length > 0 &&
              rows[0].some(
                (cell: any) =>
                  typeof cell === "string" &&
                  (cell.toLowerCase().includes("surname") ||
                    cell.toLowerCase().includes("name") ||
                    cell.toLowerCase().includes("birth")),
              )
                ? 1
                : 0;

            for (let i = startRow; i < rows.length; i++) {
              const row = rows[i];
              if (!row || row.length < 3) continue;

              const surname = String(row[0]).trim();
              const firstName = String(row[1]).trim();
              const birthDateValue = row[2];

              // Handle different date formats
              let birthDate = null;

              if (
                typeof birthDateValue === "string" &&
                birthDateValue.includes(".")
              ) {
                // Parse dd.mm.yyyy format
                const [day, month, year] = birthDateValue
                  .split(".")
                  .map(Number);
                if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                  birthDate = new Date(year, month - 1, day);
                  // Исправление смещения даты из-за часового пояса
                  birthDate.setHours(12);
                }
              } else if (birthDateValue instanceof Date) {
                // Excel date object
                birthDate = birthDateValue;
                // Исправление смещения даты из-за часового пояса
                birthDate.setHours(12);
              } else if (typeof birthDateValue === "number") {
                // Excel stores dates as numbers
                birthDate = XLSX.SSF.parse_date_code(birthDateValue);
                if (birthDate) {
                  birthDate = new Date(
                    birthDate.y,
                    birthDate.m - 1,
                    birthDate.d,
                  );
                  // Исправление смещения даты из-за часового пояса
                  birthDate.setHours(12);
                }
              }

              if (
                surname &&
                firstName &&
                birthDate &&
                !isNaN(birthDate.getTime())
              ) {
                result.push({
                  name: `${firstName} ${surname}`,
                  birth_date: birthDate.toISOString().split("T")[0],
                });
              }
            }
          } else {
            // Handle CSV file
            const data = e.target?.result;
            const lines = (data as string).split("\n");

            // Skip header row if exists
            const startRow =
              lines[0].toLowerCase().includes("surname") ||
              lines[0].toLowerCase().includes("name") ||
              lines[0].toLowerCase().includes("birth")
                ? 1
                : 0;

            for (let i = startRow; i < lines.length; i++) {
              const line = lines[i].trim();
              if (!line) continue;

              const columns = line.split(",");
              if (columns.length < 3) continue;

              const surname = columns[0].trim();
              const firstName = columns[1].trim();
              const birthDateStr = columns[2].trim();

              // Parse date from dd.mm.yyyy format
              let birthDate = null;
              if (birthDateStr.includes(".")) {
                const [day, month, year] = birthDateStr.split(".").map(Number);
                if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                  birthDate = new Date(year, month - 1, day);
                  // Исправление смещения даты из-за часового пояса
                  birthDate.setHours(12);
                }
              }

              if (
                surname &&
                firstName &&
                birthDate &&
                !isNaN(birthDate.getTime())
              ) {
                result.push({
                  name: `${firstName} ${surname}`,
                  birth_date: birthDate.toISOString().split("T")[0],
                });
              }
            }
          }

          resolve(result);
        } catch (error) {
          console.error("Error parsing file:", error);
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);

      if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    });
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
          "Error processing file. Please make sure it's a valid CSV file with the correct format.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-white">
      <h2 className="text-xl font-semibold mb-4">Импорт контактов</h2>

      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2">
          Загрузите файл Excel (.xlsx) или CSV с вашими контактами. Файл должен
          содержать столбцы для фамилии, имени и даты рождения (в формате
          дд.мм.гггг).
        </p>
        <p className="text-sm text-gray-600 mb-4">
          Пример: <code>Иванов,Иван,01.05.1990</code>
        </p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <input
          type="file"
          accept=".xlsx,.xls,.csv,.txt"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />

        <Button
          onClick={handleImport}
          disabled={!file || isUploading}
          className="flex items-center gap-2"
        >
          {isUploading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Импорт...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Импорт
            </>
          )}
        </Button>
      </div>

      {result && (
        <Alert variant={result.success ? "default" : "destructive"}>
          {result.success ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>{result.success ? "Успех" : "Ошибка"}</AlertTitle>
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
