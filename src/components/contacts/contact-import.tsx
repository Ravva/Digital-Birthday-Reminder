"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "../../../supabase/client";
import { useRouter } from "next/navigation";
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Workbook } from 'exceljs';

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

  const parseExcel = async (file: File): Promise<any[]> => {
    return new Promise<any[]>(async (resolve, reject) => {
      try {
        const result: { name: string; birth_date: string }[] = [];
        const workbook = new Workbook();

        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          // Handle Excel file
          const buffer = await file.arrayBuffer();
          await workbook.xlsx.load(buffer);

          // Get first worksheet
          const worksheet = workbook.worksheets[0];

          if (!worksheet) {
            throw new Error('No worksheet found');
          }

          // Determine if first row is header
          const firstRow = worksheet.getRow(1);
          const hasHeader = firstRow.values && Array.isArray(firstRow.values) &&
            firstRow.values.some(cell =>
              cell && typeof cell === 'string' &&
              (cell.toLowerCase().includes('surname') ||
               cell.toLowerCase().includes('name') ||
               cell.toLowerCase().includes('birth'))
            );

          const startRow = hasHeader ? 2 : 1;

          worksheet.eachRow((row, rowNumber) => {
            if (rowNumber < startRow) return;

            const values = row.values as any[];
            if (!values || values.length < 3) return;

            const surname = String(values[1] || '').trim();
            const firstName = String(values[2] || '').trim();
            let birthDate: Date | null = null;

            const birthDateValue = values[3];
            if (birthDateValue instanceof Date) {
              birthDate = birthDateValue;
            } else if (typeof birthDateValue === 'string' && birthDateValue.includes('.')) {
              const [day, month, year] = birthDateValue.split('.').map(Number);
              if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                birthDate = new Date(year, month - 1, day, 12);
              }
            }

            if (surname && firstName && birthDate && !isNaN(birthDate.getTime())) {
              result.push({
                name: `${firstName} ${surname}`,
                birth_date: birthDate.toISOString().split('T')[0],
              });
            }
          });
        } else {
          // Handle CSV file
          const text = await file.text();
          const lines = text.split('\n');

          const hasHeader = lines[0].toLowerCase().includes('surname') ||
                          lines[0].toLowerCase().includes('name') ||
                          lines[0].toLowerCase().includes('birth');

          const startRow = hasHeader ? 1 : 0;

          for (let i = startRow; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const columns = line.split(',');
            if (columns.length < 3) continue;

            const surname = columns[0].trim();
            const firstName = columns[1].trim();
            const birthDateStr = columns[2].trim();

            let birthDate: Date | null = null;
            if (birthDateStr.includes('.')) {
              const [day, month, year] = birthDateStr.split('.').map(Number);
              if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                birthDate = new Date(year, month - 1, day, 12);
              }
            }

            if (surname && firstName && birthDate && !isNaN(birthDate.getTime())) {
              result.push({
                name: `${firstName} ${surname}`,
                birth_date: birthDate.toISOString().split('T')[0],
              });
            }
          }
        }

        resolve(result);
      } catch (error) {
        console.error('Error parsing file:', error);
        reject(error);
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
        message: "Error processing file. Please make sure it's a valid Excel or CSV file with the correct format.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 border border-gray-200 dark:border-[#38383a] rounded-xl bg-card dark:bg-[#1c1c1e] shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Импорт контактов</h2>

      <div className="mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          Загрузите файл Excel (.xlsx) или CSV с вашими контактами. Файл должен
          содержать столбцы для фамилии, имени и даты рождения (в формате
          дд.мм.гггг).
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Пример: <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">Иванов,Иван,01.05.1990</code>
        </p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <input
          type="file"
          accept=".xlsx,.xls,.csv,.txt"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 dark:text-gray-300
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            dark:file:bg-[#0A84FF]/10 dark:file:text-[#0A84FF]
            hover:file:bg-blue-100 dark:hover:file:bg-[#0A84FF]/20"
        />

        <Button
          onClick={handleImport}
          disabled={!file || isUploading}
          className="flex items-center gap-2"
          variant="apple"
          className="dark:bg-[#0A84FF] dark:text-white dark:hover:bg-[#0A84FF]/90 flex items-center gap-2"
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
          className={result.success ?
            "dark:bg-[#30D158]/10 dark:border-[#30D158]/30 dark:text-[#30D158]" :
            "dark:bg-[#FF453A]/10 dark:border-[#FF453A]/30 dark:text-[#FF453A]"
          }
        >
          <div className="flex items-center gap-2">
            {result.success ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <AlertTitle>
              {result.success ? "Успешно" : "Ошибка"}
            </AlertTitle>
          </div>
          <AlertDescription className={result.success ? "dark:text-[#30D158]/90" : "dark:text-[#FF453A]/90"}>
            {result.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
