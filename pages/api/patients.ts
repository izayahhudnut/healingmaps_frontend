import { NextApiRequest, NextApiResponse } from "next";
import { getAllPatients, createPatient, deletePatient } from "@/lib/patient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "GET":
        const patients = await getAllPatients();
        return res.status(200).json(patients);

      case "POST":
        return handleCreatePatient(req, res);

      case "DELETE":
        return handleDeletePatient(req, res); // Ensure the DELETE method is called

      default:
        res.setHeader("Allow", ["GET", "POST", "DELETE"]);
        return res
          .status(405)
          .json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error("Unexpected error in API handler:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
}

async function handleCreatePatient(req: NextApiRequest, res: NextApiResponse) {
  const {
    firstName,
    lastName,
    dob,
    gender,
    KetissuedOn,
    KetexpiresOn,
    race,
    email,
    facilityId, // Ensure this is destructured from the request body
  } = req.body;

  console.log(req.body);

  // Validate required fields
  if (
    !firstName ||
    !lastName ||
    !dob ||
    !gender ||
    !email ||
    facilityId === undefined
  ) {
    return res.status(400).json({
      error: "Missing required fields",
      details:
        "First name, last name, date of birth, gender, email, and facility ID are required",
    });
  }

  const dobDate = new Date(dob);
  const ketIssuedDate = KetissuedOn ? new Date(KetissuedOn) : null;
  const ketExpiresDate = KetexpiresOn ? new Date(KetexpiresOn) : null;

  // Validate date formats
  if (dobDate.toString() === "Invalid Date") {
    return res.status(400).json({ error: "Invalid date of birth format" });
  }

  try {
    const sanitizedData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dob: dobDate,
      gender,
      KetissuedOn: ketIssuedDate,
      KetexpiresOn: ketExpiresDate,
      race: race || "Not Specified",
      email: email.trim().toLowerCase(),
      facilityId, // Use the facilityId from the request body
    };

    console.log("Sanitized data:", sanitizedData);

    const newPatient = await createPatient(sanitizedData); // Ensure the `createPatient` function handles `facilityId`
    return res.status(201).json(newPatient);
  } catch (error) {
    console.error("Error creating patient:", error);
    return res.status(500).json({ error: "Failed to create patient" });
  }
}

async function handleDeletePatient(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: "Patient ID is required" });
  }

  try {
    const deletedPatient = await deletePatient(id);
    return res
      .status(200)
      .json({ message: "Patient deleted successfully", deletedPatient });
  } catch (error) {
    console.error(`Error deleting patient with ID ${id}:`, error);
    return res.status(500).json({ error: "Failed to delete patient" });
  }
}
