import Link from "next/link";

export default function Home() {

  console.log(require('crypto').randomBytes(32).toString('hex'))

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">IT Школа</h1>
      <p className="text-lg mb-4">Добро пожаловать в нашу платформу обучения!</p>
      <Link href="/login">
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
          Войти
        </button>
      </Link>
    </div>
  );
}
