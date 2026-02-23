import { useState, useEffect } from 'react';

const STORAGE_KEY = 'kursusplanlaegger_modules';

export function useModules() {
  const [modules, setModules] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(modules));
  }, [modules]);

  const addModule = (moduleData) => {
    const newModule = { id: crypto.randomUUID(), ...moduleData };
    setModules(prev => [...prev, newModule]);
    return newModule;
  };

  const updateModule = (id, updates) => {
    setModules(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const deleteModule = (id) => {
    setModules(prev => prev.filter(m => m.id !== id));
  };

  const addModules = (modulesData) => {
    const newModules = modulesData.map(m => ({ id: crypto.randomUUID(), ...m }));
    setModules(prev => [...prev, ...newModules]);
  };

  return { modules, addModule, updateModule, deleteModule, addModules };
}
