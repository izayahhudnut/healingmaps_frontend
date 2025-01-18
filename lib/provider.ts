import prisma from '@/lib/prisma'

export async function getAllProviders() {
  try {
    const providers = await prisma.provider.findMany({
      include: {
        facility: true,
      },
      orderBy: {
        lastName: 'asc',
      },
    })
    return providers
  } catch (error) {
    console.error('Error getting all providers:', error)
    throw error
  }
}

export async function getProviderById(id: number) {
  try {
    const provider = await prisma.provider.findUnique({
      where: { id },
      include: {
        facility: true,
      },
    })
    return provider
  } catch (error) {
    console.error('Error getting provider by id:', error)
    throw error
  }
}

export async function createProvider(data: {
    clerkUserID: string
    email: string
    firstName?: string
    lastName?: string
    imageURL?: string
    credentials?: string
    npiNumber?: string
    healthcare?: boolean
    facilityId?: number
  }) {
    try {
      const provider = await prisma.provider.create({
        data: {
          clerkUserID: data.clerkUserID,
          email: data.email,
          firstName: data.firstName || null,
          lastName: data.lastName || null,
          imageURL: data.imageURL || null,
          credentials: data.credentials || 'N/A', // Default value
          npiNumber: data.npiNumber || 'N/A', // Default value
          healthcare: data.healthcare ?? false, // Default value
          facilityId: data.facilityId || null, // Optional field
        },
        include: {
          facility: true,
        },
      });
      return provider;
    } catch (error) {
      console.error('Error creating provider:', error);
      throw error;
    }
  }
  

  export async function updateProvider(
    clerkUserID: string,
    data: Partial<{
      firstName: string
      lastName: string
      credentials: string
      npiNumber: string
      healthcare: boolean
      facilityId: number
      imageURL: string
      email: string
    }>
  ) {
    try {
      const provider = await prisma.provider.update({
        where: { clerkUserID }, // Assuming you use `clerkUserID` as the unique identifier
        data,
        include: {
          facility: true,
        },
      });
      return provider;
    } catch (error) {
      console.error('Error updating provider:', error);
      throw error;
    }
  }
  

export async function deleteProvider(id: number) {
  try {
    const provider = await prisma.provider.delete({
      where: { id },
    })
    return provider
  } catch (error) {
    console.error('Error deleting provider:', error)
    throw error
  }
}