import { Provider } from "@/components/Provider";
import { getFacilityById } from "@/lib/facility";
import { currentUser } from "@clerk/nextjs/server";

export default async function Page() {
  const user = await currentUser();
  const role = user?.unsafeMetadata.role as string;
  console.log(user);

  if (!user) {
    throw new Error("User not found");
  }

  const email = user?.unsafeMetadata?.email as string;

  const data = await getFacilityById(email);

  console.log(data);

  if (!data) {
    throw new Error("Facility not found");
  }

  return (
    <div>
      <Provider data={data.providers} role={role} />
    </div>
  );
}
