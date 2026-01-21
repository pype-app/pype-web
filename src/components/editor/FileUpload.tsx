'use client';

import { useState } from 'react';
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { fileService } from '@/services/fileService';

interface FileUploadProps {
  onFileContent: (content: string, filename: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

export default function FileUpload({
  onFileContent,
  accept = '.yml,.yaml',
  maxSize = 5,
  className = '',
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ['.yml', '.yaml'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      setUploadError('Apenas arquivos YAML (.yml, .yaml) são permitidos');
      return;
    }

    // Validar tamanho
    if (file.size > maxSize * 1024 * 1024) {
      setUploadError(`Arquivo muito grande. Tamanho máximo: ${maxSize}MB`);
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const content = await fileService.readFileAsText(file);
      onFileContent(content, file.name);
    } catch (error) {
      setUploadError('Erro ao ler o arquivo. Verifique se é um arquivo válido.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isDragOver
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <input
          id="file-upload"
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="flex flex-col items-center">
          {isUploading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          ) : (
            <CloudArrowUpIcon className="h-8 w-8 text-gray-400 mb-4" />
          )}
          
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            {isUploading ? 'Loading file...' : 'Upload YAML file'}
          </h3>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Drag and drop or click to select
          </p>
          
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Accepted formats: .yml, .yaml (max. {maxSize}MB)
          </p>
        </div>
      </div>

      {uploadError && (
        <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <div className="flex">
            <XMarkIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-400">
                {uploadError}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}