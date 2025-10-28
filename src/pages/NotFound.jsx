export default function NotFound() {
  return (
    <main className="h-screen flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold text-red-500">404</h1>
      <p className="text-gray-400 mt-2">Page not found</p>
      <a href="/" className="text-blue-400 mt-4 hover:underline">
        Go back home
      </a>
    </main>
  );
}
