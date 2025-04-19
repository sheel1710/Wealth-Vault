import { useAuth } from "@/hooks/use-auth";

export default function TestAuthPage() {
  // Try to use the auth context to see if it's accessible
  try {
    const auth = useAuth();
    return (
      <div className="p-12">
        <h1 className="text-3xl font-bold mb-4">Auth Test Page</h1>
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Auth Context Status:</h2>
          <p>Is Available: ✅</p>
          <p>Is Loading: {auth.isLoading ? "Yes" : "No"}</p> 
          <p>Is User Logged In: {auth.user ? "Yes" : "No"}</p>
        </div>
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify(auth, null, 2)}
        </pre>
      </div>
    );
  } catch (error: any) {
    // If the useAuth hook throws an error, display it
    return (
      <div className="p-12">
        <h1 className="text-3xl font-bold mb-4">Auth Test Page</h1>
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Auth Context Status:</h2>
          <p className="text-red-500">Is Available: ❌</p>
          <p className="text-red-500 font-bold">Error: {error.message}</p>
        </div>
      </div>
    );
  }
}