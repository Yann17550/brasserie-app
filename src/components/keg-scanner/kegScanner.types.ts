import type { Client, EtatFut, Keg, MovementType } from '../../types/app';

export interface KegScannerProps {
  userId: string;
}

export type KegWithCurrentState = Keg & {
  current_movement_type: MovementType | null;
  current_client_id: string | null;
  current_etat_fut: EtatFut | null;
};

export type ScannerAction =
  | 'return_stock_vide'
  | 'return_stock_plein'
  | 'fill'
  | 'empty'
  | 'checkout';