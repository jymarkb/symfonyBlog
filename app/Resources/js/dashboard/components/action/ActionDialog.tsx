import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
