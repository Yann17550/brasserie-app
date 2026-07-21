import React from 'react';
import { KegScannerForm } from './KegScannerForm';
import { KegScannerStatus } from './KegScannerStatus';
import { useKegScanner } from './useKegScanner';

type Props = {
  userId: string;
};

export default function KegScannerPage({ userId }: Props) {
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
      <h2 className="keg-scanner__title">Scanner un fût</h2>

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