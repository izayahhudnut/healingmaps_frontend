"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  // @ts-ignore
  const user: any = session?.user;

  const getLinkClass = (path: string) =>
    pathname === path ? " border-b-2 border-purple-400" : "hover:bg-gray-500";

  const onSignOut = () => {
    signOut();
    router.push("/sign-in");
  };

  return (
    <nav className="bg-gray-700 w-full">
      <div className="flex max-w-[60rem] mx-auto justify-between items-center">
        <div className="flex flex-row items-center space-x-5">
          {/* Logo Section */}
          <div className="flex items-center">
            <Image src="/logo.webp" alt="Logo" width={90} height={80} />
          </div>

          {/* Navigation Links */}
          <div className="flex font-medium h-full">
            <Link
              href="/"
              className={`text-white  px-3 py-3 ${getLinkClass("/")}`}
            >
              Home
            </Link>
            <Link
              href="/quick-check"
              className={`text-white  px-3 py-3 ${getLinkClass(
                "/quick-check"
              )}`}
            >
              Quick Check
            </Link>
            <Link
              href="/patient-list"
              className={`text-white  px-3 py-3 ${getLinkClass(
                "/patient-list"
              )}`}
            >
              Patient List
            </Link>
          </div>
        </div>

        {/* Profile Section */}
        <div>
          {/* User Dropdown */}
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <Avatar>
                  <AvatarImage src={user?.imageUrl} />
                  <AvatarFallback>
                    {user?.firstName?.charAt(0)}
                    {user?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onSignOut}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
