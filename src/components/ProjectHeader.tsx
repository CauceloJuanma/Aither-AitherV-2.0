import React from 'react';
import Image from 'next/image';

/**
 * ProjectHeader component - Displays project and funding entity logos
 * Shows project logo on the left and funding information on the right
 */
export default function ProjectHeader() {
  return (
    <header className="w-full bg-gradient-to-r from-white to-gray-50 border-b-2 border-gray-300 shadow-sm py-4 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Logo del Proyecto - Left */}
        <div className="flex-shrink-0">
          <Image
            src="/images/logos/Logo_ciserone.png"
            alt="Logo CISERONE"
            width={140}
            height={70}
            className="h-14 w-auto sm:h-16"
            priority
          />
        </div>

        {/* Funding Information - Right */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <div className="text-center sm:text-right">
            <p className="text-sm sm:text-base text-gray-800 font-semibold">
              Proyecto PID2021-126810OB-I00
            </p>
            <p className="text-xs sm:text-sm text-gray-600">
              financiado por:
            </p>
          </div>
          <Image
            src="/images/logos/Entidad_Financiadora.png"
            alt="Entidad Financiadora"
            width={180}
            height={70}
            className="h-12 w-auto sm:h-14"
            priority
          />
        </div>
      </div>
    </header>
  );
}
