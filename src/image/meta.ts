import { rgbaToThumbHash, thumbHashToDataURL } from 'thumbhash';

function getImageData(image: HTMLImageElement) {
  const canvas = document.createElement('canvas');
  const scale = 100 / Math.max(image.width, image.height);
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  const context = canvas.getContext('2d');
  context?.drawImage(image, 0, 0, canvas.width, canvas.height);
  return context?.getImageData(0, 0, canvas.width, canvas.height);
}

function generateBlurDataURL(image: HTMLImageElement) {
  const imageData = getImageData(image);
  if (!imageData) return undefined;
  const binary = rgbaToThumbHash(imageData.width, imageData.height, imageData.data);
  return thumbHashToDataURL(binary);
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.readAsDataURL(file);
    fr.onload = function () {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = (...args) => reject(args);
      img.src = this.result as string;
    };
    fr.onerror = (...args) => reject(args);
  });
}

export interface ImageMeta {
  width: number;
  height: number;
  blurDataURL?: string;
}

export async function generateImageMetadata(file: File): Promise<ImageMeta> {
  const image = await loadImage(file);

  return {
    width: image.width,
    height: image.height,
    blurDataURL: generateBlurDataURL(image),
  };
}
