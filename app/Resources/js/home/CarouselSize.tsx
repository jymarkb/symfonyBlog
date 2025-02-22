import * as React from 'react';
import Autoplay from 'embla-carousel-autoplay';

export function Example() {
  return (
    <Carousel
      plugins={[
        Autoplay({
          delay: 2000,
        }),
      ]}
    >
      // ...
    </Carousel>
  );
}

import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export function CarouselDemo() {
  return (
    <Carousel
      className="w-full"
      opts={{
        align: 'start', // Ensures one item moves at a time
        loop: true, // Keeps it scrolling infinitely
        containScroll: 'keepSnaps', // Ensures proper snapping
      }}
      plugins={[
        Autoplay({
          delay: 2000, // Slide every 2 seconds
          stopOnInteraction: false, // Keeps autoplay running
          stopOnMouseEnter: true, // Stops when hovering
        }),
      ]}
    >
      <CarouselContent>
        {Array.from({ length: 10 }).map((_, index) => (
          <CarouselItem key={index} className="carousel-item">
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="text-4xl font-semibold">
                    Logo {index + 1}
                  </span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
