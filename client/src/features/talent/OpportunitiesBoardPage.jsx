import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  MessageSquare,
  X,
  Send,
  CheckCircle2,
  ArrowLeft,
  Building2,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { useOpportunities, useMyApplications, useApplicationMessages, useSendMessage } from "../../hooks/useTalent";
import { useAuth } from "../../context/AuthContext";
import { OpportunityCard } from "./components/OpportunityCard";
import { cn } from "../../utils/cn";
import { formatDistanceToNow } from "date-fns";

// ─────────────────────────────────────────────
// Inline Messaging Panel (self-contained, separate from Org Talent Hub)
// Shows application-based conversations for talent/applicants
// ─────────────────────────────────────────────
function OpportunitiesMessagingPanel({ isOpen, onClose }) {
  const { user } = useAuth();
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [messageText, setMessageText] = useState("");
  const endRef = useRef(null);

  // Fetch user's own applications to show as conversation threads
  const { data: appsData, isLoading: appsLoading } = useMyApplications();
  const applications = appsData?.applications || [];

  // Active chat messages
  const { data: msgData, isLoading: msgsLoading } = useApplicationMessages(selectedAppId);
  const messages = msgData?.messages || [];
  const sendMessage = useSendMessage();

  const selectedApp = applications.find((a) => String(a.id) === String(selectedAppId));

  useEffect(() => {
    if (isOpen) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Close chat panel when panel closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedAppId(null);
      setMessageText("");
    }
  }, [isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedAppId) return;
    sendMessage.mutate(
      { applicationId: selectedAppId, content: messageText.trim() },
      { onSuccess: () => setMessageText("") }
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <aside
        className="fixed right-0 top-0 h-full w-full max-w-[520px] bg-white dark:bg-background-dark shadow-2xl z-50 flex flex-col border-l border-border-light dark:border-border-dark animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light dark:border-border-dark bg-gray-50/80 dark:bg-surface-dark/80 backdrop-blur-sm shrink-0">
          {selectedAppId ? (
            <button
              onClick={() => { setSelectedAppId(null); setMessageText(""); }}
              className="flex items-center gap-2 text-sm font-bold text-text-secondary hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Conversations
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-black text-text-primary dark:text-white">Messages</h2>
              {applications.length > 0 && (
                <span className="h-5 w-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center">
                  {applications.length}
                </span>
              )}
            </div>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-4 w-4 text-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedAppId ? (
            /* ── Chat Thread View ── */
            <>
              {/* Chat Header */}
              <div className="px-6 py-3 border-b border-border-light dark:border-border-dark bg-white dark:bg-surface-dark shrink-0 flex items-center gap-3">
                <Avatar
                  src={
                    selectedApp?.organization_logo ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedApp?.organization_name || "Org")}&background=random`
                  }
                  name={selectedApp?.organization_name}
                  className="h-9 w-9 border border-border-light dark:border-border-dark shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-text-primary dark:text-white truncate">
                    {selectedApp?.organization_name || "Organization"}
                  </p>
                  <p className="text-[11px] text-text-tertiary truncate">
                    Re: {selectedApp?.opportunity_title}
                  </p>
                </div>
                {selectedApp?.status && (
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                    selectedApp.status === "Accepted"
                      ? "bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                      : selectedApp.status === "Rejected"
                      ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                      : selectedApp.status === "Shortlisted" || selectedApp.status === "Interviewing"
                      ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                      : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                  )}>
                    {selectedApp.status}
                  </span>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-gray-50/40 dark:bg-gray-900/10">
                {msgsLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <Send className="h-7 w-7 text-primary" />
                    </div>
                    <h4 className="text-base font-black text-text-primary dark:text-white mb-1">
                      Start the Conversation
                    </h4>
                    <p className="text-sm text-text-secondary dark:text-gray-400 max-w-xs leading-relaxed">
                      Send a direct message to {selectedApp?.organization_name || "the organization"} — they've
                      been shortlisted and can respond here.
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
                        className={cn("flex gap-2.5", isMe ? "flex-row-reverse" : "flex-row")}
                      >
                        <div className="w-7 shrink-0">
                          {showAvatar && (
                            <Avatar
                              src={isMe ? user?.avatar : msg.sender_avatar}
                              name={isMe ? user?.name : msg.sender_name}
                              className="h-7 w-7 shadow-sm"
                            />
                          )}
                        </div>
                        <div className={cn("max-w-[75%] flex flex-col", isMe ? "items-end" : "items-start")}>
                          <div
                            className={cn(
                              "px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed shadow-sm",
                              isMe
                                ? "bg-primary text-white rounded-tr-none shadow-primary/20"
                                : "bg-white dark:bg-gray-800 text-text-primary dark:text-gray-200 rounded-tl-none border border-border-light dark:border-border-dark"
                            )}
                          >
                            {msg.content}
                          </div>
                          <div className="flex items-center gap-1 mt-1 px-1">
                            <span className="text-[10px] text-text-tertiary font-medium">
                              {new Date(msg.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {isMe && <CheckCircle2 className="h-3 w-3 text-primary opacity-50" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={endRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border-light dark:border-border-dark bg-white dark:bg-surface-dark shrink-0">
                {selectedApp?.status === "Rejected" ? (
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center border border-border-light dark:border-border-dark">
                    <p className="text-sm font-semibold text-text-secondary">
                      This application has been closed.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSend} className="relative flex items-center gap-3">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 h-12 pl-5 pr-14 rounded-full bg-gray-50 dark:bg-gray-800 border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!messageText.trim() || sendMessage.isPending}
                      className="absolute right-2 h-8 w-8 rounded-full bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95 shadow-md shadow-primary/30"
                    >
                      <Send className="h-3.5 w-3.5 text-white ml-0.5" />
                    </button>
                  </form>
                )}
                <p className="text-center text-[10px] text-text-tertiary mt-2 font-medium tracking-wide uppercase">
                  Press Enter to Send
                </p>
              </div>
            </>
          ) : (
            /* ── Conversation List View ── */
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {appsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : applications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <MessageSquare className="h-8 w-8 text-text-tertiary opacity-40" />
                  </div>
                  <h3 className="font-black text-text-primary dark:text-white text-base mb-2">
                    No Conversations Yet
                  </h3>
                  <p className="text-sm text-text-secondary dark:text-gray-400 leading-relaxed">
                    Apply for opportunities below and start a conversation with organizations once accepted or shortlisted.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border-light dark:divide-border-dark">
                  {applications.map((app) => (
                    <button
                      key={app.id}
                      onClick={() => setSelectedAppId(app.id)}
                      className="w-full flex items-center gap-3 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left group"
                    >
                      <Avatar
                        src={
                          app.organization_logo ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(app.organization_name || "Org")}&background=random`
                        }
                        name={app.organization_name}
                        className="h-11 w-11 shrink-0 border border-border-light dark:border-border-dark shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="font-bold text-sm text-text-primary dark:text-white truncate group-hover:text-primary transition-colors">
                            {app.organization_name || "Organization"}
                          </p>
                          <span className="text-[10px] text-text-tertiary shrink-0 ml-2">
                            {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary dark:text-gray-400 truncate">
                          {app.opportunity_title}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                            app.status === "Accepted"
                              ? "bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                              : app.status === "Rejected"
                              ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                              : app.status === "Shortlisted" || app.status === "Interviewing"
                              ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                              : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                          )}>
                            {app.status || "Pending"}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-text-tertiary">
                            <Building2 className="h-3 w-3" />
                            Direct Message
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

// ─────────────────────────────────────────────
// Main OpportunitiesBoardPage
// ─────────────────────────────────────────────
export function OpportunitiesBoardPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);

  const { data, isLoading, isError } = useOpportunities({
    type: activeTab === "all" ? undefined : activeTab,
    search: searchTerm || undefined,
  });

  const opportunities = data?.opportunities || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-border-light dark:border-border-dark pb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-white">
            Opportunities
          </h1>
          <p className="text-text-secondary dark:text-gray-400 mt-1 font-medium">
            Browse and apply for gigs, internships, and full-time jobs.
          </p>
        </div>
        <div className="flex gap-3">
          {/* Messaging Button — replaces old static "Find Talent" button */}
          <button
            id="opportunities-messaging-btn"
            onClick={() => setIsMessagingOpen(true)}
            className="relative flex items-center gap-2 h-10 px-5 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark hover:bg-gray-50 dark:hover:bg-gray-800 text-text-primary dark:text-white text-sm font-bold transition-all hover:border-primary/40 hover:shadow-sm active:scale-95"
          >
            <MessageSquare className="h-4 w-4 text-primary" />
            Messaging
          </button>

          <Link to="/org/talent/postings">
            <Button className="font-bold">Post an Opportunity</Button>
          </Link>
        </div>
      </div>

      {/* Filters and Tabs */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className="flex bg-gray-100/80 dark:bg-gray-800/50 p-1 rounded-xl backdrop-blur-sm border border-border-light dark:border-border-dark/50">
          {["all", "gig", "internship", "job"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold capitalize transition-all duration-200 ${
                activeTab === tab
                  ? "bg-white dark:bg-surface-dark text-primary shadow-md shadow-primary/5"
                  : "text-text-tertiary hover:text-text-secondary dark:hover:text-gray-200"
              }`}
            >
              {tab === "all" ? "All" : tab + "s"}
            </button>
          ))}
        </div>

        <div className="flex gap-4 w-full lg:w-96">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-xl border border-border-light bg-white dark:bg-surface-dark/50 dark:border-border-dark focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium"
            />
          </div>
        </div>
      </div>

      {/* Opportunity Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent shadow-lg shadow-primary/20"></div>
          <p className="text-sm font-bold text-text-tertiary animate-pulse">Loading opportunities...</p>
        </div>
      ) : isError ? (
        <div className="text-center text-error py-24 bg-error/5 rounded-2xl border border-error/10">
          <p className="font-bold">Failed to load opportunities.</p>
          <p className="text-sm opacity-70 mt-1">Please try refreshing the page.</p>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="text-center text-text-tertiary py-24 bg-gray-50 dark:bg-gray-800/10 rounded-2xl border border-dashed border-border-light dark:border-border-dark">
          <p className="text-lg font-bold">No opportunities found.</p>
          <p className="text-sm mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {opportunities.map((opp) => (
            <OpportunityCard key={opp.id} opp={opp} />
          ))}
        </div>
      )}

      {/* Messaging Panel — self-contained, separate from Org Talent Hub */}
      <OpportunitiesMessagingPanel
        isOpen={isMessagingOpen}
        onClose={() => setIsMessagingOpen(false)}
      />
    </div>
  );
}
