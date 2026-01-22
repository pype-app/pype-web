'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import * as yaml from 'js-yaml';
import { toast } from 'react-hot-toast';
import FileUpload from '@/components/editor/FileUpload';
import ValidationResults from '@/components/editor/ValidationResults';
import { EditorSkeleton } from '@/components/ui/skeletons';
import { PIPELINE_TEMPLATES, TemplateType, ROUTES } from '@/constants';
import { pipelineService } from '@/services/pipelineService';
import { CreatePipelineRequest } from '@/types';
import { DocumentIcon, CodeBracketIcon, PlayIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { DryRunManager } from '@/components/pipelines/DryRunManager';

// Lazy load Monaco Editor (reduces initial bundle by ~2MB)
const YamlEditor = lazy(() => import('@/components/editor/YamlEditor'));

interface PipelineEditorProps {
  pipelineId?: string; // Para modo de edição
}

export default function PipelineEditor({ pipelineId }: PipelineEditorProps) {
  const router = useRouter();
  const [yamlContent, setYamlContent] = useState('');
  const [isValidYaml, setIsValidYaml] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [pipelineName, setPipelineName] = useState('Unnamed Pipeline');

  const isEditMode = !!pipelineId;

  // Carregar pipeline para edição
  useEffect(() => {
    if (isEditMode && pipelineId) {
      loadPipeline(pipelineId);
    } else {
      // Modo criação - usar template básico
      setYamlContent(PIPELINE_TEMPLATES.basic);
    }
  }, [isEditMode, pipelineId]);

  const loadPipeline = async (id: string) => {
    try {
      setIsLoading(true);
      const pipeline = await pipelineService.getPipeline(id);

      // Carregar apenas o YAML - informações básicas serão extraídas do YAML
      setYamlContent(pipeline.yamlDefinition);
      setPipelineName(pipeline.name);
    } catch (error) {
      console.error('Erro ao carregar pipeline:', error);
      toast.error('Erro ao carregar pipeline');
      router.push(ROUTES.PIPELINES);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = (template: TemplateType) => {
    setSelectedTemplate(template);
    setYamlContent(PIPELINE_TEMPLATES[template]);
    setUploadedFileName(null);
  };

  const handleFileUpload = (content: string, filename: string) => {
    setYamlContent(content);
    setUploadedFileName(filename);
    setSelectedTemplate('');
  };

  const handleValidationChange = (isValid: boolean, errors: string[]) => {
    setIsValidYaml(isValid);
    setValidationErrors(errors);
  };

  // Extrair dados do YAML para criar/atualizar pipeline
  const extractDataFromYaml = () => {
    try {
      const parsedYaml = yaml.load(yamlContent) as any;

      return {
        name: parsedYaml.name || parsedYaml.pipeline || 'Unnamed Pipeline',
        description: parsedYaml.description || '',
        yamlDefinition: yamlContent,
        isActive: parsedYaml.enabled !== false, // Default true, false apenas se explicitamente false
        cronExpression: parsedYaml.schedule || undefined,
        tags: parsedYaml.tags || undefined,
      };
    } catch (error) {
      throw new Error('Erro ao processar YAML: ' + error);
    }
  };

  const handleSave = async () => {
    if (!isValidYaml) {
      toast.error('Por favor, corrija os erros de validação antes de salvar.');
      return;
    }

    if (!yamlContent.trim()) {
      toast.error('O conteúdo YAML é obrigatório.');
      return;
    }

    // Validar se não há strings "[object Object]" no YAML
    if (yamlContent.includes('[object Object]')) {
      toast.error('Erro no YAML: Objetos não serializados corretamente. Tente recriar o pipeline ou editar manualmente o YAML.');
      return;
    }

    setIsSaving(true);

    try {
      const pipelineData: CreatePipelineRequest = extractDataFromYaml();

      console.log('📤 Enviando dados do pipeline:', pipelineData);
      console.log('🔧 YAML sendo enviado:', yamlContent.substring(0, 500) + '...');

      if (isEditMode && pipelineId) {
        await pipelineService.updatePipeline(pipelineId, pipelineData);
        toast.success('Pipeline atualizado com sucesso!');
      } else {
        await pipelineService.createPipeline(pipelineData);
        toast.success('Pipeline criado com sucesso!');
      }

      router.push(ROUTES.PIPELINES);
    } catch (error: any) {
      console.error('Erro ao salvar pipeline:', error);

      let errorMessage = 'Erro desconhecido';

      if (error.response) {
        // Erro da API com resposta
        const status = error.response.status;
        const data = error.response.data;

        if (status === 400) {
          // Bad Request - dados inválidos
          if (data.errors && Array.isArray(data.errors)) {
            errorMessage = `Dados inválidos:\n${data.errors.join('\n')}`;
          } else if (data.error) {
            errorMessage = `Dados inválidos: ${data.error}`;
          } else if (data.message) {
            errorMessage = `Dados inválidos: ${data.message}`;
          } else {
            errorMessage = 'Dados enviados são inválidos. Verifique o YAML e os campos obrigatórios.';
          }
        } else if (status === 401) {
          errorMessage = 'Não autorizado. Faça login novamente.';
        } else if (status === 403) {
          errorMessage = 'Acesso negado para esta operação.';
        } else if (status === 500) {
          errorMessage = 'Erro interno do servidor. Tente novamente.';
        } else {
          errorMessage = `Erro ${status}: ${data.error || data.message || 'Erro no servidor'}`;
        }
      } else if (error.request) {
        // Erro de rede
        errorMessage = 'Erro de conexão. Verifique sua internet e se o servidor está rodando.';
      } else {
        // Outro tipo de erro
        errorMessage = error.message || 'Erro desconhecido';
      }

      toast.error(`Erro ao salvar pipeline: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestRun = async () => {
    if (!isEditMode || !pipelineId) {
      toast.error('Pipeline deve ser salvo antes de executar um teste.');
      return;
    }

    try {
      await pipelineService.runPipeline(pipelineId);
      toast.success('Execução de teste iniciada! Verifique o status na lista de pipelines.');
    } catch (error: any) {
      console.error('Erro ao executar pipeline:', error);
      toast.error(`Erro ao executar pipeline: ${error.message || 'Erro desconhecido'}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
        <span className="ml-2 text-primary">Carregando pipeline...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push(ROUTES.PIPELINES)}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-primary">
              {isEditMode ? 'Edit Pipeline' : 'New Pipeline'}
            </h1>
            <p className="text-sm text-muted">
              {isEditMode ? 'Modify pipeline settings' : 'Create a new YAML pipeline'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {isEditMode && pipelineId && (
            <DryRunManager
              pipelineId={pipelineId}
              pipelineName={pipelineName}
              disabled={!isValidYaml}
              yamlContent={yamlContent}
            />
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Editor YAML */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-primary">
              YAML Definition
            </h2>

            {/* Status do YAML */}
            <div className="justify-end">
              <div className="text-sm text-muted">
                {isValidYaml ? '✅ Valid YAML' : '❌ YAML with errors'}
              </div>
            </div>

            {/* <div className="flex items-center space-x-2">
              <CodeBracketIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              {uploadedFileName && (
                <span className="text-sm text-muted">
                  Arquivo: {uploadedFileName}
                </span>
              )}
            </div> */}
          </div>

          <div className="card-body">
            {/* Templates e Upload */}
            {/* <div className="mb-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Templates or Upload
                </label>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {Object.keys(PIPELINE_TEMPLATES).map((template) => (
                    <button
                      key={template}
                      type="button"
                      onClick={() => handleTemplateSelect(template as TemplateType)}
                      className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                        selectedTemplate === template
                          ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                          : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-secondary hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      {template.charAt(0).toUpperCase() + template.slice(1)}
                    </button>
                  ))}
                </div>

                <FileUpload onFileContent={handleFileUpload} />
              </div>
            </div> */}

            {/* Editor with Lazy Loading */}
            <Suspense fallback={<EditorSkeleton height="500px" />}>
              <YamlEditor
                value={yamlContent}
                onChange={(newValue) => {
                  setYamlContent(newValue);
                }}
                height="500px"
                onValidationChange={handleValidationChange}
              />
            </Suspense>

            {/* Validação */}
            <div className="mt-4">
              <ValidationResults
                isValid={isValidYaml}
                errors={validationErrors}
              />
            </div>

          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.push(ROUTES.PIPELINES)}
            className="btn-secondary"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!isValidYaml || isSaving}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : isEditMode ? 'Update' : 'Create Pipeline'}
          </button>
        </div>
      </div>

    </div>
  );
}