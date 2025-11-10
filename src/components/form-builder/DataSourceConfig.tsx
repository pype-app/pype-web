'use client';

import { useState } from 'react';
import { PlusIcon, TrashIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export interface DataSource {
  id: string;
  name: string;
  type: 'http-source' | 'database-source' | 'file-source' | 'sap-b1-source' | 'sankhya-source' | 'apdata-source';
  config: Record<string, any>;
}

interface DataSourceConfigProps {
  sources: DataSource[];
  onChange: (sources: DataSource[]) => void;
}

const SOURCE_TYPES = [
  { value: 'http-source', label: 'HTTP API', description: 'Conectar a APIs REST' },
  { value: 'database-source', label: 'Database', description: 'Conectar a bancos de dados' },
  { value: 'file-source', label: 'File', description: 'Ler arquivos (CSV, JSON, XML)' },
  { value: 'sap-b1-source', label: 'SAP Business One', description: 'Conectar ao SAP B1' },
  { value: 'sankhya-source', label: 'Sankhya', description: 'Conectar ao ERP Sankhya' },
  { value: 'apdata-source', label: 'Apdata', description: 'Conectar ao sistema Apdata' },
];

export default function DataSourceConfig({ sources, onChange }: DataSourceConfigProps) {
  const [selectedType, setSelectedType] = useState<DataSource['type'] | ''>('');

  const addSource = () => {
    if (!selectedType) return;

    const newSource: DataSource = {
      id: `source_${Date.now()}`,
      name: `${selectedType.replace('-source', '')} source`,
      type: selectedType,
      config: getDefaultConfig(selectedType),
    };

    onChange([...sources, newSource]);
    setSelectedType('');
  };

  const updateSource = (id: string, field: keyof DataSource, value: any) => {
    onChange(sources.map(source => 
      source.id === id ? { ...source, [field]: value } : source
    ));
  };

  const removeSource = (id: string) => {
    onChange(sources.filter(source => source.id !== id));
  };

  const getDefaultConfig = (type: DataSource['type']): Record<string, any> => {
    switch (type) {
      case 'http-source':
        return {
          url: 'https://api.exemplo.com/dados',
          method: 'GET',
          headers: {},
          format: 'json'
        };
      case 'database-source':
        return {
          connection: '{{ env.DATABASE_URL }}',
          query: 'SELECT * FROM tabela',
          parameters: []
        };
      case 'file-source':
        return {
          path: '/path/to/file.csv',
          format: 'csv',
          delimiter: ',',
          headers: true
        };
      case 'sap-b1-source':
        return {
          server: '{{ env.SAP_SERVER }}',
          database: '{{ env.SAP_DATABASE }}',
          username: '{{ secrets.SAP_USER }}',
          password: '{{ secrets.SAP_PASSWORD }}',
          query: 'SELECT * FROM OCRD'
        };
      case 'sankhya-source':
        return {
          server: '{{ env.SANKHYA_SERVER }}',
          username: '{{ secrets.SANKHYA_USER }}',
          password: '{{ secrets.SANKHYA_PASSWORD }}',
          service: 'CrudServiceProvider.loadRecords',
          entity: 'Parceiro'
        };
      case 'apdata-source':
        return {
          server: '{{ env.APDATA_SERVER }}',
          database: '{{ env.APDATA_DATABASE }}',
          username: '{{ secrets.APDATA_USER }}',
          password: '{{ secrets.APDATA_PASSWORD }}',
          query: 'SELECT * FROM vw_dados'
        };
      default:
        return {};
    }
  };

  const renderConfigFields = (source: DataSource) => {
    switch (source.type) {
      case 'http-source':
        return (
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">URL</label>
              <input
                type="text"
                value={source.config.url || ''}
                onChange={(e) => updateSource(source.id, 'config', { ...source.config, url: e.target.value })}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                placeholder="https://api.exemplo.com/dados"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Method</label>
                <select
                  value={source.config.method || 'GET'}
                  onChange={(e) => updateSource(source.id, 'config', { ...source.config, method: e.target.value })}
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Format</label>
                <select
                  value={source.config.format || 'json'}
                  onChange={(e) => updateSource(source.id, 'config', { ...source.config, format: e.target.value })}
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                >
                  <option value="json">JSON</option>
                  <option value="xml">XML</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'database-source':
        return (
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Connection String</label>
              <input
                type="text"
                value={source.config.connection || ''}
                onChange={(e) => updateSource(source.id, 'config', { ...source.config, connection: e.target.value })}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                placeholder="{{ env.DATABASE_URL }}"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">SQL Query</label>
              <textarea
                value={source.config.query || ''}
                onChange={(e) => updateSource(source.id, 'config', { ...source.config, query: e.target.value })}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                rows={3}
                placeholder="SELECT * FROM tabela"
              />
            </div>
          </div>
        );

      case 'sap-b1-source':
        return (
          <div className="grid grid-cols-1 gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Server</label>
                <input
                  type="text"
                  value={source.config.server || ''}
                  onChange={(e) => updateSource(source.id, 'config', { ...source.config, server: e.target.value })}
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                  placeholder="{{ env.SAP_SERVER }}"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Database</label>
                <input
                  type="text"
                  value={source.config.database || ''}
                  onChange={(e) => updateSource(source.id, 'config', { ...source.config, database: e.target.value })}
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                  placeholder="{{ env.SAP_DATABASE }}"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Query</label>
              <textarea
                value={source.config.query || ''}
                onChange={(e) => updateSource(source.id, 'config', { ...source.config, query: e.target.value })}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                rows={3}
                placeholder="SELECT * FROM OCRD"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-xs text-gray-500">
            Configuração específica para {source.type}
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Data Sources</h3>
        <span className="text-xs text-gray-500">Configure where your pipeline will read data from</span>
      </div>

      {/* Lista de sources */}
      <div className="space-y-3">
        {sources.map((source) => (
          <div key={source.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <DocumentTextIcon className="h-4 w-4 text-blue-500" />
                <input
                  type="text"
                  value={source.name}
                  onChange={(e) => updateSource(source.id, 'name', e.target.value)}
                  className="text-sm font-medium bg-transparent border-none p-0 focus:ring-0"
                />
              </div>
              <button
                onClick={() => removeSource(source.id)}
                className="text-red-500 hover:text-red-700"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
            
            <div className="text-xs text-gray-600 mb-2">
              Type: {SOURCE_TYPES.find(t => t.value === source.type)?.label}
            </div>
            
            {renderConfigFields(source)}
          </div>
        ))}
      </div>

      {/* Add new source */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as DataSource['type'])}
            className="flex-1 text-sm border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Select source type...</option>
            {SOURCE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label} - {type.description}
              </option>
            ))}
          </select>
          
          <button
            onClick={addSource}
            disabled={!selectedType}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Source
          </button>
        </div>
      </div>
    </div>
  );
}