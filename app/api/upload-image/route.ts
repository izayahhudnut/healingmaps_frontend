import { NextResponse } from "next/server";
import axios from "axios";
import FormData from "form-data";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;
    const session = await auth();

    console.log("Session:", session, "File:", formData);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const form = new FormData();
    form.append("image", buffer, file.name);

    // Upload to ImageBB
    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${process.env.IMAGEBB_API_KEY}`,
      form,
      {
        headers: form.getHeaders(),
      }
    );

    const imageUrl = response.data.data.url;

    // Update user profile with image URL
    await prisma.user.update({
      where: { id: userId },
      data: { image: imageUrl },
    });

    return NextResponse.json({ url: imageUrl }, { status: 200 });
  } catch (error: any) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
