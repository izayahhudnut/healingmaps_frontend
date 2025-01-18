import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

interface ProviderPayload {
  clerkUserId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageURL?: string;
  credentials?: string;
  npiNumber?: string;
  healthcare?: boolean;
  facilityId?: number;
}

export async function POST(req: NextRequest) {
  try {
    const payload: ProviderPayload = await req.json();
    if (!payload || typeof payload !== "object") {
      console.error("Invalid payload received:", payload);
      return new Response(JSON.stringify({ error: "Invalid payload format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.log("Webhook payload:", payload);

    const {
      clerkUserId,
      email,
      firstName,
      lastName,
      imageURL,
      credentials,
      npiNumber,
      healthcare,
      facilityId,
    } = payload;

    // Log the data being passed to Prisma
    console.log("Data passed to Prisma:", {
      clerkUserId,
      email,
      firstName,
      lastName,
      imageURL,
      credentials,
      npiNumber,
      healthcare,
      facilityId,
    });

    const provider = await prisma.provider.create({
      data: {
        clerkUserID: clerkUserId,
        email: email,
        firstName: firstName || null,
        lastName: lastName || null,
        imageURL: imageURL || null,
        credentials: credentials || "N/A", // Default value
        npiNumber: npiNumber || "N/A", // Default value
        healthcare: healthcare ?? false, // Default value
        facilityId: facilityId || null, // Optional field
      },
      include: {
        facility: true,
      },
    });

    return new Response(JSON.stringify(provider), {
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
