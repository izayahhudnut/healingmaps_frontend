import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { createProvider } from "@/lib/provider";

export const POST = async (req: NextRequest) => {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  console.log("WEBHOOK_SECRET:", WEBHOOK_SECRET);
  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      {
        error:
          "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local",
      },
      { status: 500 }
    );
  }

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error("Missing required headers:", {
      svixId,
      svixTimestamp,
      svixSignature,
    });
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  const payload = await req.json();
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: any;

  try {
    evt = wh.verify(JSON.stringify(payload), {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return NextResponse.json(
      { error: "Error verifying webhook" },
      { status: 400 }
    );
  }

  console.log("Webhook event:", evt);

  if (evt.type === "user.created") {
    try {
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data;
      const email = email_addresses?.[0]?.email_address;
      if (!id || !email) {
        console.error("Missing required fields:", { id, email });
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      console.log("Creating provider:", {
        id,
        email,
        first_name,
        last_name,
        image_url,
      });

      await createProvider({
        userId: id,
        email,
        firstName: first_name || undefined,
        lastName: last_name || undefined,
        imageURL: image_url || undefined,
        credentials: undefined,
        npiNumber: undefined,
        healthcare: false,
        facilityId: undefined,
      });
    } catch (error) {
      console.error("Error processing user.created event:", error);
      return NextResponse.json(
        { error: "Error processing event" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ message: "Webhook processed" }, { status: 200 });
};
