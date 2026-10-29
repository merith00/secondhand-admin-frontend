import { isTauri } from '@tauri-apps/api/core';
import type { jsPDF } from 'jspdf';

export async function savePdf(pdf: jsPDF, fileName: string): Promise<boolean> {
  if (!isTauri()) {
    await pdf.save(fileName, { returnPromise: true });
    return true;
  }

  const [{ save }, { writeFile }] = await Promise.all([
    import('@tauri-apps/plugin-dialog'),
    import('@tauri-apps/plugin-fs'),
  ]);
  const path = await save({
    title: 'Kundenübersicht als PDF speichern',
    defaultPath: fileName,
    filters: [{ name: 'PDF-Dokument', extensions: ['pdf'] }],
  });
  if (!path) return false;
  await writeFile(path, new Uint8Array(pdf.output('arraybuffer')));
  return true;
}
