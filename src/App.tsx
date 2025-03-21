import * as React from "react";
import { Authenticated, Unauthenticated } from "convex/react";
import { AuthenticatedContent } from "./components/authenticated/AuthenticatedContent";
import { UnauthenticatedContent } from "./components/unauthenticated/UnauthenticatedContent";
import { toast, Toaster } from "sonner";
import { RouteProvider } from "./routes";
import { ConvexQueryCacheProvider } from "convex-helpers/react/cache";

export default function App() {
  return (
    <RouteProvider>
      <ConvexQueryCacheProvider>
        <div className="min-h-screen bg-background">
          <Authenticated>
            <AuthenticatedContent />
          </Authenticated>
          <Unauthenticated>
            <UnauthenticatedContent />
          </Unauthenticated>
        </div>
        <Toaster />
      </ConvexQueryCacheProvider>
    </RouteProvider>
  );
}
