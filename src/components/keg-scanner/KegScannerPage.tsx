import React from 'react';
import { KegScannerForm } from './KegScannerForm';
import { KegScannerStatus } from './KegScannerStatus';
import { useKegScanner } from './useKegScanner';
import { AppHeader, getCommonHeaderActions } from '../AppHeader';

type Props = {
  userId: string;
  onNavigate: (page: import('../../types/app').ActivePage) => void;
  onLogout: () => void;
  userRole: import('../../types/app').UserRole;
};

export default function KegScannerPage({
  userId,
  onNavigate,
  onLogout,
  userRole,
}: Props) {
  const {
    scanResult,
    identifiedKeg,
    clients,
    selectedAction,
    selectedClientId,
    statusMessage,
    errorMessage,
    debugInfo,
    isLoading,
    movementSaved,
    availableActions,
    setSelectedAction,
    setSelectedClientId,
    resetFormState,
    handleSubmitMovement,
  } = useKegScanner(userId);

  return (
    <div className="keg-scanner">
      <AppHeader
        actions={getCommonHeaderActions({
          onNavigate,
          onLogout,
          userRole,
        })}
      />

      {!scanResult && <div id="reader" className="keg-scanner__reader"></div>}

      <KegScannerStatus
        scanResult={scanResult}
        identifiedKeg={identifiedKeg}
        statusMessage={statusMessage}
        errorMessage={errorMessage}
        debugInfo={debugInfo}
      />

      {identifiedKeg && !movementSaved && (
        <KegScannerForm
          availableActions={availableActions}
          clients={clients}
          selectedAction={selectedAction}
          selectedClientId={selectedClientId}
          isLoading={isLoading}
          onActionChange={setSelectedAction}
          onClientChange={setSelectedClientId}
          onSubmit={handleSubmitMovement}
        />
      )}

      {!isLoading && scanResult && (
        <button
          type="button"
          onClick={resetFormState}
          className="keg-scanner__button keg-scanner__button--restart"
        >
          Scanner un autre fût
        </button>
      )}
    </div>
  );
}