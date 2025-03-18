import * as React from "react";
import { SignInWithGithub } from "../SignInWithGithub";
import { Card, CardContent, CardHeader } from "./ui/card";

export const SignInForm: React.FC = () => (
  <Card className="w-96 mx-auto">
    <CardHeader>
      <h2 className="text-lg text-center">
        Welcome! Please sign in to continue
      </h2>
    </CardHeader>
    <CardContent className="flex justify-center">
      <SignInWithGithub />
    </CardContent>
  </Card>
);
