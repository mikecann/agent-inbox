import * as React from "react";

interface ThreadItemProps {
  id: string;
  title: string;
  lastMessageTime: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const ThreadItem: React.FC<ThreadItemProps> = ({
  id,
  title,
  lastMessageTime,
  isSelected,
  onSelect,
}) => (
  <div
    onClick={() => onSelect(id)}
    className={`p-4 cursor-pointer hover:bg-accent ${
      isSelected ? "bg-accent" : ""
    }`}
  >
    <div className="font-medium text-primary-foreground">{title}</div>
    <div className="text-sm text-muted-foreground/80 truncate">
      {new Date(lastMessageTime).toLocaleTimeString()}
    </div>
  </div>
);
