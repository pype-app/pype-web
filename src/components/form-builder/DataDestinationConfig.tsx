'use client';

import { useState } from 'react';
import { PlusIcon, TrashIcon, ServerIcon } from '@heroicons/react/24/outline';

export interface DataDestination {
  id: string;
  name: string;
  type: 'http-sink' | 'database-sink' | 'file-sink' | 'sap-b1-sink' | 'sankhya-sink' | 'webhook';
  config: Record<string, any>;
}

interface DataDestinationConfigProps {
  destinations: DataDestination[];
  onChange: (destinations: DataDestination[]) => void;
}

const DESTINATION_TYPES = [
  { value: 'http-sink', label: 'HTTP API', description: 'Send data to REST APIs' },
  { value: 'database-sink', label: 'Database', description: 'Write to databases' },
  { value: 'file-sink', label: 'File', description: 'Save to files (CSV, JSON, XML)' },
  { value: 'sap-b1-sink', label: 'SAP Business One', description: 'Write to SAP B1' },
  { value: 'sankhya-sink', label: 'Sankhya', description: 'Write to Sankhya ERP' },
  { value: 'webhook', label: 'Webhook', description: 'Send notifications via webhook' },
];

export default function DataDestinationConfig({ destinations, onChange }: DataDestinationConfigProps) {
  const [selectedType, setSelectedType] = useState<DataDestination['type'] | ''>('');

  const addDestination = () => {
    if (!selectedType) return;

    const newDestination: DataDestination = {
      id: `destination_${Date.now()}`,
      name: `${selectedType.replace('-sink', '')} destination`,
      type: selectedType,
      config: getDefaultConfig(selectedType),
    };

    onChange([...destinations, newDestination]);
    setSelectedType('');
  };

  const updateDestination = (id: string, field: keyof DataDestination, value: any) => {
    onChange(destinations.map(destination => 
      destination.id === id ? { ...destination, [field]: value } : destination
    ));
  };

  const removeDestination = (id: string) => {
    onChange(destinations.filter(destination => destination.id !== id));
  };

  const getDefaultConfig = (type: DataDestination['type']): Record<string, any> => {
    switch (type) {
      case 'http-sink':
        return {
          url: 'https://api.destino.com/dados',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          batch_size: 100
        };
      case 'database-sink':
        return {
          connection: '{{ env.DATABASE_URL }}',
          table: 'dados_processados',
          mode: 'insert',
          batch_size: 1000
        };
      case 'file-sink':
        return {
          path: '/output/dados.csv',
          format: 'csv',
          mode: 'overwrite'
        };
      case 'sap-b1-sink':
        return {
          server: '{{ env.SAP_SERVER }}',
          database: '{{ env.SAP_DATABASE }}',
          username: '{{ secrets.SAP_USER }}',
          password: '{{ secrets.SAP_PASSWORD }}',
          table: 'U_CUSTOM_TABLE'
        };
      case 'sankhya-sink':
        return {
          server: '{{ env.SANKHYA_SERVER }}',
          username: '{{ secrets.SANKHYA_USER }}',
          password: '{{ secrets.SANKHYA_PASSWORD }}',
          service: 'CrudServiceProvider.saveRecord',
          entity: 'Parceiro'
        };
      case 'webhook':
        return {
          url: 'https://hooks.slack.com/services/...',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          template: {
            text: 'Pipeline {{ pipeline.name }} processou {{ data.count }} registros'
          }
        };
      default:
        return {};
    }
  };

  const renderConfigFields = (destination: DataDestination) => {
    switch (destination.type) {
      case 'http-sink':
        return (
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">URL</label>
              <input
                type="text"
                value={destination.config.url || ''}
                onChange={(e) => updateDestination(destination.id, 'config', { ...destination.config, url: e.target.value })}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                placeholder="https://api.destino.com/dados"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Method</label>
                <select
                  value={destination.config.method || 'POST'}
                  onChange={(e) => updateDestination(destination.id, 'config', { ...destination.config, method: e.target.value })}
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                >
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Batch Size</label>
                <input
                  type="number"
                  value={destination.config.batch_size || 100}
                  onChange={(e) => updateDestination(destination.id, 'config', { ...destination.config, batch_size: parseInt(e.target.value) })}
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                  min="1"
                  max="10000"
                />
              </div>
            </div>
          </div>
        );

      case 'database-sink':
        return (
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Connection String</label>
              <input
                type="text"
                value={destination.config.connection || ''}
                onChange={(e) => updateDestination(destination.id, 'config', { ...destination.config, connection: e.target.value })}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                placeholder="{{ env.DATABASE_URL }}"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Table</label>
                <input
                  type="text"
                  value={destination.config.table || ''}
                  onChange={(e) => updateDestination(destination.id, 'config', { ...destination.config, table: e.target.value })}
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                  placeholder="dados_processados"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Mode</label>
                <select
                  value={destination.config.mode || 'insert'}
                  onChange={(e) => updateDestination(destination.id, 'config', { ...destination.config, mode: e.target.value })}
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                >
                  <option value="insert">Insert</option>
                  <option value="upsert">Upsert</option>
                  <option value="update">Update</option>
                  <option value="replace">Replace</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'file-sink':
        return (
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">File Path</label>
              <input
                type="text"
                value={destination.config.path || ''}
                onChange={(e) => updateDestination(destination.id, 'config', { ...destination.config, path: e.target.value })}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                placeholder="/output/dados.csv"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Format</label>
                <select
                  value={destination.config.format || 'csv'}
                  onChange={(e) => updateDestination(destination.id, 'config', { ...destination.config, format: e.target.value })}
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                >
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                  <option value="xml">XML</option>
                  <option value="parquet">Parquet</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Mode</label>
                <select
                  value={destination.config.mode || 'overwrite'}
                  onChange={(e) => updateDestination(destination.id, 'config', { ...destination.config, mode: e.target.value })}
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                >
                  <option value="overwrite">Overwrite</option>
                  <option value="append">Append</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'sankhya-sink':
        return (
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Server</label>
              <input
                type="text"
                value={destination.config.server || ''}
                onChange={(e) => updateDestination(destination.id, 'config', { ...destination.config, server: e.target.value })}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                placeholder="{{ env.SANKHYA_SERVER }}"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Service</label>
                <select
                  value={destination.config.service || 'CrudServiceProvider.saveRecord'}
                  onChange={(e) => updateDestination(destination.id, 'config', { ...destination.config, service: e.target.value })}
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                >
                  <option value="CrudServiceProvider.saveRecord">Save Record</option>
                  <option value="CrudServiceProvider.updateRecord">Update Record</option>
                  <option value="CrudServiceProvider.deleteRecord">Delete Record</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Entity</label>
                <input
                  type="text"
                  value={destination.config.entity || ''}
                  onChange={(e) => updateDestination(destination.id, 'config', { ...destination.config, entity: e.target.value })}
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                  placeholder="Parceiro"
                />
              </div>
            </div>
          </div>
        );

      case 'webhook':
        return (
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Webhook URL</label>
              <input
                type="text"
                value={destination.config.url || ''}
                onChange={(e) => updateDestination(destination.id, 'config', { ...destination.config, url: e.target.value })}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                placeholder="https://hooks.slack.com/services/..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Message Template</label>
              <textarea
                value={JSON.stringify(destination.config.template || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const template = JSON.parse(e.target.value);
                    updateDestination(destination.id, 'config', { ...destination.config, template });
                  } catch (error) {
                    // Invalid JSON, ignore
                  }
                }}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1 font-mono"
                rows={3}
                placeholder='{"text": "Pipeline completed with {{ data.count }} records"}'
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-xs text-gray-500">
            Configuração específica para {destination.type}
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Data Destinations</h3>
        <span className="text-xs text-gray-500">Configure where your pipeline will write processed data</span>
      </div>

      {/* Lista de destinations */}
      <div className="space-y-3">
        {destinations.map((destination) => (
          <div key={destination.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <ServerIcon className="h-4 w-4 text-purple-500" />
                <input
                  type="text"
                  value={destination.name}
                  onChange={(e) => updateDestination(destination.id, 'name', e.target.value)}
                  className="text-sm font-medium bg-transparent border-none p-0 focus:ring-0"
                />
              </div>
              <button
                onClick={() => removeDestination(destination.id)}
                className="text-red-500 hover:text-red-700"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
            
            <div className="text-xs text-gray-600 mb-2">
              Type: {DESTINATION_TYPES.find(t => t.value === destination.type)?.label}
            </div>
            
            {renderConfigFields(destination)}
          </div>
        ))}
      </div>

      {/* Add new destination */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as DataDestination['type'])}
            className="flex-1 text-sm border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Select destination type...</option>
            {DESTINATION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label} - {type.description}
              </option>
            ))}
          </select>
          
          <button
            onClick={addDestination}
            disabled={!selectedType}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Destination
          </button>
        </div>
      </div>
    </div>
  );
}