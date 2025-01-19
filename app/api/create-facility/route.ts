import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";

// userId         String
// user           User       @relation(fields: [userId], references: [id])
// firstName      String?
// lastName       String?
// address        String
// city           String
// email          String     @unique
// state          String
// zip            String
// phone          String
// primaryContact String

interface FacilityPayload {
  email: string;
  firstName: string;
  lastName: string;
  userId: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  primaryContact: string;
  password: string;
}

export async function POST(req: NextRequest) {
  try {
    const payload: FacilityPayload = await req.json();
    if (!payload || typeof payload !== "object") {
      console.error("Invalid payload received:", payload);
      return new Response(JSON.stringify({ error: "Invalid payload format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.log("Webhook payload:", payload);

    const {
      email,
      firstName,
      lastName,
      address,
      city,
      state,
      zipCode,
      phoneNumber,
      primaryContact,
      password,
    } = payload;

    const hashedPassword = await bcrypt.hash(password, 10);

    // Log the data being passed to Prisma
    console.log("Data passed to Prisma:", {
      email,
      firstName,
      lastName,
      address,
      city,
      state,
      zip: zipCode,
      phoneNumber,
      primaryContact,
      password: hashedPassword,
    });

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      console.error("User already exists with this email:", email);
      return new Response(
        JSON.stringify({ error: "User already exists with this email" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const createUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: "FACILITY",
      },
    });

    console.log("User created:", createUser);

    const facility = await prisma.facility.upsert({
      where: { email },
      update: {
        email,
        firstName,
        lastName,
        address,
        city,
        state,
        zip: zipCode,
        phone: phoneNumber,
        primaryContact,
        userId: createUser.id,
      },
      create: {
        email,
        firstName,
        lastName,
        address,
        city,
        state,
        zip: zipCode,
        phone: phoneNumber,
        primaryContact,
        userId: createUser.id,
      },
    });

    return new Response(JSON.stringify(facility), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error creating facility:", error.message, error.stack);
    return new Response(
      JSON.stringify({ error: "Failed to create facility" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
