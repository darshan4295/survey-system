import { SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 404 Content */}
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-bold">404</h1>
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground max-w-lg mx-auto px-4">
            The page you're looking for doesn't exist or you might need to sign in.
          </p>
          <div className="flex gap-4 justify-center">
            <SignInButton>
              <Button variant="default">Sign In</Button>
            </SignInButton>
            <Link href="/">
              <Button variant="outline">Go to Home</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}