import apiClient from '@/lib/api-client';

export interface FileUploadResponse {
  filename: string;
  size: number;
  content: string;
}

class FileService {
  /**
   * Upload de arquivo YAML para criação de pipeline
   */
  async uploadYamlFile(file: File): Promise<FileUploadResponse> {
    return await apiClient.upload<FileUploadResponse>('/api/files/upload', file);
  }

  /**
   * Validar conteúdo YAML
   */
  async validateYaml(content: string): Promise<{ isValid: boolean; errors?: string[] }> {
    return await apiClient.post('/api/files/validate-yaml', { content });
  }

  /**
   * Obter template de pipeline YAML
   */
  async getPipelineTemplate(type: 'basic' | 'advanced' | 'connector'): Promise<string> {
    const response = await apiClient.get<{ template: string }>(`/api/files/templates/${type}`);
    return response.template;
  }

  /**
   * Converter arquivo para texto
   */
  async readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('File reading error'));
      reader.readAsText(file);
    });
  }
}

export const fileService = new FileService();
export default fileService;