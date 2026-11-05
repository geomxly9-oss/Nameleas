import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useUI } from '../store/ui'

export default function Toast() {
  const toast = useUI((s) => s.toast)
  const clear = useUI((s) => s.clearToast)
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(clear, 3200)
    return () => clearTimeout(t)
  }, [toast, clear])
  return (
    <div aria-live="polite" aria-atomic="true">
      <AnimatePresence>
        {toast && (
          <motion.div key={toast.id} className="toast" initial={{ y: 30, opacity: 0, x: '-50%' }} animate={{ y: 0, opacity: 1, x: '-50%' }} exit={{ y: 20, opacity: 0, x: '-50%' }}>
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
