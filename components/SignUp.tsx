"use client";

import React, { useState } from "react";

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";
import axios from "axios";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FacilityCreate, FacilityCreateSchema } from "@/lib/zod/schema";
import { Badge } from "./ui/badge";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

type Props = {};

const SignUp = (props: Props) => {
  const { toast } = useToast();
  const { data: session } = useSession();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (session?.user?.id) {
    router.push("/");
  }

  const form = useForm<FacilityCreate>({
    resolver: zodResolver(FacilityCreateSchema),
    defaultValues: {
      name: "",
      address: "",
      phoneNumber: "",
      primaryContact: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: FacilityCreate) => {
    console.log(data);
    setIsLoading(true);
    try {
      if (data.password !== data.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const response = await axios.post("/api/create-facility", {
        ...data,
      });

      toast({
        variant: "default",
        title: "Success",
        description: "Clinic created successfully",
      });
    } catch (err: any) {
      console.error("Sign up error:", err);
      setError(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err?.response?.data?.message || "An error occurred",
      });
    } finally {
      setIsLoading(false);
      router.push("/sign-in");
    }
  };

  return (
    <div className="max-w-4xl w-full flex flex-col p-6 my-auto mx-auto rounded-lg shadow-lg">
      <div className="flex gap-2 my-2">
        <h1 className="text-2xl font-semibold text-center">
          Create an account
        </h1>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="flex flex-wrap gap-4">
            {[
              {
                name: "name",
                label: "Clinic Name",
                placeholder: "Clinic Name",
                required: true,
              },
              
              {
                name: "phoneNumber",
                label: "Phone Number",
                placeholder: "123-456-7890",
                required: true,
              },
              {
                name: "primaryContact",
                label: "Primary Contact",
                placeholder: "John Doe",
                required: true,
              },
              {
                name: "email",
                label: "Email",
                placeholder: "example@example.com",
                required: true,
              },
              {
                name: "password",
                label: "Password",
                placeholder: "********",
                type: showPassword ? "text" : "password",
                required: true,
                icon: showPassword ? (
                  <AiOutlineEyeInvisible
                    className="w-4 h-4 cursor-pointer"
                    onClick={() => setShowPassword(false)}
                  />
                ) : (
                  <AiOutlineEye
                    className="w-4 h-4 cursor-pointer"
                    onClick={() => setShowPassword(true)}
                  />
                ),
              },
              {
                name: "confirmPassword",
                label: "Confirm Password",
                placeholder: "********",
                type: showConfirmPassword ? "text" : "password",
                required: true,
                icon: showConfirmPassword ? (
                  <AiOutlineEyeInvisible
                    className="w-4 h-4 cursor-pointer"
                    onClick={() => setShowConfirmPassword(false)}
                  />
                ) : (
                  <AiOutlineEye
                    className="w-4 h-4 cursor-pointer"
                    onClick={() => setShowConfirmPassword(true)}
                  />
                ),
              },
              {
                name: "address",
                label: "Address",
                placeholder: "123 Main St",
                required: true,
              }
            ].map((field) => (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name as keyof FacilityCreate}
                render={({ field: formField }) => (
                  <FormItem className="flex-1 min-w-[240px]">
                    <FormLabel>
                      {field.label}
                      {field.required && (
                        <span className="text-red-500">*</span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder={field.placeholder}
                          type={field.type || "text"}
                          {...formField}
                        />
                        {field.icon && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {field.icon}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
          <div className="flex justify-center">
            <Button disabled={isLoading} type="submit">
              {isLoading ? "Creating.." : "Create Clinic"}
            </Button>
          </div>
          <div>
            <p className="text-center text-gray-600">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-blue-500">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SignUp;