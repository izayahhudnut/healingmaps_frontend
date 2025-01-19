"use client";
import React, { useState } from "react";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { useForm } from "react-hook-form";
import { ProviderCreate } from "@/lib/zod/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Separator } from "./ui/separator";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import Link from "next/link";

import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import OtpComp from "./OtpComp";
import axios from "axios";

type Props = {
  data: any;
};

const ProviderModal = ({ data: facility }: Props) => {
  //
  const router = useRouter();

  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [code, setCode] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const form = useForm<ProviderCreate>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      imageUrl: "",
      nipNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ProviderCreate) => {
    console.log(data);
    setIsLoading(true);
    try {
      if (data.password !== data.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const response = await axios.post("/api/create-provider", {
        ...data,
        facilityId: facility.id,
      });

      console.log("Facility created:", response.data);

      // setPendingVerification(true);
      setOpen(false);
      toast({
        variant: "default",
        title: "Success",
        description: "Provider created successfully",
      });
    } catch (err: any) {
      console.error("Sign up error:", err);

      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    } finally {
      setIsLoading(false);
      router.refresh();
      form.reset();
    }
  };
  // const verifyEmail = async () => {
  //   if (!isLoaded) return;
  //   try {
  //     const userVerify = await signUp.attemptEmailAddressVerification({
  //       code,
  //     });
  //     console.log("Email verification successful:", userVerify);
  //     if (userVerify.status !== "complete") {
  //       console.log("Email not verified");
  //     }
  //     if (userVerify.status === "complete") {
  //       console.log("Email verified");
  //       setActive({
  //         session: userVerify.createdSessionId,
  //       });

  //       router.push("/");
  //     }

  //     setPendingVerification(false);
  //   } catch (err: any) {
  //     console.error("Email verification error:", err);
  //   }
  // };

  return (
    <>
      <DialogContent className="w-2/5 max-w-4/5">
        <DialogHeader>
          <DialogTitle className="my-2 text-2xl">Add Providers</DialogTitle>
          <Separator className="" />
        </DialogHeader>

        <>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid grid-cols-2 gap-4 my-4">
                {[
                  {
                    name: "firstName",
                    label: "First Name",
                    placeholder: "John",
                    required: true,
                  },
                  {
                    name: "lastName",
                    label: "Last Name",
                    placeholder: "Doe",
                    required: true,
                  },
                  {
                    name: "email",
                    label: "Email",
                    placeholder: "example@gmail.com",
                    required: true,
                  },
                  {
                    name: "nipNumber",
                    label: "NIP Number",
                    placeholder: "081234567890",
                    required: false,
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

              <div className="flex gap-x-4  justify-end my-2">
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Close
                  </Button>
                </DialogClose>

                <Button disabled={isLoading} type="submit">
                  {isLoading ? "Adding.." : "Add Provider"}
                </Button>
              </div>
            </form>
          </Form>
        </>
      </DialogContent>
    </>
  );
};

export default ProviderModal;
