export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-100 dark:bg-gray-900">
      <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400">
        Canlı Destek Analiz Paneli
      </h1>
      <p className="mt-4 text-gray-600 dark:text-gray-300">
        Temsilci performans verilerini analiz etmek için giriş yapın
      </p>
      <div className="mt-8">
        <a 
          href="/login"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          Giriş Yap
        </a>
      </div>
    </div>
  );
}