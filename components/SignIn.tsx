"use client";

import React, { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { signIn, useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";

const SignIn = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  if (session?.user) {
    router.push("/");
    return null;
  }

  const onSubmit = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        callbackUrl: "/",
      });

      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Wrong Credentials",
        });
      }

      router.push("/");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
<div className="max-w-lg w-1/3 flex flex-col gap-2 p-6 my-auto rounded-lg space-y-4 ">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-center text-gray-900 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-center text-gray-500">
            Sign in to continue to your account
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {[
              {
                name: "email",
                label: "Email",
                placeholder: "you@example.com",
                required: true,
              },
              {
                name: "password",
                label: "Password",
                placeholder: "Enter your password",
                type: showPassword ? "text" : "password",
                required: true,
                icon: showPassword ? (
                  <AiOutlineEyeInvisible
                    className="w-5 h-5 text-gray-500 cursor-pointer hover:text-purple-600 transition-colors"
                    onClick={() => setShowPassword(false)}
                  />
                ) : (
                  <AiOutlineEye
                    className="w-5 h-5 text-gray-500 cursor-pointer hover:text-purple-600 transition-colors"
                    onClick={() => setShowPassword(true)}
                  />
                ),
              },
            ].map((field) => (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name as "email" | "password"}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">
                      {field.label}
                      {field.required && (
                        <span className="text-purple-600 ml-1">*</span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder={field.placeholder}
                          type={field.type || "text"}
                          className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
                          {...formField}
                        />
                        {field.icon && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {field.icon}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            ))}

            <div className="flex justify-end">
              <Link
                href="/forget-password"
                className="text-sm text-purple-600 hover:text-purple-800 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <div className="pt-2">
              <Button
                disabled={isLoading}
                type="submit"
                className="w-full bg-black hover:bg-gray-800 text-white rounded-lg py-3 transition-colors"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </div>
          </form>
        </Form>

        {error && (
          <p className="text-red-500 text-center text-sm mt-4">{error}</p>
        )}

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">or</span>
          </div>
        </div>

     

        <p className="text-center text-gray-600 mt-8">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="text-purple-600 hover:text-purple-800 font-medium transition-colors"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;