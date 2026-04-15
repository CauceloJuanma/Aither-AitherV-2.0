import React from 'react';

interface PatientCardsProps {
  selectedPatients: string[];
}

export default function PatientCards({ selectedPatients }: PatientCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
      {selectedPatients.map((patientId) => (
        <div
          key={patientId}
          className="bg-white border-2 border-blue-500 rounded-lg p-4 shadow-sm"
        >
          <div className="font-bold text-gray-900 text-lg mb-1">{patientId}</div>
          <div className="text-xs text-blue-600 font-medium">Monitoreo activo</div>
        </div>
      ))}
    </div>
  );
}
