import React, { createContext, useContext } from 'react';
import { Modal, Pressable as RNPressable, View } from 'react-native';

import { Box } from '@/components/ui/box';

type AlertDialogContextValue = {
  onClose?: () => void;
};

const AlertDialogContext = createContext<AlertDialogContextValue>({});

type AlertDialogProps = React.PropsWithChildren<{
  isOpen: boolean;
  onClose?: () => void;
}>;

function AlertDialog({ children, isOpen, onClose }: AlertDialogProps) {
  return (
    <AlertDialogContext.Provider value={{ onClose }}>
      <Modal
        animationType="fade"
        onRequestClose={onClose}
        transparent
        visible={isOpen}
      >
        <View className="flex-1 items-center justify-center px-5">
          {children}
        </View>
      </Modal>
    </AlertDialogContext.Provider>
  );
}

type AlertDialogBackdropProps = {
  className?: string;
  closeOnPress?: boolean;
};

function AlertDialogBackdrop({
  className,
  closeOnPress = true,
}: AlertDialogBackdropProps) {
  const { onClose } = useContext(AlertDialogContext);

  return (
    <RNPressable
      className={`absolute inset-0 bg-black/50 ${className ?? ''}`}
      onPress={closeOnPress ? onClose : undefined}
    />
  );
}

type DialogSectionProps = React.PropsWithChildren<{
  className?: string;
}>;

function AlertDialogContent({ children, className }: DialogSectionProps) {
  return (
    <Box
      className={`w-full max-w-[360px] rounded-3xl bg-background-0 p-5 shadow-soft-2 ${className ?? ''}`}
    >
      {children}
    </Box>
  );
}

function AlertDialogHeader({ children, className }: DialogSectionProps) {
  return <View className={className}>{children}</View>;
}

function AlertDialogBody({ children, className }: DialogSectionProps) {
  return <View className={className}>{children}</View>;
}

function AlertDialogFooter({ children, className }: DialogSectionProps) {
  return (
    <View className={`mt-5 flex-row justify-end gap-3 ${className ?? ''}`}>
      {children}
    </View>
  );
}

export {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
};
