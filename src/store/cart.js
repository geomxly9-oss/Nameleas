import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getProduct } from '../data/products'

const safeStorage = createJSONStorage(() => {
  try {
    const k = '__velora_test__'
    window.localStorage.setItem(k, k)
    window.localStorage.removeItem(k)
    return window.localStorage
  } catch {
    const mem = new Map()
    return { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), removeItem: (k) => mem.delete(k) }
  }
})

export const useCart = create(
  persist(
    (set, get) => ({
      items: [], // { id, qty }
      open: false,
      lastAdded: null,
      add: (id, qty = 1, openDrawer = true) => {
        const items = [...get().items]
        const i = items.findIndex((x) => x.id === id)
        if (i >= 0) items[i] = { ...items[i], qty: Math.min(5, items[i].qty + qty) }
        else items.push({ id, qty })
        set({ items, open: openDrawer ? true : get().open, lastAdded: id })
      },
      setQty: (id, qty) => set({ items: get().items.map((x) => (x.id === id ? { ...x, qty: Math.max(1, Math.min(5, qty)) } : x)) }),
      remove: (id) => set({ items: get().items.filter((x) => x.id !== id) }),
      clear: () => set({ items: [] }),
      setOpen: (open) => set({ open }),
    }),
    { name: 'velora-cart', storage: safeStorage, partialize: (s) => ({ items: s.items }) },
  ),
)

const safeQty = (q) => Math.min(5, Math.max(1, Math.floor(Number(q)) || 1))

// Items are rehydrated from localStorage, so treat them as untrusted input.
export const cartLines = (items) =>
  (Array.isArray(items) ? items : [])
    .map((x) => ({ id: x?.id, qty: safeQty(x?.qty), product: getProduct(x?.id) }))
    .filter((x) => x.product)

export const cartCount = (items) => cartLines(items).reduce((a, b) => a + b.qty, 0)
export const cartTotal = (items) => cartLines(items).reduce((a, b) => a + b.product.price * b.qty, 0)
