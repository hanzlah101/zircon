"use client";

import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import { useIntersectionObserver } from "usehooks-ts";

import Hero1 from "@/../public/hero-1.png";
import Hero2 from "@/../public/hero-2.png";
import Hero3 from "@/../public/hero-3.png";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useEffect, useRef } from "react";

export function Hero() {
  return (
    <Carousel
      plugins={[Fade(), Autoplay({ delay: 5000 })]}
      opts={{ loop: true }}
    >
      <CarouselContent>
        {Array.from({ length: 3 }).map((_, i) => (
          <CarouselItem key={i}>
            <div className="relative aspect-video w-full">
              <Image
                fill
                src={i === 0 ? Hero1 : i === 1 ? Hero2 : Hero3}
                alt="hero"
                objectFit="cover"
                loading="eager"
                placeholder="blur"
                draggable={false}
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { isIntersecting, ref } = useIntersectionObserver({
    threshold: 0.5,
  });

  useEffect(() => {
    if (videoRef.current) {
      if (isIntersecting) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isIntersecting]);

  return (
    <video
      ref={(node) => {
        ref(node);
        videoRef.current = node;
      }}
      className="aspect-video w-full object-cover"
      src="/hero-video.mp4"
      loop
      muted
      playsInline
      controls={false}
      preload="none"
    />
  );
}
