import React from 'react';
import './KegScanner.css';
import type { KegScannerProps } from './keg-scanner/kegScanner.types';
import type { ActivePage, UserRole } from '../types/app';
import KegScannerPage from './keg-scanner/KegScannerPage';

type Props = KegScannerProps & {
  onNavigate: (page: ActivePage) => void;
  onLogout: () => void;
  userRole: UserRole;
};

export const KegScanner: React.FC<Props> = ({
  userId,
  onNavigate,
  onLogout,
  userRole,
}) => {
  return (
    <KegScannerPage
      userId={userId}
      onNavigate={onNavigate}
      onLogout={onLogout}
      userRole={userRole}
    />
  );
};