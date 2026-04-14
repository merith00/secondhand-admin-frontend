import { useState } from 'react';
import { uploadItemImage, deleteItemImage } from '../../api/adminApi';

type Props = {
  itemId: number;
  currentImageUrl?: string | null;
  onUploaded?: (newImageUrl: string) => void;
  onDeleted?: () => void;
};

export default function ItemImageUpload({
  itemId,
  currentImageUrl,
  onUploaded,
  onDeleted,
}: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);

    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl(null);
    }
  }

  async function handleUpload() {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      const result = await uploadItemImage(itemId, selectedFile);

      setSelectedFile(null);
      setPreviewUrl(null);
      onUploaded?.(result.image_url);
    } catch (error) {
      console.error(error);
      alert('Bild-Upload fehlgeschlagen');
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteItemImage(itemId);
      setSelectedFile(null);
      setPreviewUrl(null);
      onDeleted?.();
    } catch (error) {
      console.error(error);
      alert('Bild konnte nicht gelöscht werden');
    }
  }

  const shownImage = previewUrl || currentImageUrl || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {shownImage ? (
        <img
          src={shownImage}
          alt="Artikelbild"
          style={{
            width: 120,
            height: 120,
            objectFit: 'cover',
            borderRadius: 8,
            border: '1px solid #ccc',
          }}
        />
      ) : (
        <div
          style={{
            width: 120,
            height: 120,
            border: '1px dashed #ccc',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            color: '#777',
          }}
        >
          Kein Bild
        </div>
      )}

      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileChange}
      />

      <button type="button" onClick={handleUpload} disabled={!selectedFile || isUploading}>
        {isUploading ? 'Lade hoch...' : 'Bild hochladen'}
      </button>

      {currentImageUrl && (
        <button type="button" onClick={handleDelete}>
          Bild löschen
        </button>
      )}
    </div>
  );
}