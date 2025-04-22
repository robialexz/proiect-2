/**
 * Serviciu pentru optimizarea imaginilor
 * Acest serviciu oferă funcții pentru optimizarea și gestionarea imaginilor
 */

// Dimensiuni predefinite pentru imagini optimizate
export enum ImageSize {
  THUMBNAIL = 'thumbnail', // 100x100
  SMALL = 'small',         // 300x300
  MEDIUM = 'medium',       // 600x600
  LARGE = 'large',         // 1200x1200
  ORIGINAL = 'original'    // Dimensiunea originală
}

// Maparea dimensiunilor la valori numerice
const imageSizeDimensions: Record<ImageSize, { width: number; height: number }> = {
  [ImageSize.THUMBNAIL]: { width: 100, height: 100 },
  [ImageSize.SMALL]: { width: 300, height: 300 },
  [ImageSize.MEDIUM]: { width: 600, height: 600 },
  [ImageSize.LARGE]: { width: 1200, height: 1200 },
  [ImageSize.ORIGINAL]: { width: 0, height: 0 } // 0 înseamnă dimensiunea originală
};

// Calitatea implicită pentru imagini
const DEFAULT_QUALITY = 80;

/**
 * Optimizează un URL de imagine pentru Cloudinary
 * @param url URL-ul imaginii
 * @param size Dimensiunea dorită
 * @param quality Calitatea imaginii (0-100)
 */
export function optimizeCloudinaryUrl(
  url: string,
  size: ImageSize = ImageSize.MEDIUM,
  quality: number = DEFAULT_QUALITY
): string {
  try {
    // Verificăm dacă URL-ul este de la Cloudinary
    if (!url.includes('cloudinary.com')) {
      return url;
    }

    // Obținem dimensiunile pentru mărimea specificată
    const { width, height } = imageSizeDimensions[size];

    // Construim parametrii de transformare
    const transformParams = [];

    // Adăugăm parametrul de calitate
    transformParams.push(`q_${quality}`);

    // Adăugăm parametrii de dimensiune dacă nu este ORIGINAL
    if (size !== ImageSize.ORIGINAL) {
      transformParams.push(`c_fit`); // Crop fit pentru a păstra raportul de aspect
      transformParams.push(`w_${width}`);
      transformParams.push(`h_${height}`);
    }

    // Construim URL-ul optimizat
    // Cloudinary URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/image.jpg
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) {
      return url;
    }

    const baseUrl = url.substring(0, uploadIndex + 8); // Include '/upload/'
    const imagePathWithParams = url.substring(uploadIndex + 8);

    return `${baseUrl}${transformParams.join(',')}/${imagePathWithParams}`;
  } catch (error) {
    // Removed console statement
    return url;
  }
}

/**
 * Optimizează un URL de imagine pentru Imgix
 * @param url URL-ul imaginii
 * @param size Dimensiunea dorită
 * @param quality Calitatea imaginii (0-100)
 */
export function optimizeImgixUrl(
  url: string,
  size: ImageSize = ImageSize.MEDIUM,
  quality: number = DEFAULT_QUALITY
): string {
  try {
    // Verificăm dacă URL-ul este de la Imgix
    if (!url.includes('imgix.net')) {
      return url;
    }

    // Obținem dimensiunile pentru mărimea specificată
    const { width, height } = imageSizeDimensions[size];

    // Construim URL-ul cu parametri
    const urlObj = new URL(url);

    // Adăugăm parametrul de calitate
    urlObj.searchParams.set('q', quality.toString());

    // Adăugăm parametrii de dimensiune dacă nu este ORIGINAL
    if (size !== ImageSize.ORIGINAL) {
      urlObj.searchParams.set('fit', 'clip'); // Păstrează raportul de aspect
      urlObj.searchParams.set('w', width.toString());
      urlObj.searchParams.set('h', height.toString());
    }

    // Adăugăm parametrul auto pentru optimizări automate
    urlObj.searchParams.set('auto', 'compress,format');

    return urlObj.toString();
  } catch (error) {
    // Removed console statement
    return url;
  }
}

/**
 * Optimizează un URL de imagine pentru orice sursă
 * @param url URL-ul imaginii
 * @param size Dimensiunea dorită
 * @param quality Calitatea imaginii (0-100)
 */
export function optimizeImageUrl(
  url: string,
  size: ImageSize = ImageSize.MEDIUM,
  quality: number = DEFAULT_QUALITY
): string {
  if (!url) {
    return '';
  }

  try {
    // Verificăm tipul de URL și aplicăm optimizarea corespunzătoare
    if (url.includes('cloudinary.com')) {
      return optimizeCloudinaryUrl(url, size, quality);
    } else if (url.includes('imgix.net')) {
      return optimizeImgixUrl(url, size, quality);
    }

    // Pentru alte surse, returnăm URL-ul original
    return url;
  } catch (error) {
    // Removed console statement
    return url;
  }
}

/**
 * Preîncarcă o imagine
 * @param url URL-ul imaginii
 */
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload image: ${url}`));
    img.src = url;
  });
}

/**
 * Preîncarcă mai multe imagini
 * @param urls Lista de URL-uri de imagini
 */
export function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(urls.map(url => preloadImage(url)));
}

/**
 * Verifică dacă o imagine este în cache-ul browserului
 * @param url URL-ul imaginii
 */
export function isImageCached(url: string): boolean {
  // Verificăm dacă imaginea este în cache-ul browserului
  const img = new Image();
  img.src = url;
  return img.complete;
}

// Exportăm toate funcțiile într-un singur obiect
export const imageOptimizer = {
  optimizeImageUrl,
  optimizeCloudinaryUrl,
  optimizeImgixUrl,
  preloadImage,
  preloadImages,
  isImageCached,
  ImageSize
};
