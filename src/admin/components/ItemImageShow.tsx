type Props = {
  imageUrl?: string | null;
};

const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL  || 'http://localhost:5000';

export default function ItemImageShow({ imageUrl }: Props) {
  if (!imageUrl) {
    return (
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
    );
  }

  const fullImageUrl = imageUrl.startsWith('http')
    ? imageUrl
    : `${BACKEND_BASE_URL}${imageUrl}`;

  return (
    <img
      src={fullImageUrl}
      alt="Artikelbild"
      style={{
        width: 120,
        height: 120,
        objectFit: 'cover',
        borderRadius: 8,
        border: '1px solid #ccc',
      }}
    />
  );
}