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

  console.log("Patient ID:", patientId);

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
        const {
          thcInteraction,
          cbdInteraction,
          ketamineInteraction,
          medications = [],
          notes = [],
          assessmentData = {},
          generatedAlerts = [],
        } = req.body;

        console.log("Updating patient:", req.body);

        const updatedPatient = await prisma.$transaction(async (tx) => {
          await tx.patient.update({
            where: { id: patientId },
            data: {
              thcInteraction: !!thcInteraction,
              cbdInteraction: !!cbdInteraction,
              ketamineInteraction: !!ketamineInteraction,
              assessmentData,
            },
          });

          await tx.medication.deleteMany({ where: { patientId } });
          if (medications.length > 0) {
            await tx.medication.createMany({
              data: medications.map((m: any) => ({
                name: m.drugName,
                medicationId: parseInt(m.medispanID, 10),
                patientId,
              })),
            });
          }

          await tx.note.deleteMany({ where: { patientId } });
          if (notes.length > 0) {
            await tx.note.createMany({
              data: notes.map((n: any) => ({
                text: n.description || "",
                patientId,
                title: n.title || "(No title)",
              })),
            });
          }

          await tx.alert.deleteMany({ where: { patientId } });
          if (generatedAlerts.length > 0) {
            await tx.alert.createMany({
              data: generatedAlerts.map((a: any) => ({
                patientId,
                title: a.title,
                description: a.description,
              })),
            });
          }

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
      } catch (error: any) {
        console.error("Error updating patient:", error);
        return res
          .status(500)
          .json({ error: error.message || "Failed to update patient" });
      }

    default:
      res.setHeader("Allow", ["GET", "PUT"]);
      return res
        .status(405)
        .json({ error: `Method ${req.method} not allowed` });
  }
}
