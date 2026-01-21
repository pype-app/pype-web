'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface ComponentConfigModalProps {
  type: 'source' | 'transformer' | 'destination';
  editingComponent: any;
  onSave: (component: any) => void;
  onCancel: () => void;
}

const ComponentConfigModal: React.FC<ComponentConfigModalProps> = ({
  type,
  editingComponent,
  onSave,
  onCancel,
}) => {
  const [localComponent, setLocalComponent] = useState<any>(null);
  const [configJson, setConfigJson] = useState<string>('');

  // Mapear tipo para componentType
  const componentType = type === 'transformer' ? 'transform' : 
                       type === 'destination' ? 'sink' : 'source';

  useEffect(() => {
    if (editingComponent) {
      setLocalComponent({ ...editingComponent });
      
      // Extrair configuração baseada no tipo do PipelineSpec
      let config = {};
      if (componentType === 'source' && editingComponent.params) {
        config = editingComponent.params;
      } else if (componentType === 'transform' && editingComponent.map) {
        config = editingComponent.map;
      } else if (componentType === 'sink' && editingComponent.options) {
        config = editingComponent.options;
      } else if (editingComponent.config) {
        // Fallback para estrutura antiga
        config = editingComponent.config;
      }
      
      setConfigJson(JSON.stringify(config, null, 2));
    } else {
      setLocalComponent({
        name: '',
        type: '',
        params: {},
        map: {},
        options: {},
        config: {}
      });
      setConfigJson('{}');
    }
  }, [editingComponent, componentType]);

  const handleSave = () => {
    try {
      if (!localComponent?.name?.trim()) {
        toast.error('Name is required');
        return;
      }

      if (!localComponent?.type) {
        toast.error('Tipo de conector é obrigatório');
        return;
      }

      // Parse e aplicar configuração baseada no tipo do PipelineSpec
      const parsedConfig = JSON.parse(configJson);
      const updatedComponent = { ...localComponent };

      if (componentType === 'source') {
        updatedComponent.params = parsedConfig;
      } else if (componentType === 'transform') {
        updatedComponent.map = parsedConfig;
      } else if (componentType === 'sink') {
        updatedComponent.options = parsedConfig;
      }

      onSave(updatedComponent);
      onCancel();
      toast.success('Componente salvo com sucesso');
    } catch (error) {
      toast.error('Erro no formato JSON da configuração');
    }
  };

  const getTypeOptions = () => {
    // Mock de conectores disponíveis - em uma implementação real, seria obtido via props ou API
    const mockConnectors = [
      { type: 'source', className: 'Pype.Connectors.Http.HttpJsonGetSourceConnector', displayName: 'HTTP JSON Get' },
      { type: 'source', className: 'Pype.Connectors.Sankhya.SankhyaSbrSourceConnector', displayName: 'Sankhya SBR Source' },
      { type: 'transform', className: 'Pype.Shared.MapTransformer', displayName: 'Map Transformer' },
      { type: 'sink', className: 'Pype.Connectors.Http.HttpJsonPostSinkConnector', displayName: 'HTTP JSON Post' },
      { type: 'sink', className: 'Pype.Connectors.Sankhya.SankhyaSbrSinkConnector', displayName: 'Sankhya SBR Sink' }
    ];
    
    return mockConnectors
      .filter((conn: any) => {
        if (componentType === 'source') return conn.type === 'source';
        if (componentType === 'transform') return conn.type === 'transform';
        if (componentType === 'sink') return conn.type === 'sink';
        return false;
      })
      .map((conn: any) => ({
        value: conn.className,
        label: conn.displayName || conn.className
      }));
  };

  const getConfigExample = () => {
    if (!localComponent?.type) return '{}';
    
    const examples: Record<string, any> = {
      'Pype.Connectors.Http.HttpJsonGetSourceConnector': {
        url: 'https://api.example.com/data',
        itemPath: '$.items[*]',
        idPath: '$.id'
      },
      'Pype.Connectors.Sankhya.SankhyaSbrSourceConnector': {
        service: 'CrudService',
        entity: 'Usuario',
        criteria: {}
      },
      'Pype.Shared.MapTransformer': {
        'outputField1': 'inputField1',
        'outputField2': 'inputField2'
      },
      'Pype.Connectors.Http.HttpJsonPostSinkConnector': {
        url: 'https://api.example.com/save',
        batchSize: 100
      },
      'Pype.Connectors.Sankhya.SankhyaSbrSinkConnector': {
        service: 'CrudService',
        entity: 'Usuario'
      }
    };

    return JSON.stringify(examples[localComponent.type] || {}, null, 2);
  };

  if (!localComponent) return null;

  return (
    <div className="space-y-6">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Name
        </label>
        <input
          type="text"
          value={localComponent.name}
          onChange={(e) => setLocalComponent({ ...localComponent, name: e.target.value })}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Component name"
        />
      </div>

      {/* Tipo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tipo de Conector
        </label>
        <select
          value={localComponent.type}
          onChange={(e) => setLocalComponent({ ...localComponent, type: e.target.value })}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="">Selecione um conector</option>
          {getTypeOptions().map((option: any) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Configuração */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Configuração (JSON)
          </label>
          <textarea
            value={configJson}
            onChange={(e) => setConfigJson(e.target.value)}
            className="w-full h-64 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm dark:bg-gray-700 dark:text-white"
            placeholder="Configuração em formato JSON"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Exemplo de Configuração
          </label>
          <pre className="w-full h-64 border border-gray-200 dark:border-gray-600 rounded-md px-3 py-2 bg-gray-50 dark:bg-gray-800 overflow-auto font-mono text-sm text-gray-700 dark:text-gray-300">
            {getConfigExample()}
          </pre>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
        >
          Salvar
        </button>
      </div>
    </div>
  );
};

export default ComponentConfigModal;
