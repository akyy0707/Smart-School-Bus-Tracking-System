import React, { useState } from 'react';
import { DriverApp } from './components/DriverApp';
import { ManagerApp } from './components/ManagerApp';
import { ParentApp } from './components/ParentApp';
import { LoginForm } from './components/LoginForm';
import { Toaster } from './components/ui/sonner';
import { NotificationProvider } from './components/NotificationContext';
import { NotificationPanel } from './components/NotificationPanel';
import { NotificationDemo } from './components/NotificationDemo';

type UserRole = 'driver' | 'manager' | 'parent' | null;

export default function App() {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loginKey, setLoginKey] = useState<string>('');

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setLoginKey(Date.now().toString()); // Tạo key unique cho mỗi lần đăng nhập
  };

  const handleLogout = () => {
    setUserRole(null);
    setLoginKey('');
  };

  return (
    <NotificationProvider>
      {userRole === 'driver' && (
        <>
          <DriverApp onBack={handleLogout} />
          <NotificationDemo userRole="driver" loginKey={loginKey} />
          <NotificationPanel />
          <Toaster />
        </>
      )}

      {userRole === 'manager' && (
        <>
          <ManagerApp onBack={handleLogout} />
          <NotificationDemo userRole="manager" loginKey={loginKey} />
          <NotificationPanel />
          <Toaster />
        </>
      )}

      {userRole === 'parent' && (
        <>
          <ParentApp onBack={handleLogout} />
          <NotificationDemo userRole="parent" loginKey={loginKey} />
          <NotificationPanel />
          <Toaster />
        </>
      )}

      {!userRole && (
        <>
          <LoginForm onLogin={handleLogin} />
          <NotificationPanel />
          <Toaster />
        </>
      )}
    </NotificationProvider>
  );
}