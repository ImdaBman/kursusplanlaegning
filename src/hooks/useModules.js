import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';

const COLLECTION = 'modules';

export function useModules() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Realtids-lytter — data synkroniseres automatisk fra Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, COLLECTION), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setModules(data);
      setLoading(false);
    });
    return unsub; // afmeld lytter ved unmount
  }, []);

  const addModule = async (moduleData) => {
    const docRef = await addDoc(collection(db, COLLECTION), moduleData);
    return { id: docRef.id, ...moduleData };
  };

  const updateModule = async (id, updates) => {
    await updateDoc(doc(db, COLLECTION, id), updates);
  };

  const deleteModule = async (id) => {
    await deleteDoc(doc(db, COLLECTION, id));
  };

  const addModules = async (modulesData) => {
    const batch = writeBatch(db);
    for (const m of modulesData) {
      const ref = doc(collection(db, COLLECTION));
      batch.set(ref, m);
    }
    await batch.commit();
  };

  return { modules, loading, addModule, updateModule, deleteModule, addModules };
}
