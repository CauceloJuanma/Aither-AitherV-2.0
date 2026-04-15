"use client"
import React, { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';

const HolographicCard = () => {
  const ref = useRef<HTMLDivElement>(null);

  // Valores de movimiento para el efecto 3D
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Suavizado del mouse con spring physics para que se sienta "orgánico"
  const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const xPct = (clientX - left) / width - 0.5;
    const yPct = (clientY - top) / height - 0.5;

    // Actualizamos los valores (el multiplicador 20 controla la intensidad del tilt)
    x.set(xPct);
    y.set(yPct);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  // Gradiente dinámico que sigue el mouse (el "brillo" holográfico)
  const bg = useMotionTemplate`radial-gradient(
    650px circle at ${mouseX.get() * 100 + 50}% ${mouseY.get() * 100 + 50}%,
    rgba(255,255,255,0.15),
    transparent 80%
  )`;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        transform: useMotionTemplate`rotateX(${mouseY.get() * -20}deg) rotateY(${mouseX.get() * 20}deg)`,
      }}
      className="relative h-96 w-72 rounded-xl bg-gradient-to-br from-slate-900 to-black border border-white/10 shadow-2xl transition-all duration-200 ease-out hover:shadow-cyan-500/20 group perspective-1000"
    >
      {/* Capa de brillo dinámico */}
      <motion.div
        style={{ background: bg }}
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />

      <div className="absolute inset-4 flex flex-col justify-end rounded-lg border border-white/5 bg-white/5 p-4 backdrop-blur-sm transform-gpu translate-z-10">
        <div className="h-10 w-10 rounded-full bg-cyan-400/30 blur-md absolute top-4 right-4 animate-pulse" />
        <h2 className="text-2xl font-bold text-white mb-2 translate-z-20">Aaron Hernandez</h2>
        <p className="text-slate-300 text-sm translate-z-10">
          Frontend Developer
        </p>
        <div className="mt-4 flex gap-2">
           <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">React</span>
           <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">Gemini</span>
        </div>
      </div>
    </motion.div>
  );
};

export default HolographicCard;