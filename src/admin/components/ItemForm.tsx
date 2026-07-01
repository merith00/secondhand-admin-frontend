import { useMemo, useEffect } from 'react';
import type { Customer, ItemFormData } from '../../types';

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


  const categories = [
    'T-Shirt',
    'Hose',
    'Jeans',
    'Kleid',
    'Rock',
    'Hemd',
    'Bluse',
    'Pullover',
    'Hoodie',
    'Jacke',
    'Mantel',
    'Weste',
    'Shorts',
    'Leggings',
    'Jogginghose',
    'Anzug',
    'Sakko',
    'Blazer',
    'Schlafbekleidung',
    'Unterwäsche',
    'Bademode',
    'Schuhe',
    'Accessoires',
    'Sonstiges',
  ];

  const sizeOptions = [
    'XS',
    'S',
    'M',
    'L',
    'XL',
    '32',
    '34',
    '36',
    '38',
    '40',
    '42',
    '44',
  ]

  const brandOptions = [
    'Nike',
    'Adidas',
    'Puma',
    'Reebok',
    'Under Armour',
    'New Balance',
    'Asics',
    'Converse',
    'Vans',
    'Fila',
    'Levi\'s',
    'Tommy Hilfiger',
    'Calvin Klein',
    'Ralph Lauren',
    'H&M',
    'Zara',
    'Uniqlo',
    'Only',
    'Vero Moda',
    'Mango',
    'Esprit',
    'Jack & Jones',
    'Superdry',
    'Sonstiges'
  ]

  const colorOptions = [
    'Schwarz',
    'Weiß',
    'Grau',
    'Rot',
    'Blau',
    'Grün',
    'Gelb',
    'Orange',
    'Lila',
    'Braun',
    'Beige',
    'Rosa',
    'Türkis',
    'Silber',
    'Gold',
    'Bunt',
    'Sonstiges'
  ];

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
        >
          <option value="">Kategorie auswählen</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select 
          name="size"
          value={formData.size}
          onChange={onChange}
        >
          <option value="">Größe auswählen</option>
          {sizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>

        <select
          name="brand"
          value={formData.brand}
          onChange={onChange}
        >
          <option value="">Marke auswählen</option>
          {brandOptions.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>




        <select
          name="color"
          value={formData.color}
          onChange={onChange}
        >
          <option value="">Farbe auswählen</option>
          {colorOptions.map((color) => (
            <option key={color} value={color}>
              {color}
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