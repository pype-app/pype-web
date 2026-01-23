'use client';

import { useState } from 'react';
import { PlusIcon, TrashIcon, CogIcon } from '@heroicons/react/24/outline';

export interface DataTransformer {
  id: string;
  name: string;
  type: 'map' | 'filter' | 'aggregate' | 'script' | 'validate' | 'sort';
  config: Record<string, any>;
}

interface DataTransformerConfigProps {
  transformers: DataTransformer[];
  onChange: (transformers: DataTransformer[]) => void;
}

const TRANSFORMER_TYPES = [
  { value: 'map', label: 'Map Fields', description: 'Transform and map data fields' },
  { value: 'filter', label: 'Filter Data', description: 'Filter records based on conditions' },
  { value: 'aggregate', label: 'Aggregate', description: 'Group and aggregate data' },
  { value: 'script', label: 'Custom Script', description: 'Execute custom transformation code' },
  { value: 'validate', label: 'Validate', description: 'Validate data quality' },
  { value: 'sort', label: 'Sort', description: 'Sort records by fields' },
];

export default function DataTransformerConfig({ transformers, onChange }: DataTransformerConfigProps) {
  const [selectedType, setSelectedType] = useState<DataTransformer['type'] | ''>('');

  const addTransformer = () => {
    if (!selectedType) return;

    const newTransformer: DataTransformer = {
      id: `transformer_${Date.now()}`,
      name: `${selectedType} transformer`,
      type: selectedType,
      config: getDefaultConfig(selectedType),
    };

    onChange([...transformers, newTransformer]);
    setSelectedType('');
  };

  const updateTransformer = (id: string, field: keyof DataTransformer, value: any) => {
    onChange(transformers.map(transformer => 
      transformer.id === id ? { ...transformer, [field]: value } : transformer
    ));
  };

  const removeTransformer = (id: string) => {
    onChange(transformers.filter(transformer => transformer.id !== id));
  };

  const getDefaultConfig = (type: DataTransformer['type']): Record<string, any> => {
    switch (type) {
      case 'map':
        return {
          mapping: {
            id: 'source_id',
            name: 'source_name',
            email: 'source_email'
          }
        };
      case 'filter':
        return {
          conditions: [
            {
              field: 'status',
              operator: 'equals',
              value: 'active'
            }
          ]
        };
      case 'aggregate':
        return {
          groupBy: ['category'],
          aggregations: {
            total: { function: 'sum', field: 'amount' },
            count: { function: 'count', field: '*' }
          }
        };
      case 'script':
        return {
          language: 'python',
          code: `def transform(data):
    # Transform your data here
    return data`
        };
      case 'validate':
        return {
          rules: [
            {
              field: 'email',
              type: 'email',
              required: true
            }
          ]
        };
      case 'sort':
        return {
          fields: [
            { field: 'created_at', direction: 'desc' }
          ]
        };
      default:
        return {};
    }
  };

  const renderConfigFields = (transformer: DataTransformer) => {
    switch (transformer.type) {
      case 'map':
        return (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">Field Mapping</label>
            <div className="space-y-1">
              {Object.entries(transformer.config.mapping || {}).map(([target, source], index) => (
                <div key={index} className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={target}
                    onChange={(e) => {
                      const newMapping = { ...transformer.config.mapping };
                      delete newMapping[target];
                      newMapping[e.target.value] = source;
                      updateTransformer(transformer.id, 'config', { ...transformer.config, mapping: newMapping });
                    }}
                    className="text-xs border border-gray-300 rounded px-2 py-1"
                    placeholder="Target field"
                  />
                  <input
                    type="text"
                    value={source as string}
                    onChange={(e) => {
                      const newMapping = { ...transformer.config.mapping };
                      newMapping[target] = e.target.value;
                      updateTransformer(transformer.id, 'config', { ...transformer.config, mapping: newMapping });
                    }}
                    className="text-xs border border-gray-300 rounded px-2 py-1"
                    placeholder="Source field"
                  />
                </div>
              ))}
              <button
                onClick={() => {
                  const newMapping = { ...transformer.config.mapping, '': '' };
                  updateTransformer(transformer.id, 'config', { ...transformer.config, mapping: newMapping });
                }}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                + Add mapping
              </button>
            </div>
          </div>
        );

      case 'filter':
        return (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">Filter Conditions</label>
            <div className="space-y-1">
              {(transformer.config.conditions || []).map((condition: any, index: number) => (
                <div key={index} className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={condition.field}
                    onChange={(e) => {
                      const newConditions = [...transformer.config.conditions];
                      newConditions[index] = { ...condition, field: e.target.value };
                      updateTransformer(transformer.id, 'config', { ...transformer.config, conditions: newConditions });
                    }}
                    className="text-xs border border-gray-300 rounded px-2 py-1"
                    placeholder="Field"
                  />
                  <select
                    value={condition.operator}
                    onChange={(e) => {
                      const newConditions = [...transformer.config.conditions];
                      newConditions[index] = { ...condition, operator: e.target.value };
                      updateTransformer(transformer.id, 'config', { ...transformer.config, conditions: newConditions });
                    }}
                    className="text-xs border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="equals">Equals</option>
                    <option value="not_equals">Not Equals</option>
                    <option value="contains">Contains</option>
                    <option value="greater_than">Greater Than</option>
                    <option value="less_than">Less Than</option>
                  </select>
                  <input
                    type="text"
                    value={condition.value}
                    onChange={(e) => {
                      const newConditions = [...transformer.config.conditions];
                      newConditions[index] = { ...condition, value: e.target.value };
                      updateTransformer(transformer.id, 'config', { ...transformer.config, conditions: newConditions });
                    }}
                    className="text-xs border border-gray-300 rounded px-2 py-1"
                    placeholder="Value"
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 'script':
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Language</label>
                <select
                  value={transformer.config.language || 'python'}
                  onChange={(e) => updateTransformer(transformer.id, 'config', { ...transformer.config, language: e.target.value })}
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="sql">SQL</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Code</label>
              <textarea
                value={transformer.config.code || ''}
                onChange={(e) => updateTransformer(transformer.id, 'config', { ...transformer.config, code: e.target.value })}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1 font-mono"
                rows={6}
                placeholder="def transform(data):\n    # Your code here\n    return data"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-xs text-gray-500">
            Configuração específica para {transformer.type}
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Data Transformers</h3>
        <span className="text-xs text-gray-500">Define how to transform and process your data</span>
      </div>

      {/* Lista de transformers */}
      <div className="space-y-3">
        {transformers.map((transformer) => (
          <div key={transformer.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <CogIcon className="h-4 w-4 text-green-500" />
                <input
                  type="text"
                  value={transformer.name}
                  onChange={(e) => updateTransformer(transformer.id, 'name', e.target.value)}
                  className="text-sm font-medium bg-transparent border-none p-0 focus:ring-0"
                />
              </div>
              <button
                onClick={() => removeTransformer(transformer.id)}
                className="text-red-500 hover:text-red-700"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
            
            <div className="text-xs text-gray-600 mb-2">
              Type: {TRANSFORMER_TYPES.find(t => t.value === transformer.type)?.label}
            </div>
            
            {renderConfigFields(transformer)}
          </div>
        ))}
      </div>

      {/* Add new transformer */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as DataTransformer['type'])}
            className="flex-1 text-sm border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Select transformer type...</option>
            {TRANSFORMER_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label} - {type.description}
              </option>
            ))}
          </select>
          
          <button
            onClick={addTransformer}
            disabled={!selectedType}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Transformer
          </button>
        </div>
      </div>
    </div>
  );
}