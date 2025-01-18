import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

interface FacilityPayload {
  id: string;
  email: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  primaryContact: string;
  website?: string;
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    if (!payload || typeof payload !== "object") {
      console.error("Invalid payload received:", payload);
      return new Response(JSON.stringify({ error: "Invalid payload format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.log("Webhook payload:", payload);

    const {
      id,
      email,
      name,
      address,
      city,
      state,
      zipCode,
      phoneNumber,
      primaryContact,
    } = payload;

    // Log the data being passed to Prisma
    console.log("Data passed to Prisma:", {
      clerkId: id,
      name,
      email,
      address,
      city,
      state,
      zip: zipCode,
      phone: phoneNumber,
      primaryContact,
    });

    const facility = await prisma.facility.create({
      data: {
        clerkId: id,
        name,
        email,
        address,
        city,
        state,
        zip: zipCode,
        phone: phoneNumber,
        primaryContact,
        // Include website if provided
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
