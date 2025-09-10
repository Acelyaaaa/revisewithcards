"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { PropsWithChildren } from "react";

export default function AnimationProvider({ children }: PropsWithChildren) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname} // animate on route change
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } }}
        exit={{ opacity: 0, y: -6, transition: { duration: 0.18, ease: "easeIn" } }}
        className="min-h-[60vh]"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
