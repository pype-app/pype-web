/**
 * Comprime uma imagem para um tamanho máximo
 * @param file - Arquivo de imagem
 * @param maxWidth - Largura máxima (padrão: 200px)
 * @param maxHeight - Altura máxima (padrão: 200px)
 * @param quality - Qualidade da compressão (0-1, padrão: 0.8)
 * @returns Promise com a imagem comprimida em base64
 */
export async function compressImage(
  file: File,
  maxWidth: number = 200,
  maxHeight: number = 200,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calcular novas dimensões mantendo aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = height * (maxWidth / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = width * (maxHeight / height);
            height = maxHeight;
          }
        }
        
        // Criar canvas e redimensionar
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Desenhar imagem redimensionada
        ctx.drawImage(img, 0, 0, width, height);
        
        // Converter para base64
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Valida o tamanho de uma string base64
 * @param base64 - String base64
 * @param maxSizeKB - Tamanho máximo em KB
 * @returns true se válido, false caso contrário
 */
export function validateBase64Size(base64: string, maxSizeKB: number): boolean {
  // Remove o prefixo data:image/...;base64,
  const base64String = base64.split(',')[1] || base64;
  
  // Calcular tamanho em bytes
  const sizeInBytes = (base64String.length * 3) / 4;
  const sizeInKB = sizeInBytes / 1024;
  
  return sizeInKB <= maxSizeKB;
}
