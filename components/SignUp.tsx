"use client";

import React, { useState } from "react";
import { useAuth, useSignUp } from "@clerk/clerk-react";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FacilityCreate, FacilityCreateSchema } from "@/lib/zod/schema";
import { Badge } from "./ui/badge";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import OtpComp from "./OtpComp";

import { useToast } from "@/hooks/use-toast";

type Props = {};

const SignUp = (props: Props) => {
  const user = useAuth();
  console.log(user);

  const { toast } = useToast();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { isLoaded, signUp, setActive } = useSignUp();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  const [error, setError] = useState<string | null>(null);

  if (user?.userId) {
    router.push("/");
  }

  const form = useForm<FacilityCreate>({
    resolver: zodResolver(FacilityCreateSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phoneNumber: "",
      primaryContact: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  if (!isLoaded) {
    return (
      <>
        <h1 className="text-2xl font-semibold text-center">
          Create an account
        </h1>
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </>
    );
  }

  const onSubmit = async (data: FacilityCreate) => {
    if (!isLoaded) return;
    console.log(data);
    setIsLoading(true);
    try {
      const result = await signUp.create({
        emailAddress: data.email,
        password: data.password,
        // firstName: data.name,
        // phoneNumber: data.phoneNumber,
        unsafeMetadata: {
          name: data.name,
          email: data.email,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          primaryContact: data.primaryContact,
          role: "facility",
        },
      });

      setEmail(data.email);
      console.log("Sign up successful:", result);

      const response = await axios.post("/api/create-facility", {
        ...data,
        id: result.id,
      });

      console.log("Facility created:", response.data);

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      setPendingVerification(true);

      toast({
        variant: "default",
        title: "Success",
        description: "Facility created successfully",
      });
    } catch (err: any) {
      console.error("Sign up error:", err);
      setError(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async () => {
    if (!isLoaded) return;
    try {
      const userVerify = await signUp.attemptEmailAddressVerification({ code });
      console.log("Email verification successful:", userVerify);
      if (userVerify.status !== "complete") {
        console.log("Email not verified");
      }
      if (userVerify.status === "complete") {
        console.log("Email verified");
        setActive({
          session: userVerify.createdSessionId,
        });

        router.push("/");
      }

      setPendingVerification(false);
    } catch (err: any) {
      console.error("Email verification error:", err);
    }
  };

  return (
    <div className="max-w-lg w-2/3 flex flex-col p-6 my-auto mx-auto rounded-lg shadow-lg ">
      {pendingVerification ? (
        <OtpComp
          email={email}
          code={code}
          setCode={setCode}
          verifyEmail={verifyEmail}
        />
      ) : (
        <>
          <div className="flex gap-2 my-2">
            <h1 className="text-2xl font-semibold text-center">
              Create an account{" "}
            </h1>
            <Badge className="bg-purple-800">Multi-Provider Facility</Badge>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {[
                {
                  name: "name",
                  label: "Name",
                  placeholder: "Jhon Doe",
                  required: true,
                },
                {
                  name: "address",
                  label: "Address",
                  placeholder: "123 Main St",
                  required: true,
                },
                {
                  name: "city",
                  label: "City",
                  placeholder: "New York",
                  required: true,
                },
                {
                  name: "state",
                  label: "State",
                  placeholder: "NY",
                  required: true,
                },
                {
                  name: "zipCode",
                  label: "Zip Code",
                  placeholder: "10001",
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
              ].map((field) => (
                <FormField
                  key={field.name}
                  control={form.control}
                  name={field.name as keyof FacilityCreate}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel>
                        {field.label}{" "}
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
              <div className="flex justify-center">
                <Button disabled={isLoading} type="submit">
                  {isLoading ? "Creating.." : "Create Facility"}
                </Button>
              </div>
            </form>
          </Form>
        </>
      )}
    </div>
  );
};

export default SignUp;
