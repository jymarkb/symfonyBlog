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
    { name: 'TinyMCE', imgSrc: '/img/techstack/tiny.webp', href: '/' },
    { name: 'Docker', imgSrc: '/img/techstack/docker.svg', href: '/' },
    { name: 'MySql', imgSrc: '/img/techstack/mysql.svg', href: '/' },
    { name: 'PHP', imgSrc: '/img/techstack/php.svg', href: '/' },
    { name: 'AWS', imgSrc: '/img/techstack/aws.svg', href: '/' },
    { name: 'Github', imgSrc: '/img/techstack/github.svg', href: '/' },
  ];

  return (
    <Carousel
      className="w-full"
      opts={{
        align: 'start', // Ensures one item moves at a time
        loop: true, // Keeps it scrolling infinitely
        containScroll: 'keepSnaps', // Ensures proper snapping
      }}
      // plugins={[
      //   Autoplay({
      //     delay: 2000, // Slide every 2 seconds
      //     stopOnInteraction: false, // Keeps autoplay running
      //     stopOnMouseEnter: true, // Stops when hovering
      //   }),
      // ]}
    >
      <CarouselContent>
        {techStack.map((tech, index) => {
          return (
            <CarouselItem
              key={index}
              className="carousel-item transtion duration-300"
            >
              <div className="p-1">
                <Card className="w-full sm:w-auto">
                  <CardContent className="flex flex-col items-center justify-center p-4 sm:p-6 gap-2">
                    <img
                      className="h-12 w-12 sm:h-14 sm:w-14 object-cover"
                      src={tech.imgSrc}
                      alt={tech.name}
                    />
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-primaryTheme text-center w-full">
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
