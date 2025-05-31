import React, { useState } from 'react';
import { PlusCircle, Trash2, MoveUp, MoveDown, Save } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import { useColumns, ColumnDefinition } from '../contexts/ColumnContext';

const columnTypes = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
];

const ColumnBuilder: React.FC = () => {
  const { columns, addColumn, updateColumn, removeColumn, reorderColumns } = useColumns();
  
  const [newColumn, setNewColumn] = useState({
    name: '',
    type: 'text' as const,
    required: false,
    options: '',
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const handleAddColumn = () => {
    // Validate
    if (!newColumn.name.trim()) {
      setError('Column name is required');
      return;
    }
    
    // Check if column name already exists
    if (columns.some(col => col.name.toLowerCase() === newColumn.name.toLowerCase())) {
      setError('A column with this name already exists');
      return;
    }
    
    // Parse options for select type
    let options: string[] | undefined;
    if (newColumn.type === 'select') {
      if (!newColumn.options.trim()) {
        setError('Options are required for dropdown columns');
        return;
      }
      options = newColumn.options.split(',').map(opt => opt.trim());
    }
    
    // Add the new column
    addColumn({
      name: newColumn.name,
      type: newColumn.type,
      required: newColumn.required,
      options,
    });
    
    // Reset form
    setNewColumn({
      name: '',
      type: 'text',
      required: false,
      options: '',
    });
    
    setError('');
    setSuccess('Column added successfully');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccess('');
    }, 3000);
  };
  
  const handleMoveColumn = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= columns.length) {
      return;
    }
    
    reorderColumns(index, newIndex);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Column Builder</h1>
        <p className="mt-1 text-sm text-gray-500">
          Define the columns for your data collection form.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add new column form */}
        <Card title="Add New Column" className="lg:col-span-1">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {success && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <Input
              label="Column Name"
              value={newColumn.name}
              onChange={(e) => setNewColumn({ ...newColumn, name: e.target.value })}
              placeholder="e.g., First Name"
              required
            />
            
            <Select
              label="Column Type"
              value={newColumn.type}
              onChange={(value) => setNewColumn({ ...newColumn, type: value as any })}
              options={columnTypes}
              required
            />
            
            {newColumn.type === 'select' && (
              <Input
                label="Options"
                value={newColumn.options}
                onChange={(e) => setNewColumn({ ...newColumn, options: e.target.value })}
                placeholder="Option 1, Option 2, Option 3"
                helperText="Separate options with commas"
                required
              />
            )}
            
            <div className="flex items-center">
              <input
                id="required"
                name="required"
                type="checkbox"
                checked={newColumn.required}
                onChange={(e) => setNewColumn({ ...newColumn, required: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="required" className="ml-2 block text-sm text-gray-900">
                Required field
              </label>
            </div>
            
            <Button
              onClick={handleAddColumn}
              variant="primary"
              icon={<PlusCircle className="h-4 w-4" />}
              fullWidth
            >
              Add Column
            </Button>
          </div>
        </Card>
        
        {/* Current columns */}
        <Card title="Current Columns" subtitle={`${columns.length} columns defined`} className="lg:col-span-2">
          {columns.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No columns defined yet. Add your first column to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Required
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Options
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {columns.map((column, index) => (
                    <tr key={column.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {column.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {columnTypes.find(t => t.value === column.type)?.label}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {column.required ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Required
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Optional
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {column.options ? column.options.join(', ') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleMoveColumn(index, 'up')}
                            disabled={index === 0}
                            className={`p-1 rounded-full ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-gray-500'}`}
                            title="Move Up"
                          >
                            <MoveUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleMoveColumn(index, 'down')}
                            disabled={index === columns.length - 1}
                            className={`p-1 rounded-full ${index === columns.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-gray-500'}`}
                            title="Move Down"
                          >
                            <MoveDown className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeColumn(column.id)}
                            className="p-1 rounded-full text-red-400 hover:text-red-500"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {columns.length > 0 && (
            <div className="mt-6 flex justify-end">
              <Button
                variant="success"
                icon={<Save className="h-4 w-4" />}
              >
                Save Column Configuration
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ColumnBuilder;