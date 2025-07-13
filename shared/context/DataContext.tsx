import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { SOP, User, WorkingCopy } from '../types';
import { SOPService } from '../services/sopService';
import { UserService } from '../services/userService';

interface DataState {
  sops: SOP[];
  users: User[];
  workingCopies: WorkingCopy[];
  isLoading: boolean;
  error: string | null;
}

interface DataContextType extends DataState {
  updateSOP: (id: string, updates: Partial<SOP>) => Promise<SOP | null>;
  createSOP: (sopData: Omit<SOP, 'id' | 'lastUpdated'>) => Promise<SOP>;
  deleteSOP: (id: string) => Promise<boolean>;
  submitSOPForReview: (
    sopId: string, 
    changes: { title: string; content: string; department: string },
    reviewers: string[],
    summary: string
  ) => Promise<SOP | null>;
  refreshData: () => Promise<void>;
}

type DataAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SOPS'; payload: SOP[] }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SET_WORKING_COPIES'; payload: WorkingCopy[] }
  | { type: 'UPDATE_SOP'; payload: SOP }
  | { type: 'ADD_SOP'; payload: SOP }
  | { type: 'REMOVE_SOP'; payload: string };

const initialState: DataState = {
  sops: [],
  users: [],
  workingCopies: [],
  isLoading: false,
  error: null
};

function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SOPS':
      return { ...state, sops: action.payload };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'SET_WORKING_COPIES':
      return { ...state, workingCopies: action.payload };
    case 'UPDATE_SOP':
      return {
        ...state,
        sops: state.sops.map(sop => 
          sop.id === action.payload.id ? action.payload : sop
        )
      };
    case 'ADD_SOP':
      return { ...state, sops: [...state.sops, action.payload] };
    case 'REMOVE_SOP':
      return {
        ...state,
        sops: state.sops.filter(sop => sop.id !== action.payload)
      };
    default:
      return state;
  }
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  // Load initial data
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const [sopsData, usersData, workingCopiesData] = await Promise.all([
        SOPService.getSOPs(),
        UserService.getUsers(),
        SOPService.getWorkingCopies()
      ]);

      dispatch({ type: 'SET_SOPS', payload: sopsData });
      dispatch({ type: 'SET_USERS', payload: usersData });
      dispatch({ type: 'SET_WORKING_COPIES', payload: workingCopiesData });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load data' });
      console.error('Error loading data:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateSOP = async (id: string, updates: Partial<SOP>): Promise<SOP | null> => {
    try {
      const updatedSOP = await SOPService.updateSOP(id, updates);
      if (updatedSOP) {
        dispatch({ type: 'UPDATE_SOP', payload: updatedSOP });
      }
      return updatedSOP;
    } catch (error) {
      console.error('Error updating SOP:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update SOP' });
      return null;
    }
  };

  const createSOP = async (sopData: Omit<SOP, 'id' | 'lastUpdated'>): Promise<SOP> => {
    try {
      const newSOP = await SOPService.createSOP(sopData);
      dispatch({ type: 'ADD_SOP', payload: newSOP });
      return newSOP;
    } catch (error) {
      console.error('Error creating SOP:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create SOP' });
      throw error;
    }
  };

  const deleteSOP = async (id: string): Promise<boolean> => {
    try {
      const success = await SOPService.deleteSOP(id);
      if (success) {
        dispatch({ type: 'REMOVE_SOP', payload: id });
      }
      return success;
    } catch (error) {
      console.error('Error deleting SOP:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete SOP' });
      return false;
    }
  };

  const submitSOPForReview = async (
    sopId: string, 
    changes: { title: string; content: string; department: string },
    reviewers: string[],
    summary: string
  ): Promise<SOP | null> => {
    try {
      const updatedSOP = await SOPService.submitSOPForReview(sopId, changes, reviewers, summary);
      if (updatedSOP) {
        dispatch({ type: 'UPDATE_SOP', payload: updatedSOP });
      }
      return updatedSOP;
    } catch (error) {
      console.error('Error submitting SOP for review:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to submit SOP for review' });
      return null;
    }
  };

  return (
    <DataContext.Provider value={{
      ...state,
      updateSOP,
      createSOP,
      deleteSOP,
      submitSOPForReview,
      refreshData
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextType {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}