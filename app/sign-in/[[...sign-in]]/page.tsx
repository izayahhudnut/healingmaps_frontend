import SignIn from "@/components/SignIn";

import { useRouter } from "next/navigation";

export default async function Page() {
  return (
    <div className="h-[90VH] flex items-center justify-center">
      <SignIn />
    </div>
  );
}
