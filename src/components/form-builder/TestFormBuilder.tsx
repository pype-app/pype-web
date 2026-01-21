'use client';

import { useState } from 'react';

export default function TestFormBuilder() {
  const [activeTab, setActiveTab] = useState('sources');

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-medium text-primary">Test Form Builder</h2>
        </div>
        
        <div className="card-body">
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg mb-4">
            <button
              onClick={() => setActiveTab('sources')}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'sources'
                  ? 'bg-white dark:bg-gray-600 text-primary shadow-sm'
                  : 'text-muted hover:text-secondary'
              }`}
            >
              Data Sources
            </button>
            <button
              onClick={() => setActiveTab('transformers')}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'transformers'
                  ? 'bg-white dark:bg-gray-600 text-primary shadow-sm'
                  : 'text-muted hover:text-secondary'
              }`}
            >
              Transformers
            </button>
            <button
              onClick={() => setActiveTab('destinations')}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'destinations'
                  ? 'bg-white dark:bg-gray-600 text-primary shadow-sm'
                  : 'text-muted hover:text-secondary'
              }`}
            >
              Destinations
            </button>
          </div>

          {/* Content */}
          <div className="min-h-[200px]">
            {activeTab === 'sources' && (
              <div>
                <h3 className="font-medium mb-2 text-primary">Data Sources</h3>
                <button className="btn-primary">
                  + Add Source
                </button>
                <p className="text-sm text-muted mt-2">Configure data sources here</p>
              </div>
            )}
            
            {activeTab === 'transformers' && (
              <div>
                <h3 className="font-medium mb-2 text-primary">Data Transformers</h3>
                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors">
                  + Add Transformer
                </button>
                <p className="text-sm text-muted mt-2">Configure data transformations here</p>
              </div>
            )}
            
            {activeTab === 'destinations' && (
              <div>
                <h3 className="font-medium mb-2 text-primary">Data Destinations</h3>
                <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition-colors">
                  + Add Destination
                </button>
                <p className="text-sm text-muted mt-2">Configure data destinations here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}