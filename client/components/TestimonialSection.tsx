import { useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { TESTIMONIALS } from "../data/pageData";

export default function TestimonialSection() {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const testimonials = TESTIMONIALS;

  const handlePrevious = () => {
    setCarouselIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1,
    );
  };

  const handleNext = () => {
    setCarouselIndex((prev) =>
      prev === testimonials.length - 1 ? 0 : prev + 1,
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.changedTouches[0].screenX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTouchEndX(e.changedTouches[0].screenX);
    if (touchStartX - touchEndX > 50) {
      handleNext();
    }
    if (touchEndX - touchStartX > 50) {
      handlePrevious();
    }
  };

  return (
    <section className="px-6 py-12 md:px-12">
      <div className="max-w-7xl mx-auto">
        <h2
          className="text-3xl md:text-[32px] font-bold text-wevets-blue text-center mb-12"
          style={{
            fontFamily: "Fields, sans-serif",
            letterSpacing: "-1.2px",
            lineHeight: "120%",
          }}
        >
          Quem cuida dos pets, cura do coração
        </h2>

        {/* Desktop Carousel */}
        <div className="hidden md:grid md:grid-cols-3 md:gap-6">
          {testimonials.map((testimonial, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex gap-1 mb-3">
                {Array.from({ length: testimonial.stars }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p
                className="text-wevets-institutional text-sm mb-4"
                style={{ lineHeight: "22.75px" }}
              >
                {testimonial.text}
              </p>
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.image}
                  alt={testimonial.author}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-wevets-blue">
                    {testimonial.author}
                  </p>
                  <p className="text-xs text-wevets-institutional">
                    {testimonial.type}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden">
          <div
            className="flex overflow-hidden rounded-2xl"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="min-w-full bg-white p-6 border border-gray-100"
                style={{
                  transform: `translateX(-${carouselIndex * 100}%)`,
                  transition: "transform 0.3s ease-out",
                }}
              >
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: testimonial.stars }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p
                  className="text-wevets-institutional text-sm mb-4"
                  style={{ lineHeight: "22.75px" }}
                >
                  {testimonial.text}
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.author}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-wevets-blue">
                      {testimonial.author}
                    </p>
                    <p className="text-xs text-wevets-institutional">
                      {testimonial.type}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={handlePrevious}
              className="p-2 rounded-full bg-wevets-cyan text-white hover:bg-opacity-90 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-full bg-wevets-cyan text-white hover:bg-opacity-90 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
