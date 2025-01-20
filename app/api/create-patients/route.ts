import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received body:", body);

    // Log facility check
    console.log("Checking facility:", body.facilityId);

    const facility = await prisma.facility.findUnique({
      where: { email: body.facilityEmail },
    });
    console.log("Found facility:", facility);

    const provider = await prisma.provider.findUnique({
      where: { email: body.facilityEmail },
    });

    if (!facility && !provider) {
      return NextResponse.json(
        {
          error: "Facility or provider not found",
          details: "Facility or provider not found",
        },
        { status: 404 }
      );
    }

    const slug = `${body.firstName}-${
      body.lastName
    }-${Date.now()}`.toLowerCase();

    const patientData = {
      firstName: body.firstName,
      lastName: body.lastName,
      dob: new Date(body.dob),
      gender: body.gender,
      KetissuedOn: body.KetissuedOn ? new Date(body.KetissuedOn) : null,
      KetexpiresOn: body.KetexpiresOn ? new Date(body.KetexpiresOn) : null,
      race: body.race,
      email: body.email,
      slug,
      facilityId: facility ? facility.id : provider?.facilityId, // Direct assignment instead of connect
      assessmentData: body.assessmentData || null,
    };

    console.log("Creating patient with data:", patientData);

    const newPatient = await prisma.patient.create({
      data: patientData,
      include: {
        facility: true,
      },
    });

    console.log("Created patient:", newPatient);
    return NextResponse.json(newPatient, { status: 201 });
  } catch (error: any) {
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      meta: error.meta,
    });

    return NextResponse.json(
      {
        error: "Failed to create patient",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
