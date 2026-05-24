import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getChats, createChatWithMessage, deleteChat, getChatMessages, addMessageToChat, generateAIResponse, renameChat, togglePinChat, toggleArchiveChat, updateMessage, deleteMessage } from "@/modules/chat/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export interface AttachmentInput {
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface CreateChatArgs {
  title: string;
  content: string;
  attachments?: AttachmentInput[];
}

// Standalone hook to handle chat thread creations
export const useCreateChat = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const createChatMutation = useMutation({
    mutationFn: async (args: CreateChatArgs) => {
      const result = await createChatWithMessage(args);
      if (!result.success) {
        throw new Error(result.error || "Failed to create conversation");
      }
      return result.chat;
    },
    onSuccess: (chat) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      toast.success("Conversation started successfully");
      if (chat?.id) {
        router.replace(`/chat/${chat.id}?autoTrigger=true`);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to start conversation");
    },
  });

  return {
    createChat: createChatMutation.mutateAsync,
    isCreatingChat: createChatMutation.isPending,
    isSuccess: createChatMutation.isSuccess,
    isError: createChatMutation.isError,
    error: createChatMutation.error,
  };
};

// Standalone hook to handle thread deletions
export const useDeleteChat = () => {
  const queryClient = useQueryClient();

  const deleteChatMutation = useMutation({
    mutationFn: async (chatId: string) => {
      const result = await deleteChat(chatId);
      if (!result.success) {
        throw new Error(result.error || "Failed to delete conversation");
      }
      return chatId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      toast.success("Conversation deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete conversation");
    },
  });

  return {
    deleteChat: deleteChatMutation.mutateAsync,
    isDeletingChat: deleteChatMutation.isPending,
    isSuccess: deleteChatMutation.isSuccess,
    isError: deleteChatMutation.isError,
    error: deleteChatMutation.error,
  };
};

// Hook to handle thread renaming
export const useRenameChat = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ chatId, title }: { chatId: string; title: string }) => {
      const result = await renameChat(chatId, title);
      if (!result.success) {
        throw new Error(result.error || "Failed to rename conversation");
      }
      return result.chat;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      toast.success("Conversation renamed");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to rename conversation");
    },
  });

  return {
    renameChat: mutation.mutateAsync,
    isRenaming: mutation.isPending,
  };
};

// Hook to handle thread pinning toggles
export const useTogglePinChat = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (chatId: string) => {
      const result = await togglePinChat(chatId);
      if (!result.success) {
        throw new Error(result.error || "Failed to toggle pin state");
      }
      return result.chat;
    },
    onSuccess: (chat) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      if (chat) {
        toast.success(chat.isPinned ? "Conversation pinned" : "Conversation unpinned");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to toggle pin state");
    },
  });

  return {
    togglePin: mutation.mutateAsync,
    isTogglingPin: mutation.isPending,
  };
};

// Hook to handle thread archiving toggles
export const useToggleArchiveChat = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (chatId: string) => {
      const result = await toggleArchiveChat(chatId);
      if (!result.success) {
        throw new Error(result.error || "Failed to toggle archive state");
      }
      return result.chat;
    },
    onSuccess: (chat) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      if (chat) {
        toast.success(chat.isArchived ? "Conversation archived" : "Conversation unarchived");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to toggle archive state");
    },
  });

  return {
    toggleArchive: mutation.mutateAsync,
    isTogglingArchive: mutation.isPending,
  };
};

// Hook to query and fetch all conversations
export const useChats = () => {
  const chatsQuery = useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const result = await getChats();
      if (!result.success) {
        throw new Error(result.error || "Failed to load chats");
      }
      return result.chats || [];
    },
  });

  const { createChat, isCreatingChat } = useCreateChat();
  const { deleteChat, isDeletingChat } = useDeleteChat();
  const { renameChat, isRenaming } = useRenameChat();
  const { togglePin, isTogglingPin } = useTogglePinChat();
  const { toggleArchive, isTogglingArchive } = useToggleArchiveChat();

  return {
    chats: chatsQuery.data || [],
    isLoadingChats: chatsQuery.isLoading,
    isErrorChats: chatsQuery.isError,
    errorChats: chatsQuery.error,
    refetchChats: chatsQuery.refetch,
    
    createChat,
    isCreatingChat,
    
    deleteChat,
    isDeletingChat,

    renameChat,
    isRenaming,
    togglePin,
    isTogglingPin,
    toggleArchive,
    isTogglingArchive,
  };
};

export const useChatMessages = (chatId?: string) => {
  const queryClient = useQueryClient();

  // Query to fetch all messages in a specific chat
  const messagesQuery = useQuery({
    key: ["messages", chatId],
    queryKey: ["messages", chatId],
    queryFn: async () => {
      if (!chatId) return [];
      const result = await getChatMessages(chatId);
      if (!result.success) {
        throw new Error(result.error || "Failed to load messages");
      }
      return result.messages || [];
    },
    enabled: !!chatId,
  } as any);

  // Mutation to send a message within a chat
  const addMessageMutation = useMutation({
    mutationFn: async ({
      role,
      content,
      attachments,
    }: {
      role: "user" | "assistant";
      content: string;
      attachments?: AttachmentInput[];
    }) => {
      if (!chatId) throw new Error("No active conversation selected");
      const result = await addMessageToChat(chatId, role, content, attachments);
      if (!result.success) {
        throw new Error(result.error || "Failed to send message");
      }
      return result.message;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", chatId] });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send message");
    },
  });

  // Mutation to generate AI response from OpenRouter
  const generateAIMutation = useMutation({
    mutationFn: async (modelId: string) => {
      if (!chatId) return { success: false, error: "No active conversation selected" };
      try {
        const result = await generateAIResponse(chatId, modelId);
        return result;
      } catch (err: any) {
        return { success: false, error: err.message || "Failed to generate AI response" };
      }
    },
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ["messages", chatId] });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      if (result && !result.success) {
        toast.error(result.error || "Failed to generate AI response");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to generate AI response");
    },
  });

  // Mutation to edit a message within a chat
  const updateMessageMutation = useMutation({
    mutationFn: async ({ messageId, content }: { messageId: string; content: string }) => {
      const result = await updateMessage(messageId, content);
      if (!result.success) {
        throw new Error(result.error || "Failed to update message");
      }
      return result.message;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", chatId] });
      toast.success("Message updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update message");
    },
  });

  // Mutation to delete a message within a chat
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const result = await deleteMessage(messageId);
      if (!result.success) {
        throw new Error(result.error || "Failed to delete message");
      }
      return messageId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", chatId] });
      toast.success("Message deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete message");
    },
  });

  return {
    messages: messagesQuery.data || [],
    isLoadingMessages: messagesQuery.isLoading,
    isErrorMessages: messagesQuery.isError,
    errorMessages: messagesQuery.error,
    
    sendMessage: addMessageMutation.mutateAsync,
    isSendingMessage: addMessageMutation.isPending,

    generateAI: generateAIMutation.mutateAsync,
    isGeneratingAI: generateAIMutation.isPending,

    editMessage: updateMessageMutation.mutateAsync,
    isEditingMessage: updateMessageMutation.isPending,

    deleteMessage: deleteMessageMutation.mutateAsync,
    isDeletingMessage: deleteMessageMutation.isPending,
  };
};
