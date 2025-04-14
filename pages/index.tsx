import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") {
      return; // Wait for the session to load
    }
    if (status === "unauthenticated") {
      router.push('/login'); // Redirect to login if not authenticated
    }
  }, [status, router]);

  if (status === "loading") {
    return <p>Loading...</p>; // Show loading state while checking session
  }

  // If the user is authenticated, you can render the main content of the home page here
  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      {/* Add more content here for authenticated users */}
    </div>
  );
}
