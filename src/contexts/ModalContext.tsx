"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ModalContextType {
  isLogoutOpen: boolean;
  openLogout: () => void;
  closeLogout: () => void;
  
  isNotificationsOpen: boolean;
  openNotifications: () => void;
  closeNotifications: () => void;

  isUploadOpen: boolean;
  openUpload: () => void;
  closeUpload: () => void;

  isAdminQueueOpen: boolean;
  openAdminQueue: () => void;
  closeAdminQueue: () => void;

  isEditBookOpen: boolean;
  openEditBook: (bookData?: any) => void;
  closeEditBook: () => void;
  editBookData: any | null;

  isDeleteBookOpen: boolean;
  openDeleteBook: (docId: string) => void;
  closeDeleteBook: () => void;
  deleteBookId: string | null;

  toast: { show: boolean, message: string, isError: boolean };
  showToast: (message: string, isError?: boolean) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isLogoutOpen, setLogoutOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [isAdminQueueOpen, setAdminQueueOpen] = useState(false);
  
  const [isEditBookOpen, setEditBookOpen] = useState(false);
  const [editBookData, setEditBookData] = useState<any | null>(null);

  const [isDeleteBookOpen, setDeleteBookOpen] = useState(false);
  const [deleteBookId, setDeleteBookId] = useState<string | null>(null);

  const [toast, setToast] = useState({ show: false, message: '', isError: false });

  const showToast = (message: string, isError = false) => {
    setToast({ show: true, message, isError });
    setTimeout(() => {
      setToast({ show: false, message: '', isError: false });
    }, 3500);
  };

  return (
    <ModalContext.Provider value={{
      isLogoutOpen, openLogout: () => setLogoutOpen(true), closeLogout: () => setLogoutOpen(false),
      isNotificationsOpen, openNotifications: () => setNotificationsOpen(true), closeNotifications: () => setNotificationsOpen(false),
      isUploadOpen, openUpload: () => setUploadOpen(true), closeUpload: () => setUploadOpen(false),
      isAdminQueueOpen, openAdminQueue: () => setAdminQueueOpen(true), closeAdminQueue: () => setAdminQueueOpen(false),
      isEditBookOpen, openEditBook: (data) => { setEditBookData(data); setEditBookOpen(true); }, closeEditBook: () => setEditBookOpen(false), editBookData,
      isDeleteBookOpen, openDeleteBook: (id) => { setDeleteBookId(id); setDeleteBookOpen(true); }, closeDeleteBook: () => setDeleteBookOpen(false), deleteBookId,
      toast, showToast
    }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModals() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModals must be used within a ModalProvider');
  }
  return context;
}
