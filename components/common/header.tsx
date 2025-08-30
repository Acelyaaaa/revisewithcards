import NavLink from "./nav-link";
import { BookCopy } from "lucide-react";
import { Button } from "../ui/button";

export default function Header() {
    const isLoggedIn = false; // Replace with actual authentication logic
  return (
    <nav className="container flex items-center justify-between py-4 lg:px-8 px-2 mx-auto">
      {/* Left */}
      <div className="flex flex-1 items-center">
        <BookCopy className="w-5 h-5 lg:w-8 lg:h-8 text-gray-900 hover:rotate-12 transform transition duration-200 ease-in-out" />
        <NavLink href="/" className="ml-2 font-extrabold lg:text-xl">Revisecards</NavLink>
      </div>

      {/* Center */}
      <div className="flex flex-1 justify-center gap-4 lg:gap-12 lg:items-center">
        <NavLink href="/#pricing" className="font-medium">Pricing</NavLink>
        {isLoggedIn && <NavLink href="/dashboard" className="font-medium">Your Summaries</NavLink> }
      </div>


      {/* Right */}
      <div className="flex flex-1 lg:justify-end lg:flex-1">
        {isLoggedIn ? (
        <div className="flex gap-2 items-center">
            <NavLink href="/upload" className="font-medium">Upload a PDF</NavLink>
            <div>Pro</div>
            <Button>User</Button>
        </div>
        ) : ( 
        <div>
        <NavLink href="/sign-in" className="font-medium">Sign In</NavLink>
        </div>
        )}
      </div>
    </nav>
  );
}
