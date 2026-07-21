import React from 'react';
import './KegScanner.css';
import type { KegScannerProps } from './keg-scanner/kegScanner.types';
import KegScannerPage from './keg-scanner/KegScannerPage';

export const KegScanner: React.FC<KegScannerProps> = ({ userId }) => {
  return <KegScannerPage userId={userId} />;
};