// pages/api/patient/[id].ts

import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { getPatientById } from "@/lib/patient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const patientId = id as string;

  switch (req.method) {
    case "GET":
      try {
        const patient = await getPatientById(patientId);
        if (!patient) {
          return res.status(404).json({ error: "Patient not found" });
        }
        return res.status(200).json(patient);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to fetch patient" });
      }

    case "PUT":
      try {
        // 1. Parse the incoming body
        const {
          thcInteraction,
          cbdInteraction,
          ketamineInteraction,
          medications = [],
          notes = [],
          // new fields:
          assessmentData = null,
          // Or, if your front-end calls it `generatedAlerts`:
          generatedAlerts = [],
        } = req.body;

        // 2. Run everything in a transaction
        const updatedPatient = await prisma.$transaction(async (tx) => {
          // 2a. Update the patient toggles & store `assessmentData` (if your Patient has a JSON column)
          await tx.patient.update({
            where: { id: patientId },
            data: {
              thcInteraction: !!thcInteraction,
              cbdInteraction: !!cbdInteraction,
              ketamineInteraction: !!ketamineInteraction,
              assessmentData, // <--- store the entire assessment data JSON
            },
          });

          // 2b. Replace MEDICATIONS
          await tx.medication.deleteMany({
            where: { patientId },
          });
          if (Array.isArray(medications) && medications.length > 0) {
            await tx.medication.createMany({
              data: medications.map((m: any) => ({
                name: m.drugName,
                medicationId: parseInt(m.medispanID, 10),
                patientId,
              })),
            });
          }

          // 2c. Replace NOTES
          await tx.note.deleteMany({
            where: { patientId },
          });
          if (Array.isArray(notes) && notes.length > 0) {
            await tx.note.createMany({
              data: notes.map((n: any) => ({
                text: n.description || "",
                patientId,
                title: n.title || "(No title)",
              })),
            });
          }

          // 2d. Replace ALERTS (system + user-defined)
          //     For this example, we assume you want to nuke old alerts
          //     and insert all new ones from `generatedAlerts`.
          await tx.alert.deleteMany({
            where: { patientId },
          });
          if (Array.isArray(generatedAlerts) && generatedAlerts.length > 0) {
            await tx.alert.createMany({
              data: generatedAlerts.map((a: any) => ({
                patientId,
                title: a.title,
                description: a.description,
              })),
            });
          }

          // 2e. Return the fully updated patient
          return tx.patient.findUnique({
            where: { id: patientId },
            include: {
              facility: true,
              alerts: true,
              medications: true,
              notes: true,
            },
          });
        });

        return res.status(200).json(updatedPatient);
      } catch (error) {
        console.error("Error updating patient:", error);
        return res.status(500).json({ error: "Failed to update patient" });
      }

    default:
      res.setHeader("Allow", ["GET", "PUT"]);
      return res
        .status(405)
        .json({ error: `Method ${req.method} not allowed` });
  }
}
