import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export async function takePhotoWithCamera() {
  return Camera.getPhoto({
    quality: 80,
    allowEditing: false,
    resultType: CameraResultType.Uri,
    source: CameraSource.Camera,
  });
}

export async function pickPhotoFromGallery() {
  return Camera.getPhoto({
    quality: 80,
    allowEditing: false,
    resultType: CameraResultType.Uri,
    source: CameraSource.Photos,
  });
}

export async function webPathToBlob(webPath?: string): Promise<Blob> {
  if (!webPath) {
    throw new Error('Kein Bildpfad vorhanden.');
  }

  const response = await fetch(webPath);
  if (!response.ok) {
    throw new Error('Bild konnte nicht geladen werden.');
  }

  return await response.blob();
}