"use client";
import Navbar from "@/components/auth/Navbar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useRouter } from 'next/navigation';

export default function PredecirPage() {
  const router = useRouter();

  return (
    <ProtectedRoute requireAdmin={false}>
          <Navbar />
          <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Header */}
                <div className="flex justify-between items-center">
                  <div>
                  <h1 className="text-3xl font-bold text-gray-900">Servicio de IA</h1>
                  <p className="text-gray-600 mt-1">Predicción de enfermedades a los pacientes</p>
                </div>
                <button
                  onClick={() => router.push('/')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium text-sm"
                >
                  Volver al inicio
                </button>
              </div>
            </div>
          </div>
    </ProtectedRoute>
  );
}