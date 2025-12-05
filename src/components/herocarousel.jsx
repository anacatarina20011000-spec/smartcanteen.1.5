// src/components/HeroCarousel.jsx
import React from "react";

export default function HeroCarousel({ images = ["/imagens/foto1.jpg", "/imagens/foto2.jpg", "/imagens/foto3.jpg"] }) {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % images.length), 4500);
    return () => clearInterval(t);
  }, [images.length]);

  if (!images || images.length === 0) return null;

  return (
    <div className="hero-card relative rounded-lg overflow-hidden">
      <div className="h-56 md:h-72 w-full bg-gray-200 flex items-center justify-center">
        <img src={images[index]} alt={`slide-${index}`} className="object-cover w-full h-full" />
      </div>

      <button aria-label="prev" onClick={() => setIndex(i => (i - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full p-2">
        ‹
      </button>
      <button aria-label="next" onClick={() => setIndex(i => (i + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full p-2">
        ›
      </button>

      <div className="absolute left-1/2 -translate-x-1/2 bottom-4 flex gap-2">
        {images.map((_, i) => (
          <button key={i} onClick={() => setIndex(i)} className={`w-2 h-2 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`} />
        ))}
      </div>
    </div>
  );
}
