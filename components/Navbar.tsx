'use client'

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs';


export default function Navbar() {
  const pathname = usePathname();

  const getLinkClass = (path: string) =>
    pathname === path
      ? " border-b-2 border-purple-400"
      : "hover:bg-gray-500";

  return (

    
    <nav className="bg-gray-700 w-full">
      <div className="flex max-w-[60rem] mx-auto justify-between items-center">
        <div className="flex flex-row items-center space-x-5">
          {/* Logo Section */}
          <div className="flex items-center">
            <Image
              src="/logo.webp"
              alt="Logo"
              width={90}
              height={80}
            />
          </div>

          {/* Navigation Links */}
          <div className="flex font-medium h-full">
          <Link href="/" className={`text-white  px-3 py-3 ${getLinkClass("/")}`}>
          
                Home
              </Link>
              <Link href="/quick-check" className={`text-white  px-3 py-3 ${getLinkClass("/quick-check")}`}>
              Quick Check
            </Link>
            <Link href="/patient-list" className={`text-white  px-3 py-3 ${getLinkClass("/patient-list")}`}>
              Patient List
            </Link>
           
          </div>
        </div>

        {/* Profile Section */}
        <div>
        <ClerkProvider>

    
          <SignedIn>
            <UserButton />
          </SignedIn>
              </ClerkProvider>

        </div>
      </div>
    </nav>

  );
}
