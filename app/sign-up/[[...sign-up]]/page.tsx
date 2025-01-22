"use client";

import { Building2 } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className=" flex items-center justify-center mt-40">
      <div className="max-w-md w-full bg-white shadow-xl rounded-lg p-6">
        <div className="text-center space-y-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Clinic Sign-up
          </h1>
          <p className="text-sm text-gray-500">
            Create an account for your medical clinic to manage providers and patients efficiently.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-medium text-gray-800">
                Manage Your Clinic
              </h2>
            </div>
            <p className="text-sm text-gray-500">
              Sign up to gain access to tools that help streamline your operations and improve patient care.
            </p>
          </div>

          <Link href="/sign-up/facility">
            <button
              className="w-full bg-black text-white py-2.5 rounded-md font-medium hover:bg-gray-800 transition-colors mt-5"
            >
              Get Started
            </button>
          </Link>
        </div>

        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-white text-gray-500">or</span>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account? {" "}
          <Link
            href="/login"
            className="text-purple-600 hover:text-purple-800 font-medium transition-colors"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
