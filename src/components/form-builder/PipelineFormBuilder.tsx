'use client';

import { useState, useEffect } from 'react';
import * as yaml from 'js-yaml';
import DataSourceConfig, { DataSource } from './DataSourceConfig';
import DataTransformerConfig, { DataTransformer } from './DataTransformerConfig';
import DataDestinationConfig, { DataDestination } from './DataDestinationConfig';
import { CodeBracketIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';

interface PipelineFormBuilderProps {
  value: string;
  onChange: (yamlContent: string) => void;
  pipelineName: string;
  pipelineDescription?: string;
}

interface PipelineConfig {
  name: string;
  version: string;
  description?: string;
  settings?: {
    timeout?: number;
    retries?: number;
    parallel?: boolean;
  };
  variables?: Array<{
    name: string;
    value: string;
  }>;
  steps: Array<{
    name: string;
    type: string;
    config: Record<string, any>;
  }>;
}

export default function PipelineFormBuilder({
  value,
  onChange,
  pipelineName,
  pipelineDescription
}: PipelineFormBuilderProps) {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [transformers, setTransformers] = useState<DataTransformer[]>([]);
  const [destinations, setDestinations] = useState<DataDestination[]>([]);
  const [settings, setSettings] = useState({
    timeout: 3600,
    retries: 3,
    parallel: false
  });
  const [variables, setVariables] = useState<Array<{name: string; value: string}>>([]);

  // Carregar configuração existente do YAML
  useEffect(() => {
    if (value.trim()) {
      try {
        const config = yaml.load(value) as PipelineConfig;
        if (config && config.steps) {
          // Extrair sources, transformers e destinations dos steps
          const newSources: DataSource[] = [];
          const newTransformers: DataTransformer[] = [];
          const newDestinations: DataDestination[] = [];

          config.steps.forEach((step, index) => {
            if (step.type.endsWith('-source')) {
              newSources.push({
                id: `source_${index}`,
                name: step.name,
                type: step.type as DataSource['type'],
                config: step.config
              });
            } else if (['map', 'filter', 'aggregate', 'script', 'validate', 'sort'].includes(step.type)) {
              newTransformers.push({
                id: `transformer_${index}`,
                name: step.name,
                type: step.type as DataTransformer['type'],
                config: step.config
              });
            } else if (step.type.endsWith('-sink') || step.type === 'webhook') {
              newDestinations.push({
                id: `destination_${index}`,
                name: step.name,
                type: step.type as DataDestination['type'],
                config: step.config
              });
            }
          });

          setSources(newSources);
          setTransformers(newTransformers);
          setDestinations(newDestinations);
          
          if (config.settings) {
            setSettings({
              timeout: config.settings.timeout || 3600,
              retries: config.settings.retries || 3,
              parallel: config.settings.parallel || false
            });
          }

          if (config.variables) {
            setVariables(config.variables);
          }
        }
      } catch (error) {
        console.error('Error parsing YAML:', error);
      }
    }
  }, [value]);

  // Gerar YAML quando configuração muda
  useEffect(() => {
    generateYaml();
  }, [sources, transformers, destinations, settings, variables, pipelineName, pipelineDescription]);

  const generateYaml = () => {
    const steps: Array<{name: string; type: string; config: Record<string, any>}> = [];

    // Add sources
    sources.forEach(source => {
      steps.push({
        name: source.name,
        type: source.type,
        config: source.config
      });
    });

    // Add transformers
    transformers.forEach(transformer => {
      steps.push({
        name: transformer.name,
        type: transformer.type,
        config: transformer.config
      });
    });

    // Add destinations
    destinations.forEach(destination => {
      steps.push({
        name: destination.name,
        type: destination.type,
        config: destination.config
      });
    });

    const config: PipelineConfig = {
      name: pipelineName || 'novo-pipeline',
      version: '1.0.0',
      description: pipelineDescription || 'Pipeline criado com Form Builder',
      settings,
      ...(variables.length > 0 && { variables }),
      steps
    };

    const yamlContent = yaml.dump(config, {
      indent: 2,
      lineWidth: 120,
      noRefs: true
    });

    onChange(yamlContent);
  };

  const addVariable = () => {
    setVariables([...variables, { name: '', value: '' }]);
  };

  const updateVariable = (index: number, field: 'name' | 'value', value: string) => {
    const newVariables = [...variables];
    newVariables[index] = { ...newVariables[index], [field]: value };
    setVariables(newVariables);
  };

  const removeVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <WrenchScrewdriverIcon className="h-5 w-5 text-blue-500" />
        <h2 className="text-lg font-medium text-gray-900">Visual Pipeline Builder</h2>
        <span className="text-sm text-gray-500">Build your pipeline using forms</span>
      </div>

      {/* Pipeline Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Pipeline Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Timeout (seconds)</label>
            <input
              type="number"
              value={settings.timeout}
              onChange={(e) => setSettings({ ...settings, timeout: parseInt(e.target.value) || 3600 })}
              className="w-full text-sm border border-gray-300 rounded px-3 py-2"
              min="60"
              max="86400"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Retries</label>
            <input
              type="number"
              value={settings.retries}
              onChange={(e) => setSettings({ ...settings, retries: parseInt(e.target.value) || 3 })}
              className="w-full text-sm border border-gray-300 rounded px-3 py-2"
              min="0"
              max="10"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={settings.parallel}
              onChange={(e) => setSettings({ ...settings, parallel: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-900">
              Enable parallel execution
            </label>
          </div>
        </div>
      </div>

      {/* Variables */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">Variables</h3>
          <button
            onClick={addVariable}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            + Add Variable
          </button>
        </div>
        
        <div className="space-y-2">
          {variables.map((variable, index) => (
            <div key={index} className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={variable.name}
                onChange={(e) => updateVariable(index, 'name', e.target.value)}
                className="text-sm border border-gray-300 rounded px-3 py-2"
                placeholder="Variable name"
              />
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={variable.value}
                  onChange={(e) => updateVariable(index, 'value', e.target.value)}
                  className="flex-1 text-sm border border-gray-300 rounded px-3 py-2"
                  placeholder="Variable value"
                />
                <button
                  onClick={() => removeVariable(index)}
                  className="text-red-500 hover:text-red-700 px-2"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Sources */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <DataSourceConfig 
          sources={sources}
          onChange={setSources}
        />
      </div>

      {/* Data Transformers */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <DataTransformerConfig 
          transformers={transformers}
          onChange={setTransformers}
        />
      </div>

      {/* Data Destinations */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <DataDestinationConfig 
          destinations={destinations}
          onChange={setDestinations}
        />
      </div>

      {/* Pipeline Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <CodeBracketIcon className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium text-blue-900">Pipeline Summary</span>
        </div>
        
        <div className="text-xs text-blue-700 space-y-1">
          <div>• {sources.length} data source(s)</div>
          <div>• {transformers.length} transformer(s)</div>
          <div>• {destinations.length} destination(s)</div>
          <div>• {variables.length} variable(s)</div>
          <div>• Total steps: {sources.length + transformers.length + destinations.length}</div>
        </div>
      </div>
    </div>
  );
}