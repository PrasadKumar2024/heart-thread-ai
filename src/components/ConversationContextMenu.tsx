import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';
import { useAppStore, type Conversation } from '@/lib/store';
import { updateConversationTitle, deleteConversationFromDB } from '@/lib/chatHistory';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Props {
  conversation: Conversation;
  position: { x: number; y: number };
  onClose: () => void;
}

export function ConversationContextMenu({ conversation, position, onClose }: Props) {
  const { renameConversation, deleteConversation, createConversation, activeMode } = useAppStore();
  const [renaming, setRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(conversation.title);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRename = () => {
    setNewTitle(conversation.title);
    setRenaming(true);
  };

  const handleRenameSubmit = async () => {
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle || isSaving) return;

    try {
      setIsSaving(true);
      await updateConversationTitle(conversation.id, trimmedTitle);
      renameConversation(conversation.id, trimmedTitle);
      setRenaming(false);
      onClose();
    } catch {
      toast.error('Failed to rename conversation');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    setConfirmDelete(true);
  };

  const confirmDeleteAction = async () => {
    if (isDeleting) return;

    const store = useAppStore.getState();
    const wasActive = store.activeConversationId === conversation.id;

    try {
      setIsDeleting(true);
      await deleteConversationFromDB(conversation.id);
      deleteConversation(conversation.id);
      if (wasActive) {
        createConversation(activeMode);
      }
      setConfirmDelete(false);
      onClose();
    } catch {
      toast.error('Failed to delete conversation');
    } finally {
      setIsDeleting(false);
    }
  };

  const menuItems = [
    { icon: Pencil, label: 'Rename', action: handleRename },
    { icon: Trash2, label: 'Delete', action: handleDelete, danger: true },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed z-[200] rounded-xl border border-border bg-card shadow-xl py-1 min-w-[160px]"
        style={{ left: position.x, top: position.y }}
      >
        {!renaming && !confirmDelete && menuItems.map(({ icon: Icon, label, action, danger }) => (
          <button
            key={label}
            onClick={action}
            className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-secondary ${danger ? 'text-red-400 hover:text-red-300' : 'text-foreground'}`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </motion.div>

      <Dialog
        open={renaming}
        onOpenChange={(open) => {
          setRenaming(open);
          if (!open) onClose();
        }}
      >
        <DialogContent className="bg-card border-border sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground text-sm">Rename conversation</DialogTitle>
          </DialogHeader>
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit()}
            autoFocus
            disabled={isSaving}
            className="w-full rounded-xl bg-secondary"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1 rounded-xl"
              onClick={() => {
                setRenaming(false);
                onClose();
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 rounded-xl"
              onClick={handleRenameSubmit}
              disabled={isSaving || !newTitle.trim()}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmDelete}
        onOpenChange={(open) => {
          setConfirmDelete(open);
          if (!open) onClose();
        }}
      >
        <DialogContent className="bg-card border-border sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground text-sm">Delete conversation?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This cannot be undone.</p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setConfirmDelete(false)}
              className="flex-1 rounded-xl"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeleteAction}
              className="flex-1 rounded-xl"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
