import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface UniversalDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemName: string;
  itemType?: string;
  isDisabled?: boolean;
  disableReason?: string;
}

export const UniversalDeleteDialog: React.FC<UniversalDeleteDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  title,
  description,
  itemName,
  itemType = 'elemento',
  isDisabled = false,
  disableReason
}) => {
  const handleConfirm = () => {
    if (!isDisabled) {
      onConfirm();
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="flex-1">
              <AlertDialogTitle className="text-lg">
                {title}
              </AlertDialogTitle>
            </div>
          </div>
        </AlertDialogHeader>
        
        <div className="space-y-4 py-4">
          <AlertDialogDescription className="text-base">
            {description}
          </AlertDialogDescription>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-800">
                <strong>{itemType}:</strong> {itemName}
              </span>
            </div>
          </div>
          
          {isDisabled && disableReason && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-800">
                  <strong>No se puede eliminar:</strong> {disableReason}
                </span>
              </div>
            </div>
          )}
        </div>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="w-full sm:w-auto">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDisabled}
            className={`w-full sm:w-auto ${
              isDisabled 
                ? 'bg-gray-300 hover:bg-gray-300 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700 focus:ring-red-600'
            }`}
          >
            {isDisabled ? 'No disponible' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
