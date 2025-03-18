import * as React from "react";
import { Card } from "./ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Id } from "../../convex/_generated/dataModel";

export interface AgentProps {
  _id: Id<"agents">;
  name: string;
  personality: string;
  isRaisingHand: boolean;
  avatar?: string;
  onClick?: () => void;
}

export const Agent: React.FC<AgentProps> = ({
  name,
  personality,
  isRaisingHand,
  avatar,
  onClick,
}) => (
  <Card
    className={`
      flex flex-row items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-accent/50
      ${isRaisingHand ? "bg-accent" : "bg-card"}
    `}
    onClick={onClick}
  >
    <Avatar className="shrink-0">
      {avatar ? (
        <AvatarImage src={avatar} alt={name} />
      ) : (
        <AvatarFallback>{name[0]}</AvatarFallback>
      )}
    </Avatar>
    <div className="flex-1 min-w-0">
      <h3 className="font-medium text-foreground truncate">{name}</h3>
      <span className="text-sm text-muted-foreground block truncate">
        {personality}
      </span>
      {isRaisingHand && (
        <span className="text-sm text-muted-foreground block">
          Has something to say...
        </span>
      )}
    </div>
  </Card>
);
