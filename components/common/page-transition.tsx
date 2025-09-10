'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.28, ease } }}
        exit={{ opacity: 0, y: -8, transition: { duration: 0.2, ease } }}
        className="flex-1"
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
}
