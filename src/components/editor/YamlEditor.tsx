'use client';

import { Editor } from '@monaco-editor/react';
import { useEffect, useState } from 'react';
import * as yaml from 'js-yaml';

interface YamlEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
  readOnly?: boolean;
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
}

export default function YamlEditor({
  value,
  onChange,
  height = '400px',
  readOnly = false,
  onValidationChange,
}: YamlEditorProps) {
  const [editorTheme, setEditorTheme] = useState('vs-light');
  const [isEditorReady, setIsEditorReady] = useState(false);

  useEffect(() => {
    // Detect system theme or use light as default
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setEditorTheme(prefersDark ? 'vs-dark' : 'vs-light');
  }, []);

  const handleEditorChange = (newValue: string | undefined) => {
    const content = newValue || '';
    onChange(content);

    // Validar YAML em tempo real
    if (onValidationChange) {
      validateYaml(content);
    }
  };

  const validateYaml = (content: string) => {
    const errors: string[] = [];
    let isValid = true;

    if (!content.trim()) {
      onValidationChange?.(true, []);
      return;
    }

    try {
      yaml.load(content);
    } catch (error: any) {
      isValid = false;
      errors.push(`YAML Syntax Error: ${error.message}`);
    }

    // Validações específicas do pipeline
    try {
      const parsed = yaml.load(content) as any;
      
      if (parsed && typeof parsed === 'object') {
        // Validar estrutura PipelineSpec
        if (!parsed.pipeline) {
          errors.push('Pipeline must have a "pipeline" field (unique ID)');
          isValid = false;
        }
        
        if (!parsed.name) {
          errors.push('Pipeline must have a "name" field');
          isValid = false;
        }
        
        if (!parsed.version) {
          errors.push('Pipeline must have a "version" field');
          isValid = false;
        }
        
        if (!parsed.steps || !Array.isArray(parsed.steps)) {
          errors.push('Pipeline must have a "steps" array');
          isValid = false;
        }
        
        // Validar steps seguindo estrutura PipelineSpec
        if (parsed.steps && Array.isArray(parsed.steps)) {
          parsed.steps.forEach((step: any, index: number) => {
            const stepNum = index + 1;
            let hasValidStepType = false;
            
            // Check if the step has at least one valid type (source, transform, validate, sink)
            if (step.source) {
              hasValidStepType = true;
              if (!step.source.type) {
                errors.push(`Step ${stepNum} source must have a "type" field`);
                isValid = false;
              }
            }
            
            if (step.transform) {
              hasValidStepType = true;
              // Transform pode ter "map" ou outras configurações
              if (!step.transform.map && !step.transform.script) {
                errors.push(`Step ${stepNum} transform must have a "map" or "script" field`);
                isValid = false;
              }
            }
            
            if (step.validate) {
              hasValidStepType = true;
              if (!step.validate.rules || !Array.isArray(step.validate.rules)) {
                errors.push(`Step ${stepNum} validate must have a "rules" array`);
                isValid = false;
              }
            }
            
            if (step.sink) {
              hasValidStepType = true;
              if (!step.sink.type) {
                errors.push(`Step ${stepNum} sink must have a "type" field`);
                isValid = false;
              }
            }
            
            // Se não tem nenhum tipo válido, é erro
            if (!hasValidStepType) {
              errors.push(`Step ${stepNum} must have one of: source, transform, validate, or sink`);
              isValid = false;
            }
          });
        }
      }
    } catch (error) {
      // Já capturado na validação de sintaxe
    }

    onValidationChange?.(isValid, errors);
  };

  const handleEditorDidMount = async (editor: any, monaco: any) => {
    setIsEditorReady(true);
    
    try {
      console.log('🔧 Configurando Monaco Editor...');
      
      // Configurar validação básica primeiro
      editor.onDidChangeModelContent(() => {
        const content = editor.getValue();
        if (onValidationChange) {
          validateYaml(content);
        }
      });

      // Configurar YAML language de forma simples
      monaco.languages.register({ id: 'yaml' });
      
      // Configuração básica de YAML sem monaco-yaml para evitar problemas com workers
      monaco.languages.setLanguageConfiguration('yaml', {
        brackets: [
          ['{', '}'],
          ['[', ']'],
          ['(', ')']
        ],
        autoClosingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"' },
          { open: "'", close: "'" },
        ],
        surroundingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"' },
          { open: "'", close: "'" },
        ],
        comments: {
          lineComment: '#',
        },
        indentationRules: {
          increaseIndentPattern: /^(\s*)(.*:(\s*$|\s*[^#]*\s*$))/,
          decreaseIndentPattern: /^\s*$/,
        },
      });

      // Syntax highlighting para YAML
      monaco.languages.setMonarchTokensProvider('yaml', {
        tokenizer: {
          root: [
            // Chaves (keys)
            [/^(\s*)([\w\-\s]+)(\s*)(:)(\s*)/, ['white', 'key', 'white', 'delimiter', 'white']],
            
            // Lista items
            [/^(\s*)(-)(\s*)/, ['white', 'delimiter', 'white']],
            
            // Strings com aspas
            [/"[^"]*"/, 'string'],
            [/'[^']*'/, 'string'],
            
            // Números
            [/\b\d+(\.\d+)?\b/, 'number'],
            
            // Comentários
            [/#.*$/, 'comment'],
            
            // Booleanos e null
            [/\b(true|false|null|True|False|NULL)\b/, 'keyword'],
            
            // Operadores YAML
            [/[>|]/, 'operator'],
            
            // Whitespace
            [/\s+/, 'white'],
            
            // Outros
            [/./, 'white'],
          ],
        },
      });

      // Configurar autocomplete personalizado para pipelines
      monaco.languages.registerCompletionItemProvider('yaml', {
        provideCompletionItems: (model: any, position: any) => {
          const suggestions = [
            {
              label: 'pipeline-template',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: `name: "meu-pipeline"
version: "1.0.0"
description: "Pipeline description"

settings:
  timeout: 3600
  retries: 3
  parallel: false

steps:
  - name: "step1"
    type: "source"
    config:
      connector: "http"
      url: "https://api.example.com/data"
      
  - name: "step2"
    type: "transformer"
    config:
      script: |
        return data.map(item => ({
          id: item.id,
          name: item.name
        }));
        
  - name: "step3"
    type: "destination"
    config:
      connector: "database"
      table: "processed_data"`,
              documentation: 'Template completo de pipeline',
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: 1,
                endColumn: position.column
              }
            },
            {
              label: 'data-source',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: `- name: "data-source"
  type: "source"
  config:
    connector: "http"
    url: "https://api.example.com/data"
    method: "GET"
    headers:
      Authorization: "Bearer \${{ secrets.API_TOKEN }}"
    format: "json"`,
              documentation: 'Data Source step',
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: 1,
                endColumn: position.column
              }
            },
            {
              label: 'data-transformer',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: `- name: "data-transformer"
  type: "transformer"
  config:
    script: |
      // Transform your data here
      return data.map(item => ({
        id: item.id,
        processedAt: new Date().toISOString()
      }));`,
              documentation: 'Data Transformer step',
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: 1,
                endColumn: position.column
              }
            },
            {
              label: 'data-destination',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: `- name: "data-destination"
  type: "destination"
  config:
    connector: "database"
    table: "output_table"
    mode: "insert"`,
              documentation: 'Data Destination step',
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: 1,
                endColumn: position.column
              }
            }
          ];
          
          return { suggestions };
        }
      });

      console.log('✅ Monaco Editor configurado com sucesso (modo simplificado)!');

    } catch (error) {
      console.error('❌ Erro ao configurar editor:', error);
    }
  };

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      <Editor
        height={height}
        defaultLanguage="yaml"
        theme={editorTheme}
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        loading={<div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Carregando editor YAML...</span>
        </div>}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          folding: true,
          renderLineHighlight: 'line',
          selectOnLineNumbers: true,
          roundedSelection: false,
          cursorStyle: 'line',
          tabSize: 2,
          insertSpaces: true,
          formatOnPaste: true,
          formatOnType: true,
          quickSuggestions: {
            other: true,
            comments: false,
            strings: false
          },
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: 'on',
          snippetSuggestions: 'top',
          // Desabilitar workers para evitar erros
          'semanticHighlighting.enabled': false,
        }}
      />
    </div>
  );
}