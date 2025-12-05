// src/components/herocarousel.jsx
import React, { useState, useEffect } from "react";

/**
 * Coloca as tuas fotos em: public/imagens/1.jpg, 2.jpg, 3.jpg
 * (ou ajusta paths para /imagens/ se tens outra configuração).
 */
const slides = [
  { id: 1, title: "Refeições saudáveis", subtitle: "Pratos frescos todos os dias", img: "/imagens/foto1.jpg" },
  { id: 2, title: "Sabor caseiro", subtitle: "Receitas com amor", img: "/imagens/foto2.jpg" },
  { id: 3, title: "Opções vegetarianas", subtitle: "Variedade e cor", img: "/imagens/foto3.jpg" }
];

export default function HeroCarousel({ auto = true, interval = 5000 }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setIndex(i => (i + 1) % slides.length), interval);
    return () => clearInterval(t);
  }, [auto, interval]);

  return (
    <div className="relative rounded-lg overflow-hidden bg-white soft-shadow">
      <div className="h-56 md:h-72 flex">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={`w-full flex-shrink-0 transition-transform duration-500`} 
            style={{ transform: `translateX(${(i - index) * 100}%)` }}
          >
            <div className="h-56 md:h-72 bg-cover bg-center flex items-center" style={{ backgroundImage: `url(${s.img})` }}>
              <div className="bg-black bg-opacity-30 text-white p-6 rounded-md ml-6 max-w-md">
                <h3 className="text-2xl font-bold">{s.title}</h3>
                <p className="text-sm mt-2">{s.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute left-4 top-1/2 -translate-y-1/2">
        <button onClick={() => setIndex(i => (i - 1 + slides.length) % slides.length)} className="px-3 py-2 bg-white/80 rounded-full shadow">‹</button>
      </div>

      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        <button onClick={() => setIndex(i => (i + 1) % slides.length)} className="px-3 py-2 bg-white/80 rounded-full shadow">›</button>
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setIndex(i)} className={`w-3 h-3 rounded-full ${i === index ? "bg-white" : "bg-white/60"}`} />
        ))}
      </div>
    </div>
  );
}
