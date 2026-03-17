import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { MessageSquare, Send, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useApplicationMessages, useSendMessage, useMyApplications } from "../../hooks/useTalent";
import { useAuth } from "../../context/AuthContext";
import { Avatar } from "../../components/ui/Avatar";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { cn } from "../../utils/cn";

export function ApplicationChat() {
  const { id } = useParams(); // Application ID
  const { user } = useAuth();
  const [text, setText] = useState("");
  const endRef = useRef(null);

  // Fetch all my apps to find this specific one and get the org details
  const { data: myAppsData } = useMyApplications();
  const application = myAppsData?.applications?.find((app) => String(app.id) === String(id));

  // Fetch messages for this application
  const { data: msgData, isLoading } = useApplicationMessages(id);
  const messages = msgData?.messages || [];

  const sendMessage = useSendMessage();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    sendMessage.mutate(
      { applicationId: id, content: text.trim() },
      { onSuccess: () => setText("") }
    );
  };

  if (isLoading && !application) {
    return (
      <div className="flex justify-center items-center h-[500px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!application && !isLoading) {
    return (
      <div className="py-20 text-center animate-in fade-in">
        <h2 className="text-2xl font-bold mb-4">Application Not Found</h2>
        <Link to="/dashboard/applications">
          <Button>Back to My Applications</Button>
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Accepted':
        return <Badge variant="neutral" className="bg-green-500/10 text-green-600 border-green-200">Accepted</Badge>;
      case 'Rejected':
        return <Badge variant="neutral" className="bg-red-500/10 text-red-600 border-red-200">Rejected</Badge>;
      case 'Interviewing':
        return <Badge variant="neutral" className="bg-purple-500/10 text-purple-600 border-purple-200">Interviewing</Badge>;
      case 'Shortlisted':
        return <Badge variant="neutral" className="bg-blue-500/10 text-blue-600 border-blue-200">Shortlisted</Badge>;
      default:
        return <Badge variant="neutral" className="bg-amber-500/10 text-amber-600 border-amber-200">Pending Review</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col pt-6 animate-in slide-in-from-bottom-4 duration-500 fade-in">
      <Link
        to="/dashboard/applications"
        className="flex items-center gap-2 text-sm font-semibold text-text-tertiary hover:text-primary transition-colors mb-4 w-fit"
      >
        <ArrowLeft className="h-4 w-4" /> Back to My Applications
      </Link>

      <div className="flex-1 flex flex-col bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl shadow-xl overflow-hidden shadow-primary/5">
        
        {/* Header */}
        <div className="p-5 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-gray-50/50 dark:bg-black/20">
          <div className="flex items-center gap-4">
            <Avatar
              src={
                application?.organization_logo ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  application?.organization_name || "Org",
                )}&background=random`
              }
              name={application?.organization_name}
              className="h-12 w-12 border-2 border-white dark:border-surface-dark shadow-sm"
            />
            <div>
              <h3 className="font-bold text-lg text-text-primary dark:text-white leading-tight">
                {application?.organization_name || "Organization"}
              </h3>
              <p className="text-xs text-text-secondary dark:text-gray-400 font-medium">
                Regarding: <span className="text-text-primary dark:text-gray-200 font-bold">{application?.opportunity_title}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             {application?.status && getStatusBadge(application.status)}
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-linear-to-b from-gray-50/50 to-white dark:from-gray-900/5 dark:to-surface-dark/95">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary text-primary/40" />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="bg-primary/10 p-5 rounded-full mb-5 shadow-inner">
                <MessageSquare className="h-10 w-10 text-primary" />
              </div>
              <h4 className="text-xl font-black text-text-primary dark:text-white mb-2">
                Start the Conversation
              </h4>
              <p className="text-sm text-text-secondary max-w-sm leading-relaxed">
                Introduce yourself, ask questions about the role, or provide additional information to support your application.
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.sender_id === user?.id;
              const showAvatar = idx === 0 || messages[idx - 1].sender_id !== msg.sender_id;

              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3",
                    isMe ? "flex-row-reverse" : "flex-row",
                  )}
                >
                  <div className="w-8 shrink-0">
                    {showAvatar && (
                      <Avatar
                        src={isMe ? user?.avatar : msg.sender_avatar}
                        name={isMe ? user?.name : msg.sender_name}
                        size="sm"
                        className="h-8 w-8 shadow-sm"
                      />
                    )}
                  </div>
                  <div
                    className={cn(
                      "max-w-[75%] flex flex-col",
                      isMe ? "items-end" : "items-start",
                    )}
                  >
                    <div
                      className={cn(
                        "px-5 py-3 rounded-2xl text-[14px] font-medium leading-relaxed shadow-sm",
                        isMe
                          ? "bg-primary text-white rounded-tr-none shadow-primary/20"
                          : "bg-white dark:bg-gray-800 text-text-primary dark:text-gray-200 rounded-tl-none border border-border-light dark:border-border-dark",
                      )}
                    >
                      {msg.content}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5 px-1">
                      <span className="text-[10px] text-text-tertiary font-bold tracking-wider uppercase">
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

        {/* Input Area */}
        <div className="p-5 border-t border-border-light dark:border-border-dark bg-white dark:bg-surface-dark">
          {['Rejected'].includes(application?.status) ? (
             <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center border border-border-light dark:border-border-dark">
                <p className="font-semibold text-text-secondary">This application has been closed.</p>
                <p className="text-xs text-text-tertiary mt-1">Chat is disabled for rejected applications.</p>
             </div>
          ) : (
            <form onSubmit={handleSend} className="relative flex items-center gap-3 max-w-4xl mx-auto">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a message..."
                className="flex-1 h-14 pl-6 pr-14 rounded-full bg-gray-50 dark:bg-gray-800 border-border-light dark:border-border-dark border focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all text-[15px] font-medium shadow-inner"
              />
              <Button
                type="submit"
                disabled={!text.trim() || sendMessage.isPending}
                className="absolute right-2 h-10 w-10 p-0 rounded-full shadow-lg shadow-primary/30 flex items-center justify-center transition-transform active:scale-95"
              >
                <Send
                  className={cn(
                    "h-4 w-4 transition-transform",
                    text.trim() && "translate-x-0.5 -translate-y-0.5"
                  )}
                />
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
