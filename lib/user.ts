import { auth } from "@/auth";
import prisma from "./prisma";

export async function User(id: string) {
  const session = await auth();

  try {
    if (!session?.user) {
      throw new Error("Not authorized to view this page");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return { user };
  } catch (error: any) {
    return { error: error.message };
  }
}
