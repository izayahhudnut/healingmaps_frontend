import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";

// id          String    @id @default(cuid())
// firstName   String?
// lastName    String?
// imageURL    String?
// email       String    @unique
// credentials String?
// npiNumber   String?
// userId      String
// user        User      @relation(fields: [userId], references: [id])
// healthcare  Boolean   @default(false)
// facilityId  String?

interface ProviderPayload {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageURL?: string;
  credentials?: string;
  npiNumber?: string;
  healthcare?: boolean;
  facilityId?: string;
  password: string;
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
      email,
      firstName,
      lastName,
      imageURL,
      credentials,
      npiNumber,
      healthcare,
      facilityId,
    });

    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (user) {
      return new Response(
        JSON.stringify({ error: "User with this email already exists" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const createUser = await prisma.user.upsert({
      where: { email: email },
      update: {
        email: email,
        firstName: firstName || null,
        lastName: lastName || null,
        password: hashedPassword,
        role: "PROVIDER",
      },
      create: {
        email: email,
        firstName: firstName || null,
        lastName: lastName || null,
        password: hashedPassword,
        role: "PROVIDER",
      },
    });

    const provider = await prisma.provider.create({
      data: {
        userId: createUser.id,
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
