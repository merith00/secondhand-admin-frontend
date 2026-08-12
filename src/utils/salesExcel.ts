import ExcelJS from 'exceljs';

import type { Customer, Sale } from '../types';

type SalesExcelData = {
  sales: Sale[];
  customers: Customer[];
};

const EXCEL_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

function getCustomerName(customer?: Customer) {
  if (!customer) return '–';

  return `${customer.first_name} ${customer.last_name}`.trim();
}

function getSaleTypeLabel(saleType: Sale['sale_type']) {
  return saleType === 'store' ? 'Laden' : 'Online';
}

function getPaymentMethodLabel(
  paymentMethod: Sale['payment_method']
) {
  return paymentMethod === 'cash' ? 'Bar' : 'Überweisung';
}

function getValidDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function createFileName() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `Verkaufshistorie_${year}-${month}-${day}.xlsx`;
}

export async function exportSalesToExcel({
  sales,
  customers,
}: SalesExcelData) {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = 'Secondhand Admin';
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet('Verkaufshistorie', {
    views: [
      {
        state: 'frozen',
        ySplit: 1,
      },
    ],
  });

  worksheet.columns = [
    { header: 'Transaktionsnummer', key: 'transaction_id', width: 39 },
    { header: 'Verkaufs-ID', key: 'sale_id', width: 13 },
    { header: 'Verkaufsdatum', key: 'sale_date', width: 20 },
    { header: 'Artikel-ID', key: 'item_id', width: 12 },
    { header: 'Artikel', key: 'title', width: 28 },
    { header: 'Kategorie', key: 'category', width: 18 },
    { header: 'Marke', key: 'brand', width: 18 },
    { header: 'Verkäufer-Nr.', key: 'seller_number', width: 16 },
    { header: 'Verkäufer', key: 'seller_name', width: 24 },
    { header: 'Käufer-Nr.', key: 'buyer_number', width: 15 },
    { header: 'Käufer', key: 'buyer_name', width: 24 },
    { header: 'Verkaufspreis', key: 'sale_price', width: 17 },
    { header: 'Guthaben verwendet', key: 'credit_used', width: 20 },
    { header: 'Bar bezahlt', key: 'cash_paid', width: 15 },
    { header: 'Verkäuferanteil', key: 'owner_amount', width: 19 },
    { header: 'Shopanteil', key: 'shop_amount', width: 15 },
    { header: 'Verkaufsart', key: 'sale_type', width: 15 },
    { header: 'Zahlungsart', key: 'payment_method', width: 16 },
    { header: 'Barzahlung bestätigt', key: 'cash_confirmed', width: 21 },
    { header: 'Notizen', key: 'notes', width: 32 },
  ];

  const sortedSales = [...sales].sort((first, second) => {
    return (
      new Date(second.sale_date).getTime() -
      new Date(first.sale_date).getTime()
    );
  });

  sortedSales.forEach((sale) => {
    const buyer = customers.find(
      (customer) => customer.id === sale.buyer_customer_id
    );

    worksheet.addRow({
      transaction_id: sale.transaction_id || `Einzelverkauf-${sale.id}`,
      sale_id: sale.id,
      sale_date: getValidDate(sale.sale_date),
      item_id: sale.item_id,
      title: sale.title || '–',
      category: sale.category || '–',
      brand: sale.brand || '–',
      seller_number: sale.customer_number || '–',
      seller_name: `${sale.first_name} ${sale.last_name}`.trim(),
      buyer_number: buyer?.customer_number || '–',
      buyer_name: getCustomerName(buyer),
      sale_price: Number(sale.sale_price || 0),
      credit_used: Number(
        sale.buyer_credit_used ?? sale.sale_price ?? 0
      ),
      cash_paid: Number(sale.buyer_cash_paid || 0),
      owner_amount: Number(sale.owner_amount || 0),
      shop_amount: Number(sale.shop_amount || 0),
      sale_type: getSaleTypeLabel(sale.sale_type),
      payment_method: getPaymentMethodLabel(sale.payment_method),
      cash_confirmed: sale.cash_difference_confirmed ? 'Ja' : 'Nein',
      notes: sale.notes || '',
    });
  });

  const headerRow = worksheet.getRow(1);

  headerRow.height = 28;
  headerRow.font = {
    bold: true,
    color: { argb: 'FFFFFFFF' },
  };
  headerRow.alignment = {
    vertical: 'middle',
    horizontal: 'center',
  };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF172235' },
  };

  headerRow.eachCell((cell) => {
    cell.border = {
      bottom: {
        style: 'thin',
        color: { argb: 'FFCCD4DF' },
      },
    };
  });

  worksheet.autoFilter = {
    from: 'A1',
    to: 'T1',
  };

  const currencyColumns = ['L', 'M', 'N', 'O', 'P'];

  currencyColumns.forEach((columnLetter) => {
    worksheet.getColumn(columnLetter).numFmt = '#,##0.00 [$€-407]';
  });

  worksheet.getColumn('C').numFmt = 'dd.mm.yyyy hh:mm';

  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);

    row.height = 22;
    row.alignment = {
      vertical: 'middle',
    };

    if (rowNumber % 2 === 0) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF7F9FC' },
      };
    }

    row.eachCell((cell) => {
      cell.border = {
        bottom: {
          style: 'hair',
          color: { argb: 'FFE3E8EF' },
        },
      };
    });
  }

  if (sortedSales.length > 0) {
    const firstDataRow = 2;
    const lastDataRow = sortedSales.length + 1;
    const totalRow = worksheet.addRow({
      title: 'Gesamtsummen',
      sale_price: {
        formula: `SUM(L${firstDataRow}:L${lastDataRow})`,
      },
      credit_used: {
        formula: `SUM(M${firstDataRow}:M${lastDataRow})`,
      },
      cash_paid: {
        formula: `SUM(N${firstDataRow}:N${lastDataRow})`,
      },
      owner_amount: {
        formula: `SUM(O${firstDataRow}:O${lastDataRow})`,
      },
      shop_amount: {
        formula: `SUM(P${firstDataRow}:P${lastDataRow})`,
      },
    });

    totalRow.height = 25;
    totalRow.font = {
      bold: true,
      color: { argb: 'FF172235' },
    };
    totalRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFEAF2FF' },
    };

    currencyColumns.forEach((columnLetter) => {
      totalRow.getCell(columnLetter).numFmt = '#,##0.00 [$€-407]';
    });
  }

  worksheet.pageSetup = {
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    paperSize: 9,
    margins: {
      left: 0.3,
      right: 0.3,
      top: 0.5,
      bottom: 0.5,
      header: 0.2,
      footer: 0.2,
    },
  };

  worksheet.headerFooter.oddHeader =
    '&LVerkaufshistorie&R&D &T';
  worksheet.headerFooter.oddFooter =
    '&LSecondhand Admin&RSeite &P von &N';

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer as BlobPart], {
    type: EXCEL_MIME_TYPE,
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = createFileName();
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
}