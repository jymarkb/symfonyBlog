import * as React from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export function CarouselDemo() {
  const techStack = [
    { name: 'Symfony', imgSrc: '/img/techstack/symfony.svg', href: '/' },
    { name: 'React', imgSrc: '/img/techstack/reactjs.svg', href: '/' },
    { name: 'Tailwind', imgSrc: '/img/techstack/tailwind.svg', href: '/' },
    { name: 'Typescript', imgSrc: '/img/techstack/typescript.svg', href: '/' },
    { name: 'Lucide', imgSrc: '/img/techstack/lucide.webp', href: '/' },
    { name: 'shadcn/ui', imgSrc: '/img/techstack/shadcn.svg', href: '/' },
    { name: 'Docker', imgSrc: '/img/techstack/docker.svg', href: '/' },
    { name: 'MySql', imgSrc: '/img/techstack/mysql.svg', href: '/' },
    { name: 'PHP', imgSrc: '/img/techstack/php.svg', href: '/' },
  ];

  {
    techStack.map((tech) => {
      console.log(tech);
    });
  }
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
        {techStack.map((tech, index) => {
          return (
            <CarouselItem key={index} className="carousel-item">
              <div className="p-1">
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center p-6 gap-2">
                    <img className="h-14 w-14" src={tech.imgSrc} />
                    <h3 className="text-3xl font-semibold text-primaryTheme">
                      {tech.name}
                    </h3>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
