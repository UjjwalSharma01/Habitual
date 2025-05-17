'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const testimonials = [
  {
    content: "Habitual has completely transformed how I approach my daily routines. The heatmap visualization is so satisfying to see fill up!",
    author: {
      name: 'Alex Johnson',
      role: 'Product Manager',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  },
  {
    content: "I've tried many habit tracking apps but Habitual stands out with its clean design and motivational features. The AI quotes keep me going even on tough days.",
    author: {
      name: 'Sarah Chen',
      role: 'Software Engineer',
      imageUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  },
  {
    content: "The analytics in Habitual have helped me identify patterns in my habits that I never noticed before. This app is genuinely helping me improve my life.",
    author: {
      name: 'Michael Thomas',
      role: 'Fitness Coach',
      imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  },
];

export default function TestimonialsSection() {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <div className="relative isolate overflow-hidden bg-gradient-to-b from-accent/50 to-background py-24 sm:py-32">
      <div className="absolute inset-0 -z-10 opacity-20">
        <svg
          className="absolute inset-0 h-full w-full stroke-primary/30"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="grid-pattern"
              width="32"
              height="32"
              patternUnits="userSpaceOnUse"
              x="50%"
              y="100%"
              patternTransform="translate(0, -1)"
            >
              <path d="M0 32V.5H32" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <motion.h2
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="text-lg font-semibold leading-8 tracking-tight text-primary"
          >
            Testimonials
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Hear what our users are saying
          </motion.p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 grid-rows-1 gap-8 text-sm leading-6 text-gray-900 sm:mt-20 sm:grid-cols-2 xl:mx-0 xl:max-w-none xl:grid-cols-3">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.author.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
              className="rounded-2xl bg-card-background p-6 shadow-sm ring-1 ring-border"
            >
              <figure className="relative h-full flex flex-col">
                <blockquote className="flex-grow">
                  <p className="text-foreground">{testimonial.content}</p>
                </blockquote>
                <figcaption className="relative mt-6 flex items-center gap-x-4 pt-4 border-t border-border">
                  <img src={testimonial.author.imageUrl} alt="" className="h-10 w-10 rounded-full bg-gray-50" />
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.author.name}</div>
                    <div className="text-muted-foreground">{testimonial.author.role}</div>
                  </div>
                </figcaption>
              </figure>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
