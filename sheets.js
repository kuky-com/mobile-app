import { registerSheet } from 'react-native-actions-sheet';
import ActionSheets from '@/components/sheets/ActionSheets';
import ConfirmActionSheets from '@/components/sheets/ConfirmActionSheets';
import CommandActionSheets from '@/components/sheets/CommandActionSheets';
import SelectionSheet from './src/components/sheets/SelectionSheet';

registerSheet('action-sheets', ActionSheets);
registerSheet('selection-sheets', SelectionSheet);
registerSheet('confirm-action-sheets', ConfirmActionSheets);
registerSheet('cmd-action-sheets', CommandActionSheets);

export {};
