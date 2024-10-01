import { registerSheet } from 'react-native-actions-sheet';
import ActionSheets from '@/components/sheets/ActionSheets';
import ConfirmActionSheets from '@/components/sheets/ConfirmActionSheets';

registerSheet('action-sheets', ActionSheets);
registerSheet('confirm-action-sheets', ConfirmActionSheets);

export {};
