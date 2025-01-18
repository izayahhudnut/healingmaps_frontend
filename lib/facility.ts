import prisma from "./prisma";

export async function getAllFacilities() {
  try {
    const facility = await prisma.facility.findMany({
      include: {
        providers: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    return facility;
  } catch (error) {
    console.error("Error getting all providers:", error);
    throw error;
  }
}

export async function getFacilityById(email: string) {
  try {
    const facility = await prisma.facility.findUnique({
      where: { email },
      include: {
        providers: true,
      },
    });
    return facility;
  } catch (error) {
    console.error("Error getting facility by id:", error);
    throw error;
  }
}
