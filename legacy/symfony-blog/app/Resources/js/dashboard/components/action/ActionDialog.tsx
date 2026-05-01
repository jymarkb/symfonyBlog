import { Dialog } from '@/components/ui/dialog';
import React from 'react';

const ActionDialog = ({
  open,
  setOpen,
  children,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  children: React.ReactNode;
}) => {
  return (
    <Dialog
      open={open}
      onOpenChange={(newState) => {
        setOpen(newState);
      }}
    >
      {children}
    </Dialog>
  );
};

export default ActionDialog;
