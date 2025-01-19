import { auth } from "@/auth";
import { Provider } from "@/components/Provider";
import { getFacilityById } from "@/lib/facility";

export default async function Page() {
  const session = await auth();
  const role = session?.user.role;
  console.log(role);

  if (!session?.user) {
    throw new Error("User not found");
  }

  const email = session?.user.email;

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
