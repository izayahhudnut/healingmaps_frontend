import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const {
    firstName,
    lastName,
    dob,
    gender,
    KetissuedOn,
    KetexpiresOn,
    race,
    email,
    facilityId,
    assessmentData,
  } = body;

  // Validate required fields
  if (
    !firstName ||
    !lastName ||
    !dob ||
    !gender ||
    !email ||
    facilityId === undefined
  ) {
    return new Response(
      JSON.stringify({
        error: "Missing required fields",
        details:
          "First name, last name, date of birth, gender, email, and facility ID are required",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const dobDate = new Date(dob);
  const ketIssuedDate = KetissuedOn ? new Date(KetissuedOn) : null;
  const ketExpiresDate = KetexpiresOn ? new Date(KetexpiresOn) : null;

  if (dobDate.toString() === "Invalid Date") {
    return new Response(
      JSON.stringify({ error: "Invalid date of birth format" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (assessmentData && typeof assessmentData !== "object") {
    return new Response(
      JSON.stringify({ error: "Invalid assessmentData format" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const sanitizedData = {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    dob: dobDate,
    gender,
    KetissuedOn: ketIssuedDate,
    KetexpiresOn: ketExpiresDate,
    race: race || "Not Specified",
    email: email.trim().toLowerCase(),
    facilityId,
    assessmentData: assessmentData ?? {}, // Default to null if undefined
  };

  console.log("Sanitized data:", sanitizedData);

  console.log("Assessment Data:", assessmentData);

  try {
    function generateSlug(firstName: string, lastName: string): string {
      const timestamp = Date.now();
      const sanitizedFirstName = firstName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      const sanitizedLastName = lastName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      return `${sanitizedFirstName}-${sanitizedLastName}-${timestamp}`;
    }

    const slug = generateSlug(sanitizedData.firstName, sanitizedData.lastName);

    const newPatient = await prisma.patient.create({
      data: {
        ...sanitizedData,
        facility: { connect: { id: facilityId } },
        slug: slug,

        // Ensure `assessmentData` is passed correctly
      },
    });

    return new Response(JSON.stringify(newPatient), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in Prisma create function:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to create patient",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
