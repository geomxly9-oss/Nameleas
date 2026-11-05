import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { scrollToTarget } from '../lib/scroll'

export function useSectionNav() {
  const navigate = useNavigate()
  const location = useLocation()
  return useCallback(
    (id) => {
      if (location.pathname === '/') scrollToTarget(`#${id}`)
      else navigate('/', { state: { scrollTo: id } })
    },
    [location.pathname, navigate],
  )
}

export const NAV = [
  { id: 'collections', label: 'Collections' },
  { id: 'craft', label: 'Craftsmanship' },
  { id: 'components', label: 'Components' },
  { id: 'movement', label: 'Calibre' },
  { id: 'story', label: 'Maison' },
]
