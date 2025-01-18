"use client";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";

import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

type Props = {
  code: string;
  email: string;
  setCode: (code: string) => void;
  verifyEmail: () => void;
};

const OtpComp = ({ code, email, setCode, verifyEmail }: Props) => {
  console.log(code);
  const handleChange = (value: string) => setCode(value);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (code.length !== 6) {
      alert("Please enter a valid 6-digit OTP.");
      return;
    }
    verifyEmail();
  };

  return (
    <div className="flex flex-col justify-center items-center gap-2 p-6 my-auto rounded-lg  space-y-4">
      <h1 className="text-1xl font-semibold text-center">Verify-OTP</h1>
      <p>Please check your email address and verify your email</p>
      <Badge className="bg-purple-800">{email}</Badge>
      <InputOTP
        maxLength={6}
        pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
        onChange={handleChange}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
      <Button onClick={handleSubmit}>Verify</Button>
    </div>
  );
};

export default OtpComp;
