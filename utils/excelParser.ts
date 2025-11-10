
// This assumes the xlsx library is loaded globally from a CDN in index.html
declare const XLSX: any;

/**
 * Parses an Excel file to extract its structure (sheet names and headers).
 * @param file The Excel file to parse.
 * @returns A promise that resolves to a string describing the file structure.
 */
export const parseExcelStructure = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (typeof XLSX === 'undefined') {
      return reject(new Error('XLSX library is not loaded.'));
    }

    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      try {
        const data = event.target?.result;
        if (!data) {
          throw new Error('File data could not be read.');
        }

        const workbook = XLSX.read(data, { type: 'array' });
        let structureString = '';

        workbook.SheetNames.forEach((sheetName: string) => {
          const worksheet = workbook.Sheets[sheetName];
          // Get headers from the first row
          const headers: string[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] || [];
          
          structureString += `Sheet '${sheetName}': [${headers.join(', ')}]\n`;
        });

        if (!structureString) {
          resolve("The Excel file appears to be empty or doesn't contain any recognizable sheets/headers.");
        } else {
          resolve(structureString);
        }
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        reject(new Error('Failed to parse the Excel file. It might be corrupted or in an unsupported format.'));
      }
    };

    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      reject(new Error('Failed to read the file.'));
    };

    reader.readAsArrayBuffer(file);
  });
};
