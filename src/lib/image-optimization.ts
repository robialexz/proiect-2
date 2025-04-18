/**
 * Opțiuni pentru optimizarea imaginilor
 */
interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
  blur?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

/**
 * Optimizează o imagine folosind parametri de URL
 * @param src URL-ul imaginii
 * @param options Opțiuni pentru optimizare
 * @returns URL-ul optimizat
 */
export function optimizeImage(src: string, options: ImageOptimizationOptions = {}): string {
  // Verificăm dacă URL-ul este valid
  if (!src || typeof src !== 'string') {
    return src;
  }
  
  // Verificăm dacă URL-ul este extern
  if (src.startsWith('http') || src.startsWith('//')) {
    // Pentru imagini externe, folosim un serviciu de optimizare
    // În acest caz, folosim Imgproxy ca exemplu
    try {
      const url = new URL('https://imgproxy.yourdomain.com/');
      
      // Adăugăm parametrii de optimizare
      if (options.width) url.searchParams.append('width', options.width.toString());
      if (options.height) url.searchParams.append('height', options.height.toString());
      if (options.quality) url.searchParams.append('quality', options.quality.toString());
      if (options.format) url.searchParams.append('format', options.format);
      if (options.blur) url.searchParams.append('blur', options.blur.toString());
      if (options.fit) url.searchParams.append('fit', options.fit);
      
      // Adăugăm URL-ul original
      url.searchParams.append('url', encodeURIComponent(src));
      
      return url.toString();
    } catch (error) {
      console.error('Error optimizing image:', error);
      return src;
    }
  }
  
  // Pentru imagini locale, folosim parametri de URL
  try {
    const url = new URL(src, window.location.origin);
    
    // Adăugăm parametrii de optimizare
    if (options.width) url.searchParams.append('w', options.width.toString());
    if (options.height) url.searchParams.append('h', options.height.toString());
    if (options.quality) url.searchParams.append('q', options.quality.toString());
    if (options.format) url.searchParams.append('fm', options.format);
    if (options.blur) url.searchParams.append('blur', options.blur.toString());
    if (options.fit) url.searchParams.append('fit', options.fit);
    
    return url.toString();
  } catch (error) {
    console.error('Error optimizing image:', error);
    return src;
  }
}

/**
 * Generează un placeholder blur pentru o imagine
 * @param src URL-ul imaginii
 * @param size Dimensiunea placeholderului
 * @returns URL-ul placeholderului
 */
export function generateBlurPlaceholder(src: string, size: number = 10): string {
  return optimizeImage(src, {
    width: size,
    height: size,
    quality: 30,
    blur: 5
  });
}

/**
 * Preîncarcă o imagine
 * @param src URL-ul imaginii
 * @returns Promise care se rezolvă când imaginea este încărcată
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Verifică dacă o imagine este încărcată din cache
 * @param src URL-ul imaginii
 * @returns True dacă imaginea este încărcată din cache, false în caz contrar
 */
export function isImageCached(src: string): boolean {
  const img = new Image();
  img.src = src;
  return img.complete;
}

/**
 * Convertește o imagine în format Base64
 * @param file Fișierul de imagine
 * @returns Promise care se rezolvă cu imaginea în format Base64
 */
export function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * Redimensionează o imagine înainte de încărcare
 * @param file Fișierul de imagine
 * @param maxWidth Lățimea maximă
 * @param maxHeight Înălțimea maximă
 * @param quality Calitatea imaginii (0-1)
 * @returns Promise care se rezolvă cu fișierul redimensionat
 */
export function resizeImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    // Creăm un URL pentru fișier
    const url = URL.createObjectURL(file);
    
    // Creăm o imagine
    const img = new Image();
    img.src = url;
    
    img.onload = () => {
      // Eliberăm URL-ul
      URL.revokeObjectURL(url);
      
      // Calculăm dimensiunile
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = Math.round(height * (maxWidth / width));
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = Math.round(width * (maxHeight / height));
        height = maxHeight;
      }
      
      // Creăm un canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      // Desenăm imaginea pe canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convertim canvas-ul în blob
      canvas.toBlob(
        blob => {
          if (!blob) {
            reject(new Error('Could not create blob'));
            return;
          }
          
          // Creăm un nou fișier
          const resizedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: file.lastModified
          });
          
          resolve(resizedFile);
        },
        file.type,
        quality
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not load image'));
    };
  });
}

export default {
  optimizeImage,
  generateBlurPlaceholder,
  preloadImage,
  isImageCached,
  imageToBase64,
  resizeImage
};
