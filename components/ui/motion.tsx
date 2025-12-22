"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import type { MotionProps, Transition } from "framer-motion";

import { Button } from "@/components/ui/button";

const EASE_OUT: Transition["ease"] = [0.16, 1, 0.3, 1];
const EASE_IO: Transition["ease"] = [0.4, 0, 0.2, 1];

export function FadeIn(props: React.ComponentProps<"div"> & MotionProps) {
  const { className, ...rest } = props;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.35, ease: EASE_OUT }}
      className={className}
      {...rest}
    />
  );
}

export const MotionButton = forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & MotionProps
>(({ className, children, ...rest }, ref) => {
  return (
    <motion.div whileTap={{ scale: 0.97 }} whileHover={{ y: -1 }}>
      <Button ref={ref} className={className} {...rest}>
        {children}
      </Button>
    </motion.div>
  );
});
MotionButton.displayName = "MotionButton";

export function LoadingDots({ className }: { className?: string }) {
  const t: Transition = { repeat: Infinity, repeatType: "reverse", duration: 0.6, ease: EASE_IO };
  return (
    <div className={`inline-flex items-center gap-1 ${className ?? ""}`}>
      <motion.span className="h-2 w-2 rounded-full bg-current" initial={{ y: 0, opacity: 0.5 }} animate={{ y: -4, opacity: 1 }} transition={t} />
      <motion.span className="h-2 w-2 rounded-full bg-current" initial={{ y: 0, opacity: 0.5 }} animate={{ y: -4, opacity: 1 }} transition={{ ...t, delay: 0.12 }} />
      <motion.span className="h-2 w-2 rounded-full bg-current" initial={{ y: 0, opacity: 0.5 }} animate={{ y: -4, opacity: 1 }} transition={{ ...t, delay: 0.24 }} />
    </div>
  );
}
