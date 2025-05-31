import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

export interface ColumnDefinition {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox';
  required: boolean;
  options?: string[];
}

interface ColumnContextType {
  columns: ColumnDefinition[];
  addColumn: (column: Omit<ColumnDefinition, 'id'>) => Promise<void>;
  updateColumn: (id: string, updates: Partial<Omit<ColumnDefinition, 'id'>>) => Promise<void>;
  removeColumn: (id: string) => Promise<void>;
  reorderColumns: (startIndex: number, endIndex: number) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const ColumnContext = createContext<ColumnContextType | undefined>(undefined);

export const ColumnProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [columns, setColumns] = useState<ColumnDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchColumns();
    }
  }, [user]);

  const fetchColumns = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://data-entry-sfo.onrender.com/api/columns', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setColumns(response.data);
    } catch (err) {
      setError('Failed to fetch columns');
    } finally {
      setLoading(false);
    }
  };

  const addColumn = async (column: Omit<ColumnDefinition, 'id'>) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('https://data-entry-sfo.onrender.com/api/columns', column, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setColumns([...columns, response.data]);
    } catch (err) {
      setError('Failed to add column');
      throw err;
    }
  };

  const updateColumn = async (id: string, updates: Partial<Omit<ColumnDefinition, 'id'>>) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`https://data-entry-sfo.onrender.com/api/columns/${id}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setColumns(columns.map(col => col.id === id ? response.data : col));
    } catch (err) {
      setError('Failed to update column');
      throw err;
    }
  };

  const removeColumn = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://data-entry-sfo.onrender.com/api/columns/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setColumns(columns.filter(col => col.id !== id));
    } catch (err) {
      setError('Failed to remove column');
      throw err;
    }
  };

  const reorderColumns = async (startIndex: number, endIndex: number) => {
    try {
      const result = Array.from(columns);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      setColumns(result);
      
      // TODO: Implement backend reordering if needed
    } catch (err) {
      setError('Failed to reorder columns');
      throw err;
    }
  };

  return (
    <ColumnContext.Provider value={{ 
      columns, 
      addColumn, 
      updateColumn, 
      removeColumn, 
      reorderColumns,
      loading,
      error
    }}>
      {children}
    </ColumnContext.Provider>
  );
};

export const useColumns = () => {
  const context = useContext(ColumnContext);
  if (context === undefined) {
    throw new Error('useColumns must be used within a ColumnProvider');
  }
  return context;
};
