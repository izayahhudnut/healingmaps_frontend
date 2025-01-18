import prisma from '@/lib/prisma';

interface PatientData {
  firstName: string;
  lastName: string;
  dob: Date;
  gender: string;
  KetissuedOn?: Date | null;
  KetexpiresOn?: Date | null;
  race: string;
  email: string;
  assessmentData?: any;  
}

export async function getAllPatients() {
  try {
    return await prisma.patient.findMany({
      include: { facility: true },
      orderBy: { lastName: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching all patients:', error);
    throw new Error('Failed to fetch patients');
  }
}

export async function getPatientBySlug(slug: string) {
  try {
    const patient = await prisma.patient.findUnique({
      where: { slug },
      include: { facility: true },
    });
    
    if (!patient) {
      throw new Error(`Patient with slug "${slug}" not found`);
    }
    
    return patient;
  } catch (error) {
    console.error('Error fetching patient by slug:', error);
    throw new Error('Failed to fetch patient');
  }
}

export async function createPatient(data: PatientData) {
  try {
    const slug = generateSlug(data.firstName, data.lastName);
    
    // Create the base patient data object with required fields
    const patientData = {
      ...data,
      slug,
      KetissuedOn: data.KetissuedOn || null,
      KetexpiresOn: data.KetexpiresOn || null,
      race: data.race || 'Not Specified',
      
      // If you want to allow creating with assessmentData (optional)
      assessmentData: data.assessmentData || null,
    };

    const patient = await prisma.patient.create({
      data: patientData,
      include: {
        facility: true,
      },
    });

    return patient;
  } catch (error) {
    console.error('Error in Prisma create function:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to create patient: ${error.message}`);
    }
    throw new Error('Failed to create patient');
  }
}


export async function updatePatient(id: number, data: Partial<PatientData>) {
  try {
    const currentPatient = await prisma.patient.findUnique({
      where: { id },
      include: { facility: true },
    });

    if (!currentPatient) {
      throw new Error(`Patient with ID "${id}" not found`);
    }

    // Generate new slug only if name is being updated
    const slug = (data.firstName || data.lastName)
      ? generateSlug(
          data.firstName || currentPatient.firstName,
          data.lastName || currentPatient.lastName
        )
      : currentPatient.slug;

    // Prepare update data
    const updateData = {
      ...data,
      slug,
      // Ensure date fields are properly handled
      dob: data.dob || undefined,
      KetissuedOn: data.KetissuedOn === undefined ? undefined : data.KetissuedOn,
      KetexpiresOn: data.KetexpiresOn === undefined ? undefined : data.KetexpiresOn,
      race: data.race || undefined,

      // If we pass 'assessmentData' in data, store it; otherwise leave it alone
      assessmentData:
        data.assessmentData === undefined
          ? undefined // don't override if not specified
          : data.assessmentData,
    };

    const updatedPatient = await prisma.patient.update({
      where: { id },
      data: updateData,
      include: {
        facility: true,
      },
    });

    return updatedPatient;
  } catch (error) {
    console.error('Error updating patient:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to update patient: ${error.message}`);
    }
    throw new Error('Failed to update patient');
  }
}


export async function deletePatient(id: number) {
  try {
    const deletedPatient = await prisma.patient.delete({
      where: { id },
    });

    if (!deletedPatient) {
      throw new Error(`Failed to delete patient with ID "${id}"`);
    }

    return deletedPatient;
  } catch (error) {
    console.error('Error deleting patient:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to delete patient: ${error.message}`);
    }
    throw new Error('Failed to delete patient');
  }
}

export async function getPatientById(id: number) {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        facility: true,
        alerts: true,
        medications: true,
        notes: true,
        // JSON fields are scalar fields, so generally included by default. 
        // If you prefer explicit, you can do:
        // select: {
        //   // other fields
        //   assessmentData: true
        // }
      },
    });

    if (!patient) {
      throw new Error(`Patient with ID "${id}" not found`);
    }

    return patient;
  } catch (error) {
    console.error('Error fetching patient by ID:', error);
    throw new Error('Failed to fetch patient');
  }
}

  

function generateSlug(firstName: string, lastName: string): string {
  const timestamp = Date.now();
  const sanitizedFirstName = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const sanitizedLastName = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${sanitizedFirstName}-${sanitizedLastName}-${timestamp}`;
}

export async function searchPatients(searchTerm: string) {
  try {
    return await prisma.patient.findMany({
      where: {
        OR: [
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      include: { facility: true },
      orderBy: { lastName: 'asc' },
    });
  } catch (error) {
    console.error('Error searching patients:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to search patients: ${error.message}`);
    }
    throw new Error('Failed to search patients');
  }
}