"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "~/lib/utils";

const item = {
  hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

interface AnimationWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimationWrapper({
  children,
  className,
}: AnimationWrapperProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={item}
      className={cn("w-full", className)}
    >
      {children}
    </motion.div>
  );
}
