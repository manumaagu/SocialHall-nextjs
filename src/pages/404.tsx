import React from "react";
import Link from "next/link";

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">404 - Página no encontrada</h1>
      <p className="text-lg text-gray-600 mb-8">
        Lo sentimos, la página que buscas no existe.
      </p>
      <img
        src="https://via.placeholder.com/300"
        alt="404 Not Found"
        className="w-64"
      />
      <Link href="/" className="text-blue-500 underline">
        Volver al Home
      </Link>
    </div>
  );
};

export default NotFoundPage;