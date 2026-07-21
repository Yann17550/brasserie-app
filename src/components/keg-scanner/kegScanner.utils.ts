import type { EtatFut, MovementType } from '../../types/app';
import type { KegWithCurrentState, ScannerAction } from './kegScanner.types';

export function getCurrentMovementLabel(movementType: MovementType | null) {
  if (!movementType) return 'Non défini';
  return movementType === 'stock' ? 'En stock' : 'Sorti';
}

export function getCurrentEtatLabel(etatFut: EtatFut | null) {
  if (!etatFut) return 'Non défini';
  return etatFut === 'plein' ? 'Plein' : 'Vide';
}

export function getAvailableActions(keg: KegWithCurrentState | null): ScannerAction[] {
  if (!keg || !keg.current_movement_type) {
    return ['return_stock_vide', 'return_stock_plein', 'checkout'];
  }

  if (keg.current_movement_type === 'sorti') {
    return ['return_stock_vide', 'return_stock_plein'];
  }

  if (keg.current_movement_type === 'stock' && keg.current_etat_fut === 'vide') {
    return ['fill'];
  }

  if (keg.current_movement_type === 'stock' && keg.current_etat_fut === 'plein') {
    return ['empty', 'checkout'];
  }

  return ['fill', 'empty', 'checkout'];
}

export function getActionLabel(action: ScannerAction) {
  switch (action) {
    case 'return_stock_vide':
      return 'Retour en stock vide';
    case 'return_stock_plein':
      return 'Retour en stock plein';
    case 'fill':
      return 'Passer plein';
    case 'empty':
      return 'Passer vide';
    case 'checkout':
      return 'Sortir chez le client';
    default:
      return action;
  }
}

export function getActionPayload(
  action: ScannerAction,
  selectedClientId: string
): {
  movementType: MovementType;
  etatFut: EtatFut;
  clientId: string | null;
} {
  switch (action) {
    case 'return_stock_vide':
      return {
        movementType: 'stock',
        etatFut: 'vide',
        clientId: null,
      };
    case 'return_stock_plein':
      return {
        movementType: 'stock',
        etatFut: 'plein',
        clientId: null,
      };
    case 'fill':
      return {
        movementType: 'stock',
        etatFut: 'plein',
        clientId: null,
      };
    case 'empty':
      return {
        movementType: 'stock',
        etatFut: 'vide',
        clientId: null,
      };
    case 'checkout':
      return {
        movementType: 'sorti',
        etatFut: 'plein',
        clientId: selectedClientId || null,
      };
    default:
      return {
        movementType: 'stock',
        etatFut: 'vide',
        clientId: null,
      };
  }
}

export function requiresClient(action: ScannerAction | '') {
  return action === 'checkout';
}

export function isActionAllowed(
  keg: KegWithCurrentState | null,
  action: ScannerAction | ''
) {
  if (!action) return false;
  return getAvailableActions(keg).includes(action);
}