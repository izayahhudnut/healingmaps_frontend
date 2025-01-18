import HomeSection from "@/components/HomeSection";

import { currentUser } from "@clerk/nextjs/server";

export default async function HomePage() {
  const user = await currentUser();

  console.log(user?.unsafeMetadata.role);
  return (
    <div>
      <HomeSection />
    </div>
  );
}
