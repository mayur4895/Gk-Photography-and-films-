'use client'

import { cn } from "@/lib/utils";
import { IconLayoutNavbarCollapse } from "@tabler/icons-react";
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import { useRef, useState } from "react";

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  desktopClassName?: string;
  mobileClassName?: string;
}) => {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
};const FloatingDockMobile = ({
    items,
    className,
  }: {
    items: { title: string; icon: React.ReactNode; href: string }[];
    className?: string;
  }) => {
    return (
      <div className={cn("relative  translate-y-11  block md:hidden -top-20 left-0 right-0", className)}>
        <motion.div
          className= "mx-auto  flex md:hidden h-14 gap-4 items-end rounded-2xl  backdrop-blur-sm bg bg-zinc-800/20 dark:bg-neutral-900 px-4 pb-3"
        >
          {items.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{
                opacity: 0,
                y: 10,
                transition: { delay: idx * 0.05 },
              }}
              transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              className="flex items-center justify-center"
            >
              <Link
                href={item.href}
                className="h-8 w-8 rounded-full bg-neutral-900     flex items-center justify-center transition-transform duration-300 ease-in-out hover:bg-gray-600 dark:hover:bg-neutral-700"
              >
                <div className="h-4 w-4 flex items-center justify-center">
                  {item.icon}
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  };
  

const FloatingDockDesktop = ({
  items,
  className,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  className?: string;
}) => {
  let mouseX = useMotionValue(Infinity);
  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto hidden md:flex h-14 gap-4 items-end rounded-2xl  backdrop-blur-sm bg bg-zinc-800/20 dark:bg-neutral-900 px-4 pb-3",
        className
      )}
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} {...item} />
      ))}
    </motion.div>
  );
};

function IconContainer({
    mouseX,
    title,
    icon,
    href,
  }: {
    mouseX: MotionValue;
    title: string;
    icon: React.ReactNode;
    href: string;
  }) {
    let ref = useRef<HTMLDivElement>(null);
  
    let distance = useTransform(mouseX, (val) => {
      let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
      return val - bounds.x - bounds.width / 2;
    });
  
    // Adjust transformations to prevent excessive growth
    let widthTransform = useTransform(distance, [-80, 0, 80], [30, 60, 30]);
    let heightTransform = useTransform(distance, [-80, 0, 80], [30, 60, 30]);
    let widthTransformIcon = useTransform(distance, [-80, 0, 80], [15, 30, 15]);
    let heightTransformIcon = useTransform(distance, [-80, 0, 80], [15, 30, 15]);
  
    let width = useSpring(widthTransform, {
      mass: 0.1,
      stiffness: 150,
      damping: 12,
    });
    let height = useSpring(heightTransform, {
      mass: 0.1,
      stiffness: 150,
      damping: 12,
    });
    let widthIcon = useSpring(widthTransformIcon, {
      mass: 0.1,
      stiffness: 150,
      damping: 12,
    });
    let heightIcon = useSpring(heightTransformIcon, {
      mass: 0.1,
      stiffness: 150,
      damping: 12,
    });
  
    const [hovered, setHovered] = useState(false);
  
    return (
      <Link href={href}>
        <motion.div
          ref={ref}
          style={{ width, height }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="aspect-square rounded-full   bg-neutral-900  flex items-center justify-center relative"
        >
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0, y: -10, x: "-50%" }}
                animate={{ opacity: 1, y: -20, x: "-50%" }}
                exit={{ opacity: 0, y: -10, x: "-50%" }}
                className="px-2 py-0.5 whitespace-pre rounded-md bg-neutral-900     text-white  absolute left-1/2 -translate-x-1/2 -bottom-full mb-2 w-fit text-xs"
              >
                {title}
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            style={{ width: widthIcon, height: heightIcon }}
            className="flex items-center justify-center   text-white  "
          >
            {icon}
          </motion.div>
        </motion.div>
      </Link>
    );
  }
  