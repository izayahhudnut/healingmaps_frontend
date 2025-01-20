import { auth } from "@/auth";
import PatientListSection from "@/components/PatientListSection";

export default async function PatientListPage() {
  const session = await auth();
  console.log("Session:", session);
  return (
    <div>
      <PatientListSection user={session?.user} />
    </div>
  );
}
