/*
 * CorrelationsTab - Tab de Correlaciones Clínicas
 *
 * ESTADO: COMENTADO TEMPORALMENTE
 * TODO: Revisar y habilitar en el futuro cuando se necesite
 *
 * Este componente muestra correlaciones entre diferentes métricas de salud:
 * - Eficiencia del sueño vs SpO2
 * - Pico de flujo vs PM2.5
 * - Eficiencia del sueño vs Actividad
 * - PM2.5 vs HRV
 * - Pasos vs Calorías
 * - Actividad vs Calidad del aire
 *
 * Para habilitar:
 * 1. Descomentar todo el código en este archivo
 * 2. Descomentar el import en page.tsx
 * 3. Descomentar la línea en TabsList
 * 4. Descomentar el TabsContent en page.tsx
 */

// import React from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import {
//   ResponsiveContainer,
//   ScatterChart,
//   Scatter,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
// } from 'recharts';

// /**
//  * Data for clinical correlations (scatter plots)
//  */
// export interface CorrelationClinicalData {
//   fecha: string;
//   eficienciaSueno?: number;
//   spo2?: number;
//   pm25?: number;
//   picoFlujo?: number;
//   minutosActivos?: number;
//   hrv?: number;
// }

// /**
//  * Data for activity correlations
//  */
// export interface CorrelationActivityData {
//   fecha: string;
//   pasos?: number;
//   calorias?: number;
//   calidad?: number;
// }

// export interface CorrelationsTabProps {
//   /**
//    * Clinical correlations data
//    */
//   clinicalData: CorrelationClinicalData[];

//   /**
//    * Activity correlations data
//    */
//   activityData: CorrelationActivityData[];
// }

// /**
//  * CorrelationsTab component for displaying health metrics correlations
//  *
//  * Follows SRP: Only handles correlations tab display
//  * Uses scatter plots to show relationships between metrics
//  *
//  * @example
//  * ```tsx
//  * <CorrelationsTab
//  *   clinicalData={correlacionesClinicas}
//  *   activityData={correlacionData}
//  * />
//  * ```
//  */
// export function CorrelationsTab({ clinicalData, activityData }: CorrelationsTabProps) {
//   return (
//     <div className="space-y-4">
//       {/* Description Card */}
//       <Card className="bg-purple-50 border-purple-200">
//         <CardHeader className="pb-3">
//           <CardTitle className="text-lg flex items-center gap-2">
//             <span className="text-purple-600">📊</span>
//             Correlaciones Clínicas
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <p className="text-sm text-gray-700 leading-relaxed">
//             Estas gráficas muestran las{' '}
//             <span className="font-semibold">relaciones entre diferentes métricas de salud</span>. Las
//             correlaciones permiten identificar patrones entre la calidad del sueño, función pulmonar, actividad
//             física y factores ambientales, facilitando la comprensión integral del estado del paciente.
//           </p>
//         </CardContent>
//       </Card>

//       {/* Grid de correlaciones clínicas */}
//       <div className="grid gap-4 md:grid-cols-2">
//         {/* 1. Eficiencia del sueño vs SpO2 */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Eficiencia del Sueño vs SpO2</CardTitle>
//             <CardDescription>Relación entre calidad del sueño y saturación de oxígeno</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <ScatterChart>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis
//                   dataKey="eficienciaSueno"
//                   name="Eficiencia Sueño %"
//                   domain={[0, 100]}
//                   label={{ value: 'Eficiencia Sueño (%)', position: 'insideBottom', offset: -5 }}
//                 />
//                 <YAxis
//                   dataKey="spo2"
//                   name="SpO2 %"
//                   domain={[90, 100]}
//                   label={{ value: 'SpO2 (%)', angle: -90, position: 'insideLeft' }}
//                 />
//                 <Tooltip
//                   cursor={{ strokeDasharray: '3 3' }}
//                   formatter={(value) => (typeof value === 'number' ? value.toFixed(2) : value)}
//                 />
//                 <Legend verticalAlign="top" height={36} />
//                 <Scatter data={clinicalData} fill="#8b5cf6" name="Puntos" />
//               </ScatterChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>

