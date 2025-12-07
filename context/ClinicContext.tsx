
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ClinicConfig } from '../types';
import { DataService } from '../services/dataService';

interface ClinicContextType {
  config: ClinicConfig;
  updateConfig: (newConfig: ClinicConfig) => void;
  isEmergencyRinging: boolean;
  stopRinging: () => void;
  triggerRefresh: () => void;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export const ClinicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<ClinicConfig>({
      name: 'CliniqueBeta',
      slogan: 'Loading...',
      phone: '',
      address: ''
  });
  const [isEmergencyRinging, setIsEmergencyRinging] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load Config
  useEffect(() => {
    DataService.getConfig().then(setConfig);
  }, [refreshTrigger]);

  // Poll for Emergencies
  useEffect(() => {
    const checkEmergencies = async () => {
        const stats = await DataService.getStats();
        // Trigger alarm ONLY if there are unacknowledged emergencies
        if (stats.unacknowledgedEmergencies > 0) {
             setIsEmergencyRinging(true);
        } else {
             setIsEmergencyRinging(false);
        }
    };

    checkEmergencies();
    const interval = setInterval(checkEmergencies, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateConfig = async (newConfig: ClinicConfig) => {
      await DataService.saveConfig(newConfig);
      setConfig(newConfig);
  };

  const stopRinging = () => {
      setIsEmergencyRinging(false);
  };

  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

  return (
    <ClinicContext.Provider value={{ config, updateConfig, isEmergencyRinging, stopRinging, triggerRefresh }}>
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) throw new Error('useClinic must be used within a ClinicProvider');
  return context;
};
