import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ProfilePage() {
  const session = await auth();
  const isUserAdmin = session?.user?.email
    ? isAdmin(session.user.email)
    : false;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ... existing profile content ... */}

      {isUserAdmin && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Admin Functions</h2>
          <div className="space-y-4">
            <Link href="/admin/events">
              <Button className="w-full event-gradient">Manage Events</Button>
            </Link>
            {/* Add other admin functions here */}
          </div>
        </div>
      )}
    </div>
  );
}