//         {/* 2. Pico de Flujo vs PM2.5 */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Pico de Flujo vs PM2.5</CardTitle>
//             <CardDescription>Impacto de la calidad del aire en la función pulmonar</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <ScatterChart>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis
//                   dataKey="pm25"
//                   name="PM2.5 (µg/m³)"
//                   label={{ value: 'PM2.5 (µg/m³)', position: 'insideBottom', offset: -5 }}
//                 />
//                 <YAxis
//                   dataKey="picoFlujo"
//                   name="Pico Flujo (L/min)"
//                   domain={[350, 420]}
//                   label={{ value: 'Pico Flujo (L/min)', angle: -90, position: 'insideLeft' }}
//                 />
//                 <Tooltip
//                   cursor={{ strokeDasharray: '3 3' }}
//                   formatter={(value) => (typeof value === 'number' ? value.toFixed(2) : value)}
//                 />
//                 <Legend verticalAlign="top" height={36} />
//                 <Scatter data={clinicalData} fill="#f59e0b" name="Puntos" />
//               </ScatterChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>

//         {/* 3. Eficiencia del sueño vs Minutos activos */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Eficiencia del Sueño vs Actividad</CardTitle>
//             <CardDescription>Relación entre calidad del sueño y minutos de actividad</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <ScatterChart>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis
//                   dataKey="minutosActivos"
//                   name="Minutos Activos"
//                   label={{ value: 'Minutos Activos', position: 'insideBottom', offset: -5 }}
//                 />
//                 <YAxis
//                   dataKey="eficienciaSueno"
//                   name="Eficiencia Sueño %"
//                   domain={[0, 100]}
//                   label={{ value: 'Eficiencia Sueño (%)', angle: -90, position: 'insideLeft' }}
//                 />
//                 <Tooltip
//                   cursor={{ strokeDasharray: '3 3' }}
//                   formatter={(value) => (typeof value === 'number' ? value.toFixed(2) : value)}
//                 />
//                 <Legend verticalAlign="top" height={36} />
//                 <Scatter data={clinicalData} fill="#10b981" name="Puntos" />
//               </ScatterChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>

//         {/* 4. PM2.5 vs HRV */}
//         <Card>
//           <CardHeader>
//             <CardTitle>PM2.5 vs Variabilidad Cardíaca (HRV)</CardTitle>
//             <CardDescription>Impacto de la contaminación en la variabilidad del ritmo cardíaco</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <ScatterChart>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis
//                   dataKey="pm25"
//                   name="PM2.5 (µg/m³)"
//                   label={{ value: 'PM2.5 (µg/m³)', position: 'insideBottom', offset: -5 }}
//                 />
//                 <YAxis
//                   dataKey="hrv"
//                   name="HRV (ms)"
//                   domain={[0, 120]}
//                   label={{ value: 'HRV (ms)', angle: -90, position: 'insideLeft' }}
//                 />
//                 <Tooltip
//                   cursor={{ strokeDasharray: '3 3' }}
//                   formatter={(value) => (typeof value === 'number' ? value.toFixed(2) : value)}
//                 />
//                 <Legend verticalAlign="top" height={36} />
//                 <Scatter data={clinicalData} fill="#ef4444" name="Puntos" />
//               </ScatterChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>

//         {/* 5. Pasos vs Calorías */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Pasos vs Calorías</CardTitle>
//             <CardDescription>Correlación entre actividad física y gasto calórico</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <ScatterChart>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis
//                   dataKey="pasos"
//                   name="Pasos"
//                   label={{ value: 'Pasos', position: 'insideBottom', offset: -5 }}
//                 />
//                 <YAxis
//                   dataKey="calorias"
//                   name="Calorías"
//                   label={{ value: 'Calorías', angle: -90, position: 'insideLeft' }}
//                 />
//                 <Tooltip
//                   cursor={{ strokeDasharray: '3 3' }}
//                   formatter={(value) => (typeof value === 'number' ? value.toFixed(2) : value)}
//                 />
//                 <Legend verticalAlign="top" height={36} />
//                 <Scatter data={activityData} fill="#3b82f6" name="Puntos" />
//               </ScatterChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>

//         {/* 6. Actividad vs Calidad de Aire */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Actividad vs Calidad del Aire</CardTitle>
//             <CardDescription>Relación entre nivel de actividad y condiciones ambientales</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <ScatterChart>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis
//                   dataKey="pasos"
//                   name="Pasos"
//                   label={{ value: 'Pasos', position: 'insideBottom', offset: -5 }}
//                 />
//                 <YAxis
//                   dataKey="calidad"
//                   name="Índice Calidad"
//                   label={{ value: 'Índice Calidad', angle: -90, position: 'insideLeft' }}
//                 />
//                 <Tooltip
//                   cursor={{ strokeDasharray: '3 3' }}
//                   formatter={(value) => (typeof value === 'number' ? value.toFixed(2) : value)}
//                 />
//                 <Legend verticalAlign="top" height={36} />
//                 <Scatter data={activityData} fill="#06b6d4" name="Puntos" />
//               </ScatterChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }

// Placeholder export para mantener la estructura
export {};
