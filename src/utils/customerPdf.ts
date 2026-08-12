import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

import type {
  Customer,
  Item,
} from '../types';


type CustomerPdfData = {
  customer: Customer;
  availableItems: Item[];
  soldItems: Item[];
  purchasedItems: Item[];
  creditBalance: number;
};


type PdfWithTable = jsPDF & {
  lastAutoTable?: {
    finalY: number;
  };
};


function formatCurrency(value?: number | string | null) {
  return `${Number(value || 0).toFixed(2)} €`;
}


function formatDate(value?: string | null) {
  if (!value) return '–';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '–';
  }

  return date.toLocaleDateString('de-DE');
}


function cleanFileName(value: string) {
  return value
    .trim()
    .replace(/[äÄ]/g, 'ae')
    .replace(/[öÖ]/g, 'oe')
    .replace(/[üÜ]/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '');
}


export function generateCustomerPdf({
  customer,
  availableItems,
  soldItems,
  purchasedItems,
  creditBalance,
}: CustomerPdfData) {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  }) as PdfWithTable;

  const pageWidth =
    pdf.internal.pageSize.getWidth();

  const pageHeight =
    pdf.internal.pageSize.getHeight();

  const margin = 14;

  const availableItemsValue =
    availableItems.reduce(
      (sum, item) =>
        sum + Number(item.start_price || 0),
      0
    );

  const soldItemsValue =
    soldItems.reduce(
      (sum, item) =>
        sum + Number(item.verkaufspreis || 0),
      0
    );

  const sellerShareTotal =
    soldItems.reduce(
      (sum, item) =>
        sum + Number(item.verkauferAnteil || 0),
      0
    );

  const purchasedItemsValue =
    purchasedItems.reduce(
      (sum, item) =>
        sum + Number(item.verkaufspreis || 0),
      0
    );


  /*
   * Kopfbereich
   */

  pdf.setFillColor(23, 34, 53);

  pdf.rect(
    0,
    0,
    pageWidth,
    31,
    'F'
  );

  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);

  pdf.text(
    'Kundenübersicht',
    margin,
    14
  );

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);

  pdf.text(
    `Erstellt am ${new Date().toLocaleDateString(
      'de-DE'
    )}`,
    margin,
    22
  );

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);

  pdf.text(
    `${customer.first_name} ${customer.last_name}`,
    pageWidth - margin,
    14,
    {
      align: 'right',
    }
  );

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);

  pdf.text(
    `Kundennummer: ${customer.customer_number}`,
    pageWidth - margin,
    22,
    {
      align: 'right',
    }
  );


  /*
   * Kunden- und Adressdaten
   */

  autoTable(pdf, {
    startY: 39,

    head: [
      [
        'Kundendaten',
        'Wert',
        'Adresse',
        'Wert',
      ],
    ],

    body: [
      [
        'Vorname',
        customer.first_name || '–',
        'Straße',
        customer.street || '–',
      ],
      [
        'Nachname',
        customer.last_name || '–',
        'Hausnummer',
        customer.house_number || '–',
      ],
      [
        'Telefon',
        customer.phone || '–',
        'Postleitzahl',
        customer.postal_code || '–',
      ],
      [
        'E-Mail',
        customer.email || '–',
        'Ort',
        customer.city || '–',
      ],
      [
        'Aktuelles Guthaben',
        formatCurrency(creditBalance),
        '',
        '',
      ],
    ],

    theme: 'grid',

    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 3,
      textColor: [39, 54, 74],
      lineColor: [220, 226, 234],
      lineWidth: 0.2,
    },

    headStyles: {
      fillColor: [47, 128, 237],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },

    columnStyles: {
      0: {
        fontStyle: 'bold',
        fillColor: [247, 249, 252],
      },
      2: {
        fontStyle: 'bold',
        fillColor: [247, 249, 252],
      },
    },

    margin: {
      left: margin,
      right: margin,
    },
  });


  /*
   * Übersicht
   */

  const overviewStartY =
    (pdf.lastAutoTable?.finalY || 39) + 8;

  pdf.setTextColor(23, 34, 53);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);

  pdf.text(
    'Übersicht',
    margin,
    overviewStartY
  );

  autoTable(pdf, {
    startY: overviewStartY + 4,

    head: [
      [
        'Abgegeben',
        'Noch vorhanden',
        'Verkauft',
        'Gekauft',
        'Wert im Bestand',
        'Verkaufssumme',
        'Verkäuferguthaben',
      ],
    ],

    body: [
      [
        availableItems.length +
          soldItems.length,
        availableItems.length,
        soldItems.length,
        purchasedItems.length,
        formatCurrency(
          availableItemsValue
        ),
        formatCurrency(
          soldItemsValue
        ),
        formatCurrency(
          sellerShareTotal
        ),
      ],
    ],

    theme: 'grid',

    styles: {
      font: 'helvetica',
      fontSize: 9,
      halign: 'center',
      cellPadding: 3,
      textColor: [39, 54, 74],
      lineColor: [220, 226, 234],
      lineWidth: 0.2,
    },

    headStyles: {
      fillColor: [247, 249, 252],
      textColor: [82, 97, 115],
      fontStyle: 'bold',
    },

    bodyStyles: {
      fontStyle: 'bold',
    },

    margin: {
      left: margin,
      right: margin,
    },
  });


  function addSectionTitle(
    title: string,
    minimumSpace = 35
  ) {
    let startY =
      (pdf.lastAutoTable?.finalY || 20) + 10;

    if (
      startY + minimumSpace >
      pageHeight - 14
    ) {
      pdf.addPage();
      startY = 18;
    }

    pdf.setTextColor(23, 34, 53);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);

    pdf.text(
      title,
      margin,
      startY
    );

    return startY + 4;
  }


  /*
   * Noch vorhandene Kleidung
   */

  const availableStartY = addSectionTitle(
    'Noch vorhandene Kleidung'
  );

  autoTable(pdf, {
    startY: availableStartY,

    head: [
      [
        'ID',
        'Titel',
        'Kategorie',
        'Marke',
        'Größe',
        'Farbe',
        'Verfügbar seit',
        'Angedachter Preis',
      ],
    ],

    body:
      availableItems.length > 0
        ? availableItems.map((item) => [
            `#${item.id}`,
            item.title || '–',
            item.category || '–',
            item.brand || '–',
            item.size || '–',
            item.color || '–',
            formatDate(item.created_at),
            formatCurrency(
              item.start_price
            ),
          ])
        : [
            [
              '',
              'Keine vorhandenen Artikel',
              '',
              '',
              '',
              '',
              '',
              '',
            ],
          ],

    foot:
      availableItems.length > 0
        ? [
            [
              '',
              'Summe',
              '',
              '',
              '',
              '',
              '',
              formatCurrency(
                availableItemsValue
              ),
            ],
          ]
        : undefined,

    theme: 'striped',

    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [39, 54, 74],
      lineColor: [226, 232, 240],
      lineWidth: 0.15,
    },

    headStyles: {
      fillColor: [23, 34, 53],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },

    footStyles: {
      fillColor: [234, 242, 255],
      textColor: [38, 115, 221],
      fontStyle: 'bold',
    },

    margin: {
      left: margin,
      right: margin,
      bottom: 15,
    },

    showHead: 'everyPage',
  });


  /*
   * Verkaufte Kleidung
   */

  const soldStartY = addSectionTitle(
    'Verkaufte Kleidung'
  );

  autoTable(pdf, {
    startY: soldStartY,

    head: [
      [
        'ID',
        'Titel',
        'Kategorie',
        'Größe',
        'Verkauft am',
        'Startpreis',
        'Verkaufspreis',
        'Shopanteil',
        'Verkäuferanteil',
      ],
    ],

    body:
      soldItems.length > 0
        ? soldItems.map((item) => [
            `#${item.id}`,
            item.title || '–',
            item.category || '–',
            item.size || '–',
            formatDate(item.sold_at),
            formatCurrency(
              item.start_price
            ),
            formatCurrency(
              item.verkaufspreis
            ),
            formatCurrency(
              item.shopAnteil
            ),
            formatCurrency(
              item.verkauferAnteil
            ),
          ])
        : [
            [
              '',
              'Noch keine verkauften Artikel',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
            ],
          ],

    foot:
      soldItems.length > 0
        ? [
            [
              '',
              'Summe',
              '',
              '',
              '',
              '',
              formatCurrency(
                soldItemsValue
              ),
              '',
              formatCurrency(
                sellerShareTotal
              ),
            ],
          ]
        : undefined,

    theme: 'striped',

    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 2.3,
      textColor: [39, 54, 74],
      lineColor: [226, 232, 240],
      lineWidth: 0.15,
    },

    headStyles: {
      fillColor: [23, 34, 53],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },

    footStyles: {
      fillColor: [237, 249, 240],
      textColor: [22, 128, 58],
      fontStyle: 'bold',
    },

    margin: {
      left: margin,
      right: margin,
      bottom: 15,
    },

    showHead: 'everyPage',
  });


  /*
   * Gekaufte Kleidung
   */

  const purchasedStartY =
    addSectionTitle(
      'Gekaufte Kleidung'
    );

  autoTable(pdf, {
    startY: purchasedStartY,

    head: [
      [
        'ID',
        'Titel',
        'Kategorie',
        'Marke',
        'Größe',
        'Ursprünglicher Eigentümer',
        'Verkaufspreis',
      ],
    ],

    body:
      purchasedItems.length > 0
        ? purchasedItems.map((item) => [
            `#${item.id}`,
            item.title || '–',
            item.category || '–',
            item.brand || '–',
            item.size || '–',
            item.customer_number || '–',
            formatCurrency(
              item.verkaufspreis
            ),
          ])
        : [
            [
              '',
              'Noch keine gekauften Artikel',
              '',
              '',
              '',
              '',
              '',
            ],
          ],

    foot:
      purchasedItems.length > 0
        ? [
            [
              '',
              'Summe',
              '',
              '',
              '',
              '',
              formatCurrency(
                purchasedItemsValue
              ),
            ],
          ]
        : undefined,

    theme: 'striped',

    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [39, 54, 74],
      lineColor: [226, 232, 240],
      lineWidth: 0.15,
    },

    headStyles: {
      fillColor: [23, 34, 53],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },

    footStyles: {
      fillColor: [234, 242, 255],
      textColor: [38, 115, 221],
      fontStyle: 'bold',
    },

    margin: {
      left: margin,
      right: margin,
      bottom: 15,
    },

    showHead: 'everyPage',
  });


  /*
   * Seitenzahlen
   */

  const pageCount =
    pdf.getNumberOfPages();

  for (
    let pageNumber = 1;
    pageNumber <= pageCount;
    pageNumber += 1
  ) {
    pdf.setPage(pageNumber);

    pdf.setDrawColor(220, 226, 234);

    pdf.line(
      margin,
      pageHeight - 10,
      pageWidth - margin,
      pageHeight - 10
    );

    pdf.setFont(
      'helvetica',
      'normal'
    );

    pdf.setFontSize(8);
    pdf.setTextColor(113, 128, 150);

    pdf.text(
      `Seite ${pageNumber} von ${pageCount}`,
      pageWidth - margin,
      pageHeight - 5,
      {
        align: 'right',
      }
    );

    pdf.text(
      `${customer.customer_number} · ${customer.first_name} ${customer.last_name}`,
      margin,
      pageHeight - 5
    );
  }


  const fileName = [
    'Kunde',
    customer.customer_number,
    customer.first_name,
    customer.last_name,
  ]
    .map((part) =>
      cleanFileName(String(part || ''))
    )
    .filter(Boolean)
    .join('_');

  pdf.save(`${fileName}.pdf`);
}