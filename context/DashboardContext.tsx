import React, { createContext, useContext, useState } from 'react';

const DashboardContext = createContext<any>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [refreshFlag, setRefreshFlag] = useState(0);

  const refreshDashboard = () => setRefreshFlag((prev) => prev + 1);

  return (
    <DashboardContext.Provider value={{ refreshFlag, refreshDashboard }}>
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => useContext(DashboardContext);
