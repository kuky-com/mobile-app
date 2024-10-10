import { registerSheet } from 'react-native-actions-sheet';
import ActionSheets from '@/components/sheets/ActionSheets';
import ConfirmActionSheets from '@/components/sheets/ConfirmActionSheets';
import CommandActionSheets from '@/components/sheets/CommandActionSheets';

registerSheet('action-sheets', ActionSheets);
registerSheet('confirm-action-sheets', ConfirmActionSheets);
registerSheet('cmd-action-sheets', CommandActionSheets);

export {};
