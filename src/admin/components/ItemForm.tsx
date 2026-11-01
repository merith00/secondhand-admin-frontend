import './CompactItemForm.css';
import OptionPicker from './OptionPicker';
import CustomerPicker from './CustomerPicker';
import { errorMessage } from '../../utils/errors';
import { useMemo, useEffect, useState } from 'react';
import type {
  Customer,
  ItemFormData,
  ItemOption,
} from '../../types';

import { createItemOption, fetchItemOptions } from '../../api/adminApi';

type ItemFormProps = {
  formData: ItemFormData;
  customers: Customer[];
  onOwnerChange: (id: string) => void;
  onOptionChange: (name: 'category' | 'brand' | 'color' | 'size', value: string) => void;
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
  onOwnerChange,
  onOptionChange,
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
  const [optionsError, setOptionsError] = useState('');

  useEffect(() => {
    async function loadItemOptions() {
      try {
        setLoadingOptions(true);

        const data = await fetchItemOptions();

        setItemOptions(data);
      } catch (err: unknown) {
        setOptionsError(errorMessage(err, 'Auswahlmöglichkeiten konnten nicht geladen werden.'));
      } finally {
        setLoadingOptions(false);
      }
    }

    loadItemOptions();
  }, []);


  async function addItemOption(type: 'category' | 'brand' | 'color' | 'size', value: string): Promise<string> {
    const existing = itemOptions.find(option => option.type === type
      && option.value.trim().toLocaleLowerCase('de') === value.trim().toLocaleLowerCase('de'));
    if (existing) return existing.value;
    const created: ItemOption = await createItemOption({ type, value: value.trim() });
    setItemOptions(previous => [...previous.filter(option => option.id !== created.id), created]);
    return created.value;
  }

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
      {optionsError && <div className="error-box" role="alert">{optionsError}</div>}

      <form className="form-grid compact-item-form" onSubmit={onSubmit}>
        <CustomerPicker customers={customers} value={formData.owner_customer_id} onChange={onOwnerChange} />

        <label className="item-title">Titel
        <input
          name="title"
          placeholder="Titel"
          value={formData.title}
          onChange={onChange}
          required
        />
        </label>
        <label className="item-price">Preis (€)
        <input
          name="price"
          type="number"
          step="0.01"
          placeholder="Preis"
          value={formData.price}
          onChange={onChange}
          required
        />
        </label>

        <label className="item-description">Beschreibung
        <textarea
          name="description"
          placeholder="Beschreibung"
          value={formData.description}
          onChange={onChange}
          rows={2}
        />
        </label>

        <OptionPicker label="Kategorie" name="category" value={formData.category}
          options={categories.map(option => option.value)} disabled={loadingOptions}
          onChange={value => onOptionChange('category', value)}
          onCreate={value => addItemOption('category', value)} />

        <OptionPicker label="Größe" name="size" value={formData.size}
          options={sizeOptions.map(option => option.value)} disabled={loadingOptions}
          onChange={value => onOptionChange('size', value)}
          onCreate={value => addItemOption('size', value)} />

        <OptionPicker label="Marke" name="brand" value={formData.brand}
          options={brandOptions.map(option => option.value)} disabled={loadingOptions}
          onChange={value => onOptionChange('brand', value)}
          onCreate={value => addItemOption('brand', value)} />



        <OptionPicker label="Farbe" name="color" value={formData.color}
          options={colorOptions.map(option => option.value)} disabled={loadingOptions}
          onChange={value => onOptionChange('color', value)}
          onCreate={value => addItemOption('color', value)} />



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