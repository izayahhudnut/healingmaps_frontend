import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

const FacilityPayloadSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  name: z.string().min(1),
  address: z.string().min(1),
  phoneNumber: z.string().min(1),
  primaryContact: z.string().min(1),
  password: z.string().min(6),
});


export async function POST(req: NextRequest) {
  try {
    const payload = FacilityPayloadSchema.parse(await req.json());
    console.log("Parsed Payload:", payload);

    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (existingUser) {
      console.error("User already exists:", payload.email);
      return new Response(
        JSON.stringify({ error: "User already exists" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        password: hashedPassword,
        firstName: payload.firstName,
        lastName: payload.lastName,
        role: "FACILITY",
      },
    });
    console.log("User Created:", user);

    const facility = await prisma.facility.create({
      data: {
        email: payload.email,
        name: payload.name,
        firstName: payload.firstName,
        lastName: payload.lastName,
        address: payload.address,
        phone: payload.phoneNumber,
        primaryContact: payload.primaryContact,
        userId: user.id,
      },
    });
    console.log("Facility Created:", facility);

    return new Response(JSON.stringify(facility), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error creating facility:", error);

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: error.errors }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
