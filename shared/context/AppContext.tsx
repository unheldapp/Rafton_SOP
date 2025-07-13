import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, Page, SOP, Template, WorkingCopy, PendingReviewData } from '../types';

interface AppContextType extends AppState {
  navigateTo: (page: Page, item?: SOP | Template | WorkingCopy) => void;
  setSelectedSOP: (sop: SOP | null) => void;
  setSelectedTemplate: (template: Template | null) => void;
  setSelectedWorkingCopy: (workingCopy: WorkingCopy | null) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setNewReviewRequest: (isNew: boolean) => void;
  setPendingReviewData: (data: PendingReviewData | null) => void;
}

type AppAction = 
  | { type: 'NAVIGATE_TO'; payload: { page: Page; item?: SOP | Template | WorkingCopy } }
  | { type: 'SET_SELECTED_SOP'; payload: SOP | null }
  | { type: 'SET_SELECTED_TEMPLATE'; payload: Template | null }
  | { type: 'SET_SELECTED_WORKING_COPY'; payload: WorkingCopy | null }
  | { type: 'SET_SIDEBAR_COLLAPSED'; payload: boolean }
  | { type: 'SET_NEW_REVIEW_REQUEST'; payload: boolean }
  | { type: 'SET_PENDING_REVIEW_DATA'; payload: PendingReviewData | null };

const initialState: AppState = {
  currentPage: 'login',
  selectedSOP: null,
  selectedTemplate: null,
  selectedWorkingCopy: null,
  isSidebarCollapsed: false,
  isNewReviewRequest: false,
  pendingReviewData: null
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'NAVIGATE_TO':
      const { page, item } = action.payload;
      console.log('AppContext NAVIGATE_TO:', { page, item, itemType: typeof item });
      
      let newState = { 
        ...state, 
        currentPage: page,
        isNewReviewRequest: page !== 'sop-review' ? false : state.isNewReviewRequest,
        pendingReviewData: page !== 'submit-review' ? null : state.pendingReviewData
      };

      if (item) {
        // Check if it's a working copy
        if ('originalSOPId' in item) {
          console.log('Detected as WorkingCopy');
          newState.selectedWorkingCopy = item as WorkingCopy;
          newState.selectedSOP = null;
          newState.selectedTemplate = null;
        }
        // Check if it's a template (templates have specific template properties that SOPs don't have)
        else if ('content' in item && 'description' in item && !('id' in item && 'status' in item)) {
          console.log('Detected as Template');
          newState.selectedTemplate = item as Template;
          newState.selectedSOP = null;
          newState.selectedWorkingCopy = null;
        } 
        // It's an SOP (has id, status, etc.)
        else {
          console.log('Detected as SOP');
          newState.selectedSOP = item as SOP;
          newState.selectedTemplate = null;
          newState.selectedWorkingCopy = null;
        }
      } else {
        // Clear selections when navigating without parameters
        if (page !== 'editor' && page !== 'version-control') {
          newState.selectedSOP = null;
          newState.selectedTemplate = null;
          newState.selectedWorkingCopy = null;
        }
      }

      return newState;

    case 'SET_SELECTED_SOP':
      return { ...state, selectedSOP: action.payload };
    case 'SET_SELECTED_TEMPLATE':
      return { ...state, selectedTemplate: action.payload };
    case 'SET_SELECTED_WORKING_COPY':
      return { ...state, selectedWorkingCopy: action.payload };
    case 'SET_SIDEBAR_COLLAPSED':
      return { ...state, isSidebarCollapsed: action.payload };
    case 'SET_NEW_REVIEW_REQUEST':
      return { ...state, isNewReviewRequest: action.payload };
    case 'SET_PENDING_REVIEW_DATA':
      return { ...state, pendingReviewData: action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const navigateTo = (page: Page, item?: SOP | Template | WorkingCopy): void => {
    dispatch({ type: 'NAVIGATE_TO', payload: { page, item } });
  };

  const setSelectedSOP = (sop: SOP | null): void => {
    dispatch({ type: 'SET_SELECTED_SOP', payload: sop });
  };

  const setSelectedTemplate = (template: Template | null): void => {
    dispatch({ type: 'SET_SELECTED_TEMPLATE', payload: template });
  };

  const setSelectedWorkingCopy = (workingCopy: WorkingCopy | null): void => {
    dispatch({ type: 'SET_SELECTED_WORKING_COPY', payload: workingCopy });
  };

  const setSidebarCollapsed = (collapsed: boolean): void => {
    dispatch({ type: 'SET_SIDEBAR_COLLAPSED', payload: collapsed });
  };

  const setNewReviewRequest = (isNew: boolean): void => {
    dispatch({ type: 'SET_NEW_REVIEW_REQUEST', payload: isNew });
  };

  const setPendingReviewData = (data: PendingReviewData | null): void => {
    dispatch({ type: 'SET_PENDING_REVIEW_DATA', payload: data });
  };

  return (
    <AppContext.Provider value={{
      ...state,
      navigateTo,
      setSelectedSOP,
      setSelectedTemplate,
      setSelectedWorkingCopy,
      setSidebarCollapsed,
      setNewReviewRequest,
      setPendingReviewData
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}