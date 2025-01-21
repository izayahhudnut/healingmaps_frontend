import { auth } from "@/auth";
import UserProfile from "@/components/UserProfile";
import { User } from "@/lib/user";

const ProfilePage = async () => {
  const session = await auth();

  if (!session?.user) {
    return <div>Not authorized to view this page</div>;
  }

  const data = session.user.id
    ? await User(session.user.id)
    : { error: "User ID is undefined" };

  if (data.error || !data.user) {
    return <div>{data.error || "User data not found"}</div>;
  }

  console.log(data.user);

  return (
    <>
      <UserProfile
        //   @ts-ignore
        user={{
          ...data.user,
          name: data.user.name ?? "", // Fallback to an empty string if name is null
        }}
      />
    </>
  );
};

export default ProfilePage;
