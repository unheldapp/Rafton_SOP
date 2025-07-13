import React from 'react';
import { Toaster } from "./shared/components/ui/sonner";
import { AuthProvider } from './shared/context/AuthContext';
import { AppProvider } from './shared/context/AppContext';
import { DataProvider } from './shared/context/DataContext';
import { AppRouter } from './features/dashboard/components/AppRouter';

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <DataProvider>
          <AppRouter />
          <Toaster />
        </DataProvider>
      </AppProvider>
    </AuthProvider>
  );
}