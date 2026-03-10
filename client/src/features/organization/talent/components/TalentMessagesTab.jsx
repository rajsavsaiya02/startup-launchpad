import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  MessageSquare,
  Send,
  Search,
  CheckCircle2,
  ChevronRight,
  Bookmark,
  Users,
  Trash2,
} from "lucide-react";
import {
  useOrgConversations,
  useApplicationMessages,
  useSendMessage,
  useDirectMessages,
  useSendDirectMessage,
  useDeleteConversation,
} from "../../../../hooks/useTalent";
import { useAuth } from "../../../../context/AuthContext";
import { Avatar } from "../../../../components/ui/Avatar";
import { Button } from "../../../../components/ui/Button";
import { Badge } from "../../../../components/ui/Badge";
import { cn } from "../../../../utils/cn";

// ── Helpers ───────────────────────────────────────────────────────────────────
const TYPE_LABEL = {
  application: { label: "Applied", cls: "bg-primary/10 text-primary" },
  direct: {
    label: "Direct",
    cls: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
  },
};

// ── Smart Messages Panel ──────────────────────────────────────────────────────
function MessagesPanel({ conv, orgId, user }) {
  const [text, setText] = useState("");
  const endRef = useRef(null);
  const isApplication = conv?.type === "application";

  const { data: appMsgData, isLoading: isLoadingAppMsgs } =
    useApplicationMessages(isApplication ? conv?.application_id : null);

  const { data: dirMsgData, isLoading: isLoadingDirMsgs } = useDirectMessages(
    !isApplication ? conv?.freelancer_id : null,
    !isApplication ? orgId : null,
  );

  const sendAppMsg = useSendMessage();
  const sendDirMsg = useSendDirectMessage();

  const messages = useMemo(() => {
    return isApplication
      ? appMsgData?.messages || []
      : dirMsgData?.messages || [];
  }, [isApplication, appMsgData?.messages, dirMsgData?.messages]);

  const isLoading = isApplication ? isLoadingAppMsgs : isLoadingDirMsgs;
  const isPending = isApplication ? sendAppMsg.isPending : sendDirMsg.isPending;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (isApplication) {
      sendAppMsg.mutate(
        { applicationId: conv.application_id, content: text.trim() },
        { onSuccess: () => setText("") },
      );
    } else {
      sendDirMsg.mutate(
        {
          userId: conv.freelancer_id,
          content: text.trim(),
          organizationId: orgId,
        },
        {
          onSuccess: () => setText(""),
          onError: () => {
            // Error already handled or can be handled globally
          },
        },
      );
    }
  };

  if (!conv) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 opacity-60">
        <div className="bg-primary/5 p-4 rounded-full mb-4">
          <MessageSquare className="h-12 w-12 text-primary/40" />
        </div>
        <p className="font-bold text-text-secondary">
          Select a conversation to start chatting.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-gray-50/30 dark:bg-gray-900/10 z-10">
        <div className="flex items-center gap-3">
          <Avatar
            src={conv.freelancer_avatar}
            name={conv.freelancer_name}
            className="h-9 w-9 border border-primary/20"
          />
          <div>
            <h3 className="font-bold text-sm text-text-primary dark:text-white leading-tight">
              {conv.freelancer_name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="flex h-1.5 w-1.5 rounded-full bg-success" />
              <span className="text-[10px] font-black uppercase text-text-tertiary tracking-widest leading-none">
                Online Now
              </span>
            </div>
          </div>
        </div>
        <Badge
          variant="neutral"
          className={cn(
            "text-[10px] uppercase font-black border-transparent",
            TYPE_LABEL[conv.type]?.cls,
          )}
        >
          {conv.type === "application"
            ? conv.opportunity_title
            : "Direct Message"}
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-linear-to-b from-gray-50/50 to-white dark:from-gray-900/5 dark:to-surface-dark">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Send className="h-8 w-8 text-primary" />
            </div>
            <h4 className="font-bold text-text-primary dark:text-white mb-1">
              Start the Conversation
            </h4>
            <p className="text-xs text-text-secondary max-w-xs">
              {conv.type === "application"
                ? `Ask a question or follow up with ${conv.freelancer_name} regarding their application.`
                : `Send a direct message to ${conv.freelancer_name} — they've been shortlisted and can respond here.`}
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender_id === user?.id;
            const showAvatar =
              idx === 0 || messages[idx - 1].sender_id !== msg.sender_id;
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3 animate-in fade-in slide-in-from-bottom-1 duration-300",
                  isMe ? "flex-row-reverse" : "flex-row",
                )}
              >
                <div className="w-8 shrink-0">
                  {showAvatar && (
                    <Avatar
                      src={isMe ? user?.avatar : msg.sender_avatar}
                      name={isMe ? user?.name : msg.sender_name}
                      size="sm"
                      className="h-8 w-8 border-2 border-white dark:border-gray-800 shadow-sm"
                    />
                  )}
                </div>
                <div
                  className={cn(
                    "max-w-[70%] flex flex-col",
                    isMe ? "items-end" : "items-start",
                  )}
                >
                  <div
                    className={cn(
                      "px-4 py-2.5 rounded-2xl text-[13px] font-medium leading-relaxed shadow-sm",
                      isMe
                        ? "bg-primary text-white rounded-tr-none shadow-primary/20"
                        : "bg-white dark:bg-gray-800 text-text-primary dark:text-gray-200 rounded-tl-none border border-border-light dark:border-border-dark",
                    )}
                  >
                    {msg.content}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 px-1">
                    <span className="text-[9px] text-text-tertiary font-bold uppercase tracking-tighter">
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {isMe && (
                      <CheckCircle2 className="h-3 w-3 text-primary opacity-60" />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <div className="p-4 border-t border-border-light dark:border-border-dark bg-white dark:bg-surface-dark">
        {conv.is_disabled ? (
          <div className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-border-light dark:border-border-dark">
            <p className="text-sm font-medium text-text-secondary">
              This conversation is no longer active.
            </p>
            <p className="text-xs text-text-tertiary mt-1">
              The talent is no longer shortlisted or unavailable.
            </p>
          </div>
        ) : (
          <>
            <form
              onSubmit={handleSend}
              className="relative flex items-center gap-2"
            >
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your message…"
                className="flex-1 h-12 pl-5 pr-12 rounded-2xl bg-gray-50 dark:bg-gray-800 border-border-light dark:border-border-dark border focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium shadow-inner"
              />
              <Button
                type="submit"
                disabled={!text.trim() || isPending}
                className="absolute right-1.5 h-9 w-9 p-0 rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center transition-transform active:scale-95"
              >
                <Send
                  className={cn(
                    "h-4 w-4 transition-transform",
                    text.trim() && "translate-x-0.5 -translate-y-0.5",
                  )}
                />
              </Button>
            </form>
            <p className="text-[10px] text-text-tertiary mt-2 text-center font-bold tracking-widest uppercase opacity-60">
              Press Enter to send
            </p>
          </>
        )}
      </div>
    </>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function TalentMessagesTab() {
  const { user } = useAuth();
  const { freelancerId } = useParams(); // For deep linking via /messages/:freelancerId
  const [selectedKey, setSelectedKey] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const deleteMutation = useDeleteConversation();

  const { data: convData, isLoading: isLoadingConvs } = useOrgConversations();
  const conversations = useMemo(
    () => convData?.conversations || [],
    [convData?.conversations],
  );
  const orgId = convData?.organization_id;

  const convKey = (c) =>
    c.type === "application"
      ? `app-${c.application_id}`
      : `dir-${c.freelancer_id}`;

  const activeKey = useMemo(() => {
    if (selectedKey) return selectedKey;
    // Attempt to auto-select from URL param
    if (freelancerId && conversations.length > 0) {
      const match = conversations.find(
        (c) => String(c.freelancer_id) === String(freelancerId),
      );
      if (match) return convKey(match);
    }
    // Default to first
    return conversations.length > 0 ? convKey(conversations[0]) : null;
  }, [selectedKey, conversations, freelancerId]);

  const selectedConv = useMemo(
    () => conversations.find((c) => convKey(c) === activeKey),
    [conversations, activeKey],
  );

  const filtered = useMemo(() => {
    return conversations.filter(
      (c) =>
        !searchQuery ||
        c.freelancer_name?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [conversations, searchQuery]);

  if (isLoadingConvs && conversations.length === 0) {
    return (
      <div className="flex justify-center items-center h-[600px] bg-white dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isLoadingConvs && conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-white dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm text-center p-8">
        <div className="p-4 bg-primary/10 rounded-full mb-4">
          <MessageSquare className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-xl font-black text-text-primary dark:text-white uppercase tracking-tight mb-2">
          No Conversations Yet
        </h3>
        <p className="text-sm text-text-secondary dark:text-gray-400 max-w-sm leading-relaxed">
          Shortlist a candidate in the <strong>Find Talent</strong> tab to start
          a direct conversation, or review applications to message applicants.
        </p>
      </div>
    );
  }

  return (
    <div className="flex bg-white dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden h-[700px]">
      <div className="w-80 border-r border-border-light dark:border-border-dark flex flex-col bg-gray-50/50 dark:bg-gray-900/10 shrink-0">
        <div className="p-4 border-b border-border-light dark:border-border-dark bg-white dark:bg-surface-dark">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats…"
              className="w-full h-9 pl-9 pr-4 rounded-lg bg-gray-100 dark:bg-gray-800 border-transparent focus:ring-2 focus:ring-primary/20 text-xs font-medium transition-all"
            />
          </div>
        </div>

        {filtered.some((c) => c.type === "application") && (
          <p className="text-[9px] font-black uppercase tracking-widest text-text-tertiary px-4 pt-3 pb-1 flex items-center gap-1.5">
            <Users className="h-3 w-3" /> Applications
          </p>
        )}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filtered
            .filter((c) => c.type === "application")
            .map((conv) => (
              <ConvButton
                key={convKey(conv)}
                conv={conv}
                isActive={activeKey === convKey(conv)}
                onClick={() => setSelectedKey(convKey(conv))}
              />
            ))}
          {filtered.some((c) => c.type === "direct") && (
            <p className="text-[9px] font-black uppercase tracking-widest text-text-tertiary px-4 pt-3 pb-1 flex items-center gap-1.5 border-t border-border-light dark:border-border-dark mt-2">
              <Bookmark className="h-3 w-3" /> Shortlisted
            </p>
          )}
          {filtered
            .filter((c) => c.type === "direct")
            .map((conv) => (
              <ConvButton
                key={convKey(conv)}
                conv={conv}
                isActive={activeKey === convKey(conv)}
                onClick={() => setSelectedKey(convKey(conv))}
                onDelete={
                  conv.is_disabled
                    ? (e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(conv.freelancer_id);
                        if (activeKey === convKey(conv)) setSelectedKey(null);
                      }
                    : undefined
                }
              />
            ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col bg-white dark:bg-surface-dark relative overflow-hidden">
        <MessagesPanel conv={selectedConv} orgId={orgId} user={user} />
      </div>
    </div>
  );
}

function ConvButton({ conv, isActive, onClick, onDelete }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-4 flex gap-3 text-left border-b border-border-light/40 dark:border-border-dark/40 transition-all group relative",
        isActive
          ? "bg-white dark:bg-gray-800 shadow-sm border-l-4 border-l-primary"
          : "hover:bg-white/50 dark:hover:bg-gray-800/50",
        conv.is_disabled && "opacity-60 grayscale-50%",
      )}
    >
      <div className="relative">
        <Avatar
          src={conv.freelancer_avatar}
          name={conv.freelancer_name}
          className="h-10 w-10 border border-primary/10 shadow-sm transition-transform group-hover:scale-105"
        />
        <div className="absolute -bottom-0.5 -right-0.5 bg-success h-3 w-3 rounded-full border-2 border-white dark:border-surface-dark" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-0.5">
          <h4
            className={cn(
              "font-bold truncate text-sm transition-colors",
              isActive
                ? "text-primary"
                : "text-text-primary dark:text-gray-200",
            )}
          >
            {conv.freelancer_name}
          </h4>
          {conv.last_message_at && (
            <span className="text-[10px] text-text-tertiary whitespace-nowrap pt-0.5">
              {new Date(conv.last_message_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
        <p className="text-[11px] text-text-secondary dark:text-gray-400 font-medium truncate mb-1">
          {conv.type === "application"
            ? conv.opportunity_title
            : "Direct Message"}
        </p>
        <p className="text-[11px] text-text-tertiary dark:text-gray-500 truncate italic">
          {conv.last_message || "No messages yet"}
        </p>
      </div>

      {/* Action Area: Chevron OR Delete Button (if disabled) */}
      <div className="flex items-center ml-2 h-full">
        {onDelete ? (
          <div
            className="p-1.5 rounded-md hover:bg-danger/10 text-text-tertiary hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
            onClick={onDelete}
            title="Delete Conversation"
          >
            <Trash2 className="h-4 w-4" />
          </div>
        ) : (
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-all",
              isActive
                ? "text-primary translate-x-1"
                : "text-text-tertiary opacity-0 group-hover:opacity-100",
            )}
          />
        )}
      </div>
    </button>
  );
}
