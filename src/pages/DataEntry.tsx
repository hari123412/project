import React, { useState, useEffect } from 'react';
import { Save, FileDown, Plus } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import { useColumns, ColumnDefinition } from '../contexts/ColumnContext';
import { dataService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface FormData {
  [key: string]: string | number | boolean;
}

const DataEntry: React.FC = () => {
  const { columns } = useColumns();
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({});
  const [entries, setEntries] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [exportType, setExportType] = useState<'single' | 'range'>('single');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchTodayEntries();
  }, []);

  const fetchTodayEntries = async () => {
    try {
      const todayEntries = await dataService.getTodayEntries();
      setEntries(todayEntries);
    } catch (err) {
      console.error('Failed to fetch today\'s entries:', err);
      setError('Failed to fetch today\'s entries');
    }
  };
  
  const validateForm = () => {
    const errors: string[] = [];
    
    columns.forEach(column => {
      if (column.required && !formData[column.name] && formData[column.name] !== 0 && formData[column.name] !== false) {
        errors.push(`${column.name} is required`);
      }
    });
    
    return errors;
  };
  
  const handleInputChange = (columnName: string, value: string | number | boolean) => {
    setFormData({
      ...formData,
      [columnName]: value,
    });
  };
  
  const handleSubmit = async () => {
    try {
      const errors = validateForm();
      
      if (errors.length > 0) {
        setError(errors.join(', '));
        return;
      }
      
      setIsLoading(true);
      setError('');

      await dataService.saveEntry({
        userId: user?.id,
        data: formData
      });
      
      await fetchTodayEntries();
      
      setFormData({});
      setSuccess('Data saved successfully');
      
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExport = async () => {
    try {
      if (!startDate) {
        setError('Please select a start date');
        return;
      }
      
      if (exportType === 'range' && !endDate) {
        setError('Please select an end date');
        return;
      }

      if (exportType === 'range' && new Date(endDate) < new Date(startDate)) {
        setError('End date must be after start date');
        return;
      }

      setIsLoading(true);
      setError('');
      
      if (exportType === 'range') {
        await dataService.exportDateRange(startDate, endDate);
      } else {
        await dataService.exportDaily(startDate);
      }
      
      setSuccess('Export completed successfully');
    } catch (err) {
      setError('Failed to export data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderFormField = (column: ColumnDefinition) => {
    switch (column.type) {
      case 'text':
        return (
          <Input
            key={column.id}
            label={column.name}
            value={formData[column.name] as string || ''}
            onChange={(e) => handleInputChange(column.name, e.target.value)}
            required={column.required}
          />
        );
      case 'number':
        return (
          <Input
            key={column.id}
            label={column.name}
            type="number"
            value={formData[column.name] as string || ''}
            onChange={(e) => handleInputChange(column.name, e.target.value ? Number(e.target.value) : '')}
            required={column.required}
          />
        );
      case 'date':
        return (
          <Input
            key={column.id}
            label={column.name}
            type="date"
            value={formData[column.name] as string || ''}
            onChange={(e) => handleInputChange(column.name, e.target.value)}
            required={column.required}
          />
        );
      case 'select':
        return (
          <Select
            key={column.id}
            label={column.name}
            value={formData[column.name] as string || ''}
            onChange={(value) => handleInputChange(column.name, value)}
            options={(column.options || []).map(opt => ({ value: opt, label: opt }))}
            required={column.required}
          />
        );
      case 'checkbox':
        return (
          <div key={column.id} className="flex items-center mb-4">
            <input
              id={column.id}
              type="checkbox"
              checked={!!formData[column.name]}
              onChange={(e) => handleInputChange(column.name, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={column.id} className="ml-2 block text-sm text-gray-900">
              {column.name}
              {column.required && <span className="ml-1 text-red-500">*</span>}
            </label>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Data Entry</h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter data using your configured columns.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Data entry form */}
        <div className="lg:col-span-2">
          <Card title="Enter Data">
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {success && (
              <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                </div>
              </div>
            )}
            
            {columns.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No columns defined yet. Please configure your columns first.</p>
                <Button
                  as="a"
                  href="/columns"
                  variant="primary"
                  icon={<Plus className="h-4 w-4" />}
                >
                  Configure Columns
                </Button>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {columns.map(column => renderFormField(column))}
                </div>
                
                <div className="mt-6 flex flex-col space-y-4">
                  <Button
                    onClick={handleSubmit}
                    variant="primary"
                    icon={<Save className="h-4 w-4" />}
                    isLoading={isLoading}
                  >
                    Save Entry
                  </Button>
                  
                  <Card title="Export Options" className="mt-4">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio"
                            name="exportType"
                            value="single"
                            checked={exportType === 'single'}
                            onChange={(e) => setExportType(e.target.value as 'single')}
                          />
                          <span className="ml-2">Single Date</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio"
                            name="exportType"
                            value="range"
                            checked={exportType === 'range'}
                            onChange={(e) => setExportType(e.target.value as 'range')}
                          />
                          <span className="ml-2">Date Range</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          type="date"
                          label={exportType === 'range' ? "Start Date" : "Date"}
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                        {exportType === 'range' && (
                          <Input
                            type="date"
                            label="End Date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                          />
                        )}
                      </div>

                      <Button
                        onClick={handleExport}
                        variant="outline"
                        icon={<FileDown className="h-4 w-4" />}
                        isLoading={isLoading}
                        fullWidth
                      >
                        Export Data
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </Card>
        </div>
        
        {/* Today's entries summary */}
        <div className="lg:col-span-1">
          <Card title={`Today's Entries (${entries.length})`}>
            {entries.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No entries yet today. Use the form to add data.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <div key={entry._id} className="p-3 bg-gray-50 rounded-md">
                    {columns.map(column => (
                      <div key={column.id} className="mb-1">
                        <span className="text-xs font-medium text-gray-500">{column.name}:</span>{' '}
                        <span className="text-sm">
                          {column.type === 'checkbox' 
                            ? (entry.data[column.name] ? 'Yes' : 'No') 
                            : entry.data[column.name] || '-'}
                        </span>
                      </div>
                    ))}
                    <div className="mt-2 text-xs text-gray-400">
                      {new Date(entry.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DataEntry;
