"use client";
import React, { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { useAuth, useSignIn } from "@clerk/clerk-react";
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
import { set } from "zod";

const SignIn = () => {
  const user = useAuth();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (user?.userId) {
    router.push("/");
  }

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: any) => {
    if (!isLoaded) return;
    setIsLoading(true);

    console.log(data);
    try {
      const signInAttempt = await signIn.create({
        identifier: data.email,
        password: data.password,
      });
      console.log(signInAttempt);

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.push("/");
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (error: any) {
      setError(error.message);
      console.log(error);
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-lg w-1/3 flex flex-col gap-2 p-6 my-auto rounded-lg shadow-lg space-y-4">
      <h1
        className="text-2xl font-semibold
        text-center"
      >
        Sign In
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {[
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
          ].map((field) => (
            <FormField
              key={field.name}
              control={form.control}
              name={field.name as "email" | "password"}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>
                    {field.label}{" "}
                    {field.required && <span className="text-red-500">*</span>}
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

          <div className="flex justify-end">
            <p className="text-right underline text-gray-600">
              <Link href="/forget-password" className="text-blue-500">
                forget password?
              </Link>
            </p>
          </div>
          <div className="flex justify-center">
            <Button disabled={isLoading} type="submit">
              {isLoading ? "Signin.." : "Sign In"}
            </Button>
          </div>
        </form>
      </Form>

      {/* {error && <div>{error}</div>}

      <Button variant="secondary" onClick={() => {}}>
        <FcGoogle /> Sign In with Google
      </Button> */}

      <div className="">
        <p className="text-center text-gray-600">
          Don't have an account?{" "}
          <Link href="/sign-up" className="text-blue-500">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
