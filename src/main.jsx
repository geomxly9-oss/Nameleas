import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/bodoni-moda/opsz.css'
import '@fontsource-variable/bodoni-moda/opsz-italic.css'
import '@fontsource-variable/archivo/wdth.css'
import './styles/global.css'
import App from './App'

async function ready() {
  try {
    await Promise.race([
      Promise.all([
        document.fonts.load('500 40px "Bodoni Moda Variable"'),
        document.fonts.load('italic 500 40px "Bodoni Moda Variable"'),
        document.fonts.load('600 40px "Archivo Variable"'),
      ]),
      new Promise((r) => setTimeout(r, 2500)),
    ])
  } catch {
    /* fonts are a nicety for canvas textures; never block the app */
  }
}

ready().then(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
