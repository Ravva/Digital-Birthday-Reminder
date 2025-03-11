declare module 'exceljs' {
    export interface Workbook {
        xlsx: {
            readFile(filename: string): Promise<Workbook>;
            writeFile(filename: string): Promise<void>;
            load(buffer: Buffer | ArrayBuffer): Promise<Workbook>;
        };
        csv: {
            readFile(filename: string): Promise<Workbook>;
            writeFile(filename: string): Promise<void>;
        };
        addWorksheet(name?: string): Worksheet;
        removeWorksheet(name: string): void;
        getWorksheet(name: string): Worksheet;
        worksheets: Worksheet[];
    }

    export interface Worksheet {
        name: string;
        columns: Column[];
        getRow(index: number): Row;
        getColumn(index: number): Column;
        addRow(data: any[]): Row;
        eachRow(callback: (row: Row, rowNumber: number) => void): void;
    }

    export interface Column {
        header: string;
        key: string;
        width?: number;
    }

    export interface Row {
        values: any[];
        getCell(index: number): Cell;
    }

    export interface Cell {
        value: any;
        type: string;
    }

    export class Workbook implements Workbook {}
}
