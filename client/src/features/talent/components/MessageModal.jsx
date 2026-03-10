import React, { useState, useEffect, useRef } from "react";
import { X, Send } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import {
  useApplicationMessages,
  useSendMessage,
} from "../../../hooks/useTalent";
import { useAuth } from "../../../context/AuthContext";
import { Avatar } from "../../../components/ui/Avatar";

export function MessageModal({ isOpen, onClose, applicationId }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const messagesEndRef = useRef(null);

  const { data, isLoading } = useApplicationMessages(applicationId);
  const sendMessageMutation = useSendMessage(applicationId);

  const messages = React.useMemo(() => data?.messages || [], [data?.messages]);

  const recipientName = React.useMemo(() => {
    if (messages.length === 0) return "User";
    const otherMsg = messages.find((m) => m.sender_id !== user?.id);
    return otherMsg ? otherMsg.sender_name : "User";
  }, [messages, user?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 50); // small delay to let render finish
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    sendMessageMutation.mutate(
      { content: content.trim() },
      {
        onSuccess: () => {
          setContent("");
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-surface-dark w-full max-w-lg rounded-2xl shadow-xl flex flex-col h-[600px] max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <h2 className="font-bold text-lg text-text-primary dark:text-white flex items-center gap-2">
            Messaging {recipientName}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-text-secondary" />
          </button>
        </div>

        {/* Messages Layout */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-surface-dark/50">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-text-tertiary mt-10">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                >
                  <Avatar
                    src={
                      msg.sender_avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender_name)}&background=random`
                    }
                    size="sm"
                    className="shrink-0 mt-1"
                  />
                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                      isMe
                        ? "bg-primary text-white rounded-tr-none"
                        : "bg-white dark:bg-gray-800 text-text-primary dark:text-gray-200 rounded-tl-none border border-border-light dark:border-border-dark"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form
          onSubmit={handleSend}
          className="p-4 border-t border-border-light dark:border-border-dark bg-white dark:bg-surface-dark"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 h-10 px-4 rounded-full border border-border-light bg-gray-50 dark:bg-gray-800 dark:border-border-dark focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
            <Button
              type="submit"
              className="rounded-full w-10 h-10 p-0 flex items-center justify-center shrink-0"
              disabled={!content.trim() || sendMessageMutation.isPending}
            >
              <Send className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
