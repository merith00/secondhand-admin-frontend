import { useMemo, useEffect, useState } from 'react';
import type {
  Customer,
  ItemFormData,
  ItemOption,
} from '../../types';

import { fetchItemOptions } from '../../api/adminApi';

type ItemFormProps = {
  formData: ItemFormData;
  customers: Customer[];
  selectedImage: File | null;
  onImageChange: (file: File | null) => void;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onTakePhoto: () => void;
  onPickPhoto: () => void;
  imagePreview?: string;
  isUploadingImage?: boolean;
  isNativeMobile?: boolean;
};

export default function ItemForm({
  formData,
  customers,
  selectedImage,
  onImageChange,
  onChange,
  onCheckboxChange,
  onSubmit,
  onTakePhoto,
  onPickPhoto,
  imagePreview,
  isUploadingImage,
  isNativeMobile,
}: ItemFormProps) {
  const previewUrl = useMemo(() => {
    if (!selectedImage) return null;
    return URL.createObjectURL(selectedImage);
  }, [selectedImage]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);


  const [itemOptions, setItemOptions] = useState<ItemOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    async function loadItemOptions() {
      try {
        setLoadingOptions(true);

        const data = await fetchItemOptions();

        setItemOptions(data);
      } catch (err: any) {
        // setOptionsError(
        //   err.message || 'Auswahlmöglichkeiten konnten nicht geladen werden'
        // );
      } finally {
        setLoadingOptions(false);
      }
    }

    loadItemOptions();
  }, []);


  const categories = itemOptions.filter(
    (option) => option.type === 'category'
  );

  const sizeOptions = itemOptions.filter(
    (option) => option.type === 'size'
  );

  const brandOptions = itemOptions.filter(
    (option) => option.type === 'brand'
  );

  const colorOptions = itemOptions.filter(
    (option) => option.type === 'color'
  );

  return (
    <section className="card">
      <h3>Neues Kleidungsstück anlegen</h3>

      <form className="form-grid" onSubmit={onSubmit}>
        <select
          name="owner_customer_id"
          value={formData.owner_customer_id}
          onChange={onChange}
          required
        >
          <option value="">Eigentümer auswählen</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.customer_number} - {customer.first_name} {customer.last_name}
            </option>
          ))}
        </select>

        <input
          name="title"
          placeholder="Titel"
          value={formData.title}
          onChange={onChange}
          required
        />

        <textarea
          name="description"
          placeholder="Beschreibung"
          value={formData.description}
          onChange={onChange}
          rows={4}
        />

        <select
          name="category"
          value={formData.category}
          onChange={onChange}
          disabled={loadingOptions}
        >
          <option value="">
            {loadingOptions
              ? 'Kategorien werden geladen...'
              : 'Kategorie auswählen'}
          </option>

          {categories.map((option) => (
            <option key={option.id} value={option.value}>
              {option.value}
            </option>
          ))}
        </select>

        <select
          name="size"
          value={formData.size}
          onChange={onChange}
          disabled={loadingOptions}
        >
          <option value="">
            {loadingOptions
              ? 'Größen werden geladen...'
              : 'Größe auswählen'}
          </option>

          {sizeOptions.map((option) => (
            <option key={option.id} value={option.value}>
              {option.value}
            </option>
          ))}
        </select>

        <select
          name="brand"
          value={formData.brand}
          onChange={onChange}
          disabled={loadingOptions}
        >
          <option value="">
            {loadingOptions
              ? 'Marken werden geladen...'
              : 'Marke auswählen'}
          </option>

          {brandOptions.map((option) => (
            <option key={option.id} value={option.value}>
              {option.value}
            </option>
          ))}
        </select>



        <select
          name="color"
          value={formData.color}
          onChange={onChange}
          disabled={loadingOptions}
        >
          <option value="">
            {loadingOptions
              ? 'Farben werden geladen...'
              : 'Farbe auswählen'}
          </option>

          {colorOptions.map((option) => (
            <option key={option.id} value={option.value}>
              {option.value}
            </option>
          ))}
        </select>

        <input
          name="price"
          type="number"
          step="0.01"
          placeholder="Preis"
          value={formData.price}
          onChange={onChange}
          required
        />

        <div className="form-group image-upload-group">
          <label>Bild</label>

          {!isNativeMobile && (
            <div className="image-upload-desktop">
              <label className="file-upload-btn">
                📁 Bild auswählen
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => onImageChange(e.target.files?.[0] || null)}
                  hidden
                />
              </label>
            </div>
          )}

          {isNativeMobile && (
            <div className="image-upload-mobile">
              <button
                type="button"
                className="image-btn camera"
                onClick={onTakePhoto}
                disabled={isUploadingImage}
              >
                📸 Kamera
              </button>

              <button
                type="button"
                className="image-btn gallery"
                onClick={onPickPhoto}
                disabled={isUploadingImage}
              >
                🖼 Galerie
              </button>
            </div>
          )}

          {isUploadingImage && (
            <div className="upload-status">
              ⏳ Bild wird verarbeitet...
            </div>
          )}

          {(imagePreview || previewUrl) && (
            <div className="image-preview">
              <img src={imagePreview || previewUrl || ''} alt="Preview" />
            </div>
          )}
        </div>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={formData.is_online_visible}
            onChange={onCheckboxChange}
          />
          Im Onlineshop sichtbar
        </label>

        <button type="submit" className="primary-btn">
          Kleidungsstück speichern
        </button>
      </form>
    </section>
  );
}