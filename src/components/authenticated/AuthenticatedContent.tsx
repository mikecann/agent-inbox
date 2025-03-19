import * as React from "react";
import { SignOutButton } from "./SignOutButton";
import { api } from "../../../convex/_generated/api";
import { useQuery } from "convex/react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card } from "../ui/card";

export const AuthenticatedContent: React.FC = () => {
  const me = useQuery(api.users.getMe);
  const [selectedThreadId, setSelectedThreadId] = React.useState<string | null>(
    null,
  );
  const [isTaskPanelOpen, setIsTaskPanelOpen] = React.useState(false);

  // Dummy data for initial UI
  const dummyThreads = [
    {
      id: "1",
      name: "Project Planning",
      lastMessage: "Let's break this down...",
    },
    {
      id: "2",
      name: "Research Task",
      lastMessage: "I found some interesting papers...",
    },
    {
      id: "3",
      name: "Code Review",
      lastMessage: "The implementation looks good...",
    },
  ];

  const dummyMessages = [
    {
      id: "1",
      content: "Can you help me plan this project?",
      sender: "user",
      timestamp: "10:00 AM",
    },
    {
      id: "2",
      content:
        "I'd be happy to help break down the project planning. Let's start by identifying the main objectives.",
      sender: "agent",
      agentName: "ProjectBot",
      timestamp: "10:01 AM",
    },
    {
      id: "3",
      content: "@ResearchBot can you find some relevant case studies?",
      sender: "agent",
      agentName: "ProjectBot",
      timestamp: "10:02 AM",
    },
  ];

  if (!me) return <div>Loading...</div>;

  return (
    <div className="h-screen flex">
      {/* Left Sidebar - Thread List */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <img src="/logo.png" alt="Agent Inbox" className="h-6" />
        </div>
        <div className="p-4">
          <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md">
            New Thread
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {dummyThreads.map((thread) => (
            <div
              key={thread.id}
              onClick={() => setSelectedThreadId(thread.id)}
              className={`p-4 cursor-pointer hover:bg-accent ${
                selectedThreadId === thread.id ? "bg-accent" : ""
              }`}
            >
              <div className="font-medium">{thread.name}</div>
              <div className="text-sm text-muted-foreground truncate">
                {thread.lastMessage}
              </div>
            </div>
          ))}
        </div>

        {/* User Profile Section */}
        <Card className="m-2 p-2">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={me.image} />
              <AvatarFallback>{me.name?.[0] ?? "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{me.name}</div>
              <div className="text-xs text-muted-foreground truncate">
                {me.email}
              </div>
            </div>
            <SignOutButton />
          </div>
        </Card>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {dummyMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent"
                }`}
              >
                {message.sender === "agent" && (
                  <div className="text-sm font-medium text-primary mb-1">
                    {message.agentName}
                  </div>
                )}
                <div>{message.content}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {message.timestamp}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 rounded-md border border-input bg-background px-3 py-2"
            />
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Task Details (Optional) */}
      {isTaskPanelOpen && (
        <div className="w-80 bg-card border-l border-border p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Task Details</h3>
            <button
              onClick={() => setIsTaskPanelOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </div>
          <div className="space-y-4">
            <div className="p-3 bg-accent rounded-lg">
              <div className="text-sm font-medium">Web Search</div>
              <div className="text-sm text-muted-foreground">
                Searched for "project planning methodologies"
              </div>
            </div>
            <div className="p-3 bg-accent rounded-lg">
              <div className="text-sm font-medium">Document Analysis</div>
              <div className="text-sm text-muted-foreground">
                Analyzed 3 case studies related to similar projects
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
