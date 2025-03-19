import * as React from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useCurrentThreadId } from "../../../routes";
import { ThreadHeader } from "./ThreadHeader";
import { Skeleton } from "../../ui/skeleton";

interface Message {
  id: string;
  content: string;
  sender: "user" | "agent";
  timestamp: string;
  agentName?: string;
}

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  onSendMessage,
}) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const currentThreadId = useCurrentThreadId();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col bg-background">
      <ThreadHeader threadId={currentThreadId} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentThreadId && messages.length === 0 ? (
          <>
            <div className="flex justify-start">
              <Skeleton className="h-24 w-2/3" />
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-16 w-1/2" />
            </div>
            <div className="flex justify-start">
              <Skeleton className="h-20 w-3/5" />
            </div>
          </>
        ) : (
          messages.map((message) => (
            <ChatMessage key={message.id} {...message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSendMessage={onSendMessage} />
    </div>
  );
};
