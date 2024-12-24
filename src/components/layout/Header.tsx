import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <nav className="flex gap-6">
          <Link href="/" className="font-semibold">
            Survey System
          </Link>
          <SignedIn>
            <Link href="/surveys">Surveys</Link>
            <Link href="/dashboard">Dashboard</Link>
          </SignedIn>
        </nav>
        
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <SignInButton>
            <Button>Sign In</Button>
          </SignInButton>
        </SignedOut>
      </div>
    </header>
  );
}