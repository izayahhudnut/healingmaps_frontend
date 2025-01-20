import prisma from "@/lib/prisma";

export async function getAllProviders() {
  try {
    const providers = await prisma.provider.findMany({
      include: {
        facility: true,
      },
      orderBy: {
        lastName: "asc",
      },
    });
    return providers;
  } catch (error) {
    console.error("Error getting all providers:", error);
    throw error;
  }
}

export async function getProviderById(id: string) {
  try {
    const provider = await prisma.provider.findUnique({
      where: { id },
      include: {
        facility: true,
      },
    });
    return provider;
  } catch (error) {
    console.error("Error getting provider by id:", error);
    throw error;
  }
}

export async function createProvider(data: {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageURL?: string;
  credentials?: string;
  npiNumber?: string;
  healthcare?: boolean;
  facilityId?: string;
}) {
  try {
    const provider = await prisma.provider.create({
      data: {
        userId: data.userId,
        email: data.email,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        imageURL: data.imageURL || null,
        credentials: data.credentials || "N/A", // Default value
        npiNumber: data.npiNumber || "N/A", // Default value
        healthcare: data.healthcare ?? false, // Default value
        facilityId: data.facilityId || null, // Optional field
      },
      include: {
        facility: true,
      },
    });
    return provider;
  } catch (error) {
    console.error("Error creating provider:", error);
    throw error;
  }
}

export async function updateProvider(
  userId: string,
  data: Partial<{
    firstName: string;
    lastName: string;
    credentials: string;
    npiNumber: string;
    healthcare: boolean;
    facilityId: string | null;
    imageURL: string;
    email: string;
  }>
) {
  try {
    const provider = await prisma.provider.update({
      where: { id: userId }, // Assuming you use `id` as the unique identifier
      data,
      include: {
        facility: true,
      },
    });
    return provider;
  } catch (error) {
    console.error("Error updating provider:", error);
    throw error;
  }
}

export async function deleteProvider(id: string) {
  try {
    const provider = await prisma.provider.delete({
      where: { id },
    });
    return provider;
  } catch (error) {
    console.error("Error deleting provider:", error);
    throw error;
  }
}
