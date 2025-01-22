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
import { Badge } from "./ui/badge";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  // @ts-ignore
  const user: any = session?.user;

  console.log(user, "USERSSSSSSSSS");

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
            {user?.role !== "PROVIDER" && (
              <Link
                href="/provider"
                className={`text-white  px-3 py-3 ${getLinkClass("/provider")}`}
              >
                Providers
              </Link>
            )}
          </div>
        </div>

        {/* Profile Section */}
        <div>
          {/* User Dropdown */}
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <Avatar>
                  <AvatarImage src={user?.image} />
                  <AvatarFallback className="bg-purple-500 text-white">
                    {user?.firstName &&
                      user?.firstName?.charAt(0).toUpperCase()}
                    {user?.lastName && user?.lastName?.charAt(0).toUpperCase()}
                    {user?.name && user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <Badge className="bg-purple-500 mx-2 text-white">
                  {user?.email}
                </Badge>
                <DropdownMenuSeparator />
                <Link href="/profile">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
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