import { Building2, UserPlus } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Choose your account type
          </h1>
          <p className="text-gray-500">
            Select the type of account you want to create
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/sign-up/facility">
            <div className="relative group">
              <div className="rounded-lg border-2 border-gray-200 p-6 hover:border-purple-500 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center space-x-4 mb-4">
                  <Building2 className="h-8 w-8 text-purple-600" />
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Facility Sign-up
                  </h2>
                </div>
                <p className="text-gray-600">
                  Create an account for your medical facility or clinic to
                  manage providers and patients.
                </p>
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-purple-600">Get started →</span>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/sign-up/provider">
            <div className="relative group">
              <div className="rounded-lg border-2 border-gray-200 p-6 hover:border-purple-500 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center space-x-4 mb-4">
                  <UserPlus className="h-8 w-8 text-purple-600" />
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Provider Sign-up
                  </h2>
                </div>
                <p className="text-gray-600">
                  Join as a healthcare provider to connect with patients and
                  manage your practice.
                </p>
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-purple-600">Get started →</span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
