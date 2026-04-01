import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';
import { useAppStore, type Conversation } from '@/lib/store';
import { updateConversationTitle, deleteConversationFromDB } from '@/lib/chatHistory';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

  const handleRename = () => {
    setRenaming(true);
    onClose();
  };

  const handleRenameSubmit = () => {
    if (newTitle.trim()) {
      renameConversation(conversation.id, newTitle.trim());
      updateConversationTitle(conversation.id, newTitle.trim());
    }
    setRenaming(false);
  };

  const handleDelete = () => {
    setConfirmDelete(true);
    onClose();
  };

  const confirmDeleteAction = () => {
    const store = useAppStore.getState();
    const wasActive = store.activeConversationId === conversation.id;
    deleteConversation(conversation.id);
    deleteConversationFromDB(conversation.id);
    setConfirmDelete(false);
    if (wasActive) {
      createConversation(activeMode);
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
        {menuItems.map(({ icon: Icon, label, action, danger }) => (
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

      {/* Rename dialog */}
      <Dialog open={renaming} onOpenChange={setRenaming}>
        <DialogContent className="bg-card border-border sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground text-sm">Rename conversation</DialogTitle>
          </DialogHeader>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit()}
            autoFocus
            className="w-full rounded-xl bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
          <button
            onClick={handleRenameSubmit}
            className="w-full rounded-xl bg-primary py-2 text-sm font-medium text-primary-foreground"
          >
            Save
          </button>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="bg-card border-border sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground text-sm">Delete conversation?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This cannot be undone.</p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmDelete(false)}
              className="flex-1 rounded-xl bg-secondary py-2 text-sm text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteAction}
              className="flex-1 rounded-xl bg-red-500/20 py-2 text-sm text-red-400 font-medium"
            >
              Delete
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
