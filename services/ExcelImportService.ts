import ExcelJS from 'exceljs';
import { Lead } from '../types';

export interface ExcelRow {
  'Tên khách hàng': string;
  'Số điện thoại': string;
  'Địa chỉ': string;
  'Mã số thuế': string;
  'Nguồn': string;
}

export interface ImportResult {
  success: number;
  failed: number;
  errors: { row: number; error: string; data: any }[];
  leads: Partial<Lead>[];
}

/**
 * Danh sách nguồn hợp lệ (khớp với dropdown trong Excel)
 */
const VALID_SOURCES = [
  'Facebook Ads',
  'TikTok Ads',
  'Google Ads',
  'FB Messenger',
  'Zalo',
  'Website Form',
  'Other'
];

/**
 * Map nguồn từ Excel sang format Dataverse
 */
const mapExcelSourceToDataverse = (source: string): string => {
  const trimmedSource = source?.trim();
  
  // Map FB Messenger sang tên đầy đủ
  if (trimmedSource === 'FB Messenger') {
    return 'Facebook Messenger Organic';
  }
  
  // Kiểm tra nếu nguồn nằm trong danh sách hợp lệ
  if (VALID_SOURCES.includes(trimmedSource)) {
    return trimmedSource;
  }
  
  return 'Other';
};

/**
 * Validate số điện thoại
 */
const validatePhone = (phone: string): boolean => {
  if (!phone) return false;
  const phoneRegex = /^[0-9]{9,11}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validate mã số thuế (optional)
 */
const validateTaxCode = (taxCode: string): boolean => {
  if (!taxCode || taxCode.trim() === '') return true; // Optional field
  const taxCodeRegex = /^[0-9]{10}$|^[0-9]{13}$/;
  return taxCodeRegex.test(taxCode);
};

/**
 * Đọc file Excel và convert sang array of leads
 */
export const parseExcelFile = (file: File): Promise<ImportResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);

        // Lấy sheet đầu tiên
        const worksheet = workbook.worksheets[0];
        
        const result: ImportResult = {
          success: 0,
          failed: 0,
          errors: [],
          leads: [],
        };

        // Bỏ qua dòng header (dòng 1)
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return; // Skip header

          try {
            // Lấy giá trị từ các cột
            const name = row.getCell(1).value?.toString().trim() || '';
            const phone = row.getCell(2).value?.toString().trim() || '';
            const address = row.getCell(3).value?.toString().trim() || '';
            const taxCode = row.getCell(4).value?.toString().trim() || '';
            const source = row.getCell(5).value?.toString().trim() || 'Other';

            // Validation
            if (!name) {
              throw new Error('Tên khách hàng không được để trống');
            }

            if (!phone) {
              throw new Error('Số điện thoại không được để trống');
            }

            if (!validatePhone(phone)) {
              throw new Error('Số điện thoại không hợp lệ (9-11 số)');
            }

            if (!validateTaxCode(taxCode)) {
              throw new Error('Mã số thuế không hợp lệ (10 hoặc 13 chữ số)');
            }

            // Validate source
            if (!VALID_SOURCES.includes(source)) {
              throw new Error(`Nguồn không hợp lệ. Chọn từ: ${VALID_SOURCES.join(', ')}`);
            }

            // Map source
            const mappedSource = mapExcelSourceToDataverse(source);

            // Create lead object
            const lead: Partial<Lead> = {
              name,
              phone,
              address,
              taxCode,
              source: mappedSource,
              status: 'Marketing đã xác nhận', // Default status
            };

            result.leads.push(lead);
            result.success++;
          } catch (error) {
            result.failed++;
            result.errors.push({
              row: rowNumber,
              error: error instanceof Error ? error.message : 'Lỗi không xác định',
              data: {
                name: row.getCell(1).value,
                phone: row.getCell(2).value,
                address: row.getCell(3).value,
                taxCode: row.getCell(4).value,
                source: row.getCell(5).value,
              },
            });
          }
        });

        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Tạo file Excel mẫu với dropdown validation để download
 */
export const createExcelTemplate = async (): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Khách hàng');

  // Tạo header với style
  const headerRow = worksheet.addRow([
    'Tên khách hàng',
    'Số điện thoại',
    'Địa chỉ',
    'Mã số thuế',
    'Nguồn'
  ]);

  // Style cho header
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' }
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  // Thêm 2 dòng dữ liệu mẫu
  worksheet.addRow([
    'Công ty ABC',
    '0123456789',
    '123 Đường ABC, Quận 1, TP.HCM',
    '0123456789',
    'Facebook Ads'
  ]);
  worksheet.addRow([
    'Công ty XYZ',
    '0987654321',
    '456 Đường XYZ, Quận 2, TP.HCM',
    '9876543210',
    'Google Ads'
  ]);

  // Set column widths
  worksheet.getColumn(1).width = 30; // Tên khách hàng
  worksheet.getColumn(2).width = 18; // Số điện thoại
  worksheet.getColumn(3).width = 40; // Địa chỉ
  worksheet.getColumn(4).width = 18; // Mã số thuế
  worksheet.getColumn(5).width = 22; // Nguồn

  // Thiết lập dropdown validation cho cột "Nguồn" (cột E) từ dòng 2 đến 1000
  for (let i = 2; i <= 1000; i++) {
    worksheet.getCell(`E${i}`).dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: [`"${VALID_SOURCES.join(',')}"`],
      showErrorMessage: true,
      errorTitle: 'Sai lựa chọn',
      error: 'Vui lòng chọn đúng nguồn từ danh sách có sẵn.',
      showInputMessage: true,
      promptTitle: 'Chọn nguồn',
      prompt: 'Chọn một nguồn từ danh sách dropdown'
    };
  }

  // Tạo buffer và download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  // Tạo link download
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Mau_Import_Khach_Hang.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
