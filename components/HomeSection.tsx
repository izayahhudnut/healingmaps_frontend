import { auth } from "@/auth";

export default async function HomeSection() {
  // Get the userId from auth() -- if null, the user is not signed in

  // Get the user's first name from the session
  const session = await auth();
  const firstName = session?.user?.name || "User";
  const role = session?.user?.role || "User";
  console.log("Role:", role);

  console.log("Session:", session);

  return (
    <div className="p-8 bg-white max-w-[60rem] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">
          Welcome {firstName}
        </h1>
        <p className="text-gray-600">Select an option below to get started.</p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-3 gap-6">
        {/* {[
          {
            title: "Medication Quick Check",
            description:
              "Add and modify medications and cannabis to quickly screen for risks.",
            link: "/quick-check",
          },
          {
            title: "Patient List",
            description:
              "View your list of patients and access their profile, medications, and notes.",
            link: "/patient-list",
          },
          {
                title: "Back to HealingMaps",
                description:
                  "Exit to our website to learn more about precision ketamine.",
                link: "/provider",
              }
            
        ].map((item, index) => ( */}
        <div className="border border-gray-200 rounded-lg p-4 shadow hover:shadow-md transition bg-white">
          <h2 className="text-lg font-medium text-gray-800 mb-2">
            Medication Quick Check
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Add and modify medications and cannabis to quickly screen for risks.
          </p>
          <a
            href={"/quick-check"}
            className="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm hover:bg-black transition"
          >
            Go
          </a>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 shadow hover:shadow-md transition bg-white">
          <h2 className="text-lg font-medium text-gray-800 mb-2">
            Patient List
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            View your list of patients and access their profile, medications,
            and notes.
          </p>
          <a
            href={"/patient-list"}
            className="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm hover:bg-black transition"
          >
            Go
          </a>
        </div>
        {role === "FACILITY" && (
          <div className="border border-gray-200 rounded-lg p-4 shadow hover:shadow-md transition bg-white">
            <h2 className="text-lg font-medium text-gray-800 mb-2">
              Back to HealingMaps
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Exit to our website to learn more about precision ketamine.
            </p>
            <a
              href={"/provider"}
              className="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm hover:bg-black transition"
            >
              Go
            </a>
          </div>
        )}
        {/* ))} */}
      </div>
    </div>
  );
}
