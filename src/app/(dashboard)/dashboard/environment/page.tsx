'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/store/auth';
import { UserRole } from '@/types';
import { 
  environmentVariablesService, 
  EnvironmentVariable 
} from '@/services/environment-variables';
import { toast } from 'react-hot-toast';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  KeyIcon,
  GlobeAltIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

export default function EnvironmentPage() {
  const { user, hasRole } = useAuth();
  const [variables, setVariables] = useState<EnvironmentVariable[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showValues, setShowValues] = useState<Record<number, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVariable, setEditingVariable] = useState<EnvironmentVariable | null>(null);
  const [filter, setFilter] = useState<'all' | 'secrets' | 'env'>('all');
  const [onlyMine, setOnlyMine] = useState(false);

  // Só Admin e Owner podem acessar secrets
  const canManageSecrets = hasRole([UserRole.Admin, UserRole.Owner]);
  
  // Check if user can toggle onlyMine (Admin/Owner)
  const canToggleOnlyMine = hasRole([UserRole.Admin, UserRole.Owner]);
  const isUser = hasRole([UserRole.User]);
  
  // Usuários normais só podem ver environment variables
  const canCreateEdit = hasRole([UserRole.User, UserRole.Admin, UserRole.Owner]);

  useEffect(() => {
    loadVariables();
  }, [onlyMine]);

  const loadVariables = async () => {
    try {
      setLoading(true);
      const data = await environmentVariablesService.getAll(onlyMine);
      
      // Se não for admin/owner, filtra apenas environment variables
      const filteredData = canManageSecrets 
        ? data 
        : data.filter(v => !v.isSecret);
        
      setVariables(filteredData);
    } catch (error) {
      toast.error('Erro ao carregar variáveis');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this variable?')) return;

    try {
      await environmentVariablesService.delete(id);
      setVariables(variables.filter(v => v.id !== id));
      toast.success('Variável excluída com sucesso');
    } catch (error) {
      toast.error('Error deleting variable');
      console.error(error);
    }
  };

  const toggleShowValue = (id: number) => {
    setShowValues(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredVariables = variables.filter(variable => {
    const matchesSearch = variable.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (variable.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    if (filter === 'secrets') return matchesSearch && variable.isSecret;
    if (filter === 'env') return matchesSearch && !variable.isSecret;
    return matchesSearch;
  });

  const openModal = async (variable?: EnvironmentVariable) => {
    if (variable) {
      // Fetch the actual unmasked value for editing
      try {
        const fullVariable = await environmentVariablesService.getById(variable.id);
        setEditingVariable(fullVariable);
      } catch (error) {
        console.error('Error fetching variable details:', error);
        toast.error('Error loading variable details');
        return;
      }
    } else {
      setEditingVariable(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVariable(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Environment & Secrets
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage environment variables and secrets for your pipelines
          </p>
        </div>
        
        {canCreateEdit && (
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            New Variable
          </button>
        )}
      </div>

      {/* Access Level Warning */}
      {!canManageSecrets && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
            <p className="text-sm text-yellow-700">
                <strong>Limited access:</strong> You can only view and manage environment variables. 
                To access secrets, please contact an administrator.
            </p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search variables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700' 
                : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            All
          </button>
          
          <button
            onClick={() => setFilter('env')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              filter === 'env' 
                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700' 
                : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            <GlobeAltIcon className="h-4 w-4" />
            Environment
          </button>
          
          {canManageSecrets && (
            <button
              onClick={() => setFilter('secrets')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                filter === 'secrets' 
                  ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700' 
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              <KeyIcon className="h-4 w-4" />
              Secrets
            </button>
          )}

          {/* Only Mine toggle - only for ADMIN/OWNER */}
          {canToggleOnlyMine && (
            <button
              type="button"
              onClick={() => setOnlyMine(!onlyMine)}
              disabled={loading}
              className={`inline-flex items-center gap-x-1.5 px-4 py-2 text-sm font-semibold rounded-lg shadow-sm disabled:opacity-50 transition-colors ${
                onlyMine
                  ? 'bg-blue-600 text-white hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400 border border-blue-700 dark:border-blue-400'
                  : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              <UserCircleIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
              Only Mine
            </button>
          )}

          {/* Info badge for USER role */}
          {isUser && (
            <div className="inline-flex items-center gap-x-1.5 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
              <UserCircleIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
              Your Variables
            </div>
          )}
        </div>
      </div>

      {/* Variables Table */}
      <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-xl rounded-lg overflow-hidden">
        {filteredVariables.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-lg mb-2">No variables found</div>
            <p className="text-gray-600 dark:text-gray-400">
              {canCreateEdit ? 'Click "New Variable" to get started' : 'No environment variables available'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                  {canCreateEdit && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredVariables.map((variable) => (
                  <tr key={variable.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {variable.isSecret ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                            <KeyIcon className="h-3 w-3" />
                            Secret
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                            <GlobeAltIcon className="h-3 w-3" />
                            Environment
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{variable.key}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                        {variable.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {variable.isSecret ? (
                          <>
                            <span className="text-sm text-gray-600 dark:text-gray-300 font-mono">
                              {showValues[variable.id] ? variable.value : '••••••••'}
                            </span>
                            <button
                              onClick={() => toggleShowValue(variable.id)}
                              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              {showValues[variable.id] ? (
                                <EyeSlashIcon className="h-4 w-4" />
                              ) : (
                                <EyeIcon className="h-4 w-4" />
                              )}
                            </button>
                          </>
                        ) : (
                          <span className="text-sm text-gray-600 dark:text-gray-300 font-mono max-w-xs truncate">
                            {variable.value}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {new Date(variable.updatedAt || variable.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    {canCreateEdit && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openModal(variable)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            title="Edit"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(variable.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                            title="Delete"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <VariableModal
          variable={editingVariable}
          onClose={closeModal}
          onSave={loadVariables}
          canManageSecrets={canManageSecrets}
        />
      )}
    </div>
  );
}

// Modal Component
interface VariableModalProps {
  variable: EnvironmentVariable | null;
  onClose: () => void;
  onSave: () => void;
  canManageSecrets: boolean;
}

function VariableModal({ variable, onClose, onSave, canManageSecrets }: VariableModalProps) {
  const [formData, setFormData] = useState({
    key: variable?.key || '',
    value: variable?.value || '',
    description: variable?.description || '',
    isSecret: variable?.isSecret || false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
    if (variable) {
      await environmentVariablesService.update(variable.id, formData);
      toast.success('Variable updated successfully');
    } else {
      await environmentVariablesService.create(formData);
      toast.success('Variable created successfully');
      }
      onSave();
      onClose();
    } catch (error) {
      toast.error(variable ? 'Error updating variable' : 'Error creating variable');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-80 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl dark:shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {variable ? 'Edit Variable' : 'New Variable'}
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Variable Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Ex: DATABASE_URL, API_KEY"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Value *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Variable value"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Optional description"
                  />
                </div>

                {canManageSecrets && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isSecret"
                      checked={formData.isSecret}
                      onChange={(e) => setFormData({ ...formData, isSecret: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    />
                    <label htmlFor="isSecret" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Is a secret (will be encrypted and hidden)
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {loading ? 'Saving...' : variable ? 'Save' : 'Create'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}