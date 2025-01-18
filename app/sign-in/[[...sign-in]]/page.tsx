import SignIn from "@/components/SignIn";
import { currentUser } from "@clerk/nextjs/server";
import { useRouter } from "next/navigation";

export default async function Page() {
  return (
    <div className="h-[90VH] flex items-center justify-center">
      <SignIn />
    </div>
  );
}
