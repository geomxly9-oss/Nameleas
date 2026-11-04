import { Link } from 'react-router'
import Logo from './Logo'
import { collections, byCollection } from '../data/products'
import { useSectionNav } from './useSectionNav'

export default function Footer() {
  const go = useSectionNav()
  return (
    <footer className="footer theme-dark" aria-label="Footer">
      <div className="wrap">
        <div className="footer__top">
          <div className="footer__brand">
            <Logo />
            <p>Independent Swiss watchmaking since 1907. Designed, made and regulated in the Val-de-Travers.</p>
          </div>
          <div>
            <h4>Collections</h4>
            <ul>
              {collections.map((c) => (
                <li key={c.id}>
                  <Link to={`/watch/${byCollection(c.id)[0].id}`}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Maison</h4>
            <ul>
              <li>
                <button type="button" onClick={() => go('story')}>
                  Our story
                </button>
              </li>
              <li>
                <button type="button" onClick={() => go('craft')}>
                  Craftsmanship
                </button>
              </li>
              <li>
                <button type="button" onClick={() => go('movement')}>
                  Calibre VT-28
                </button>
              </li>
              <li>
                <button type="button" onClick={() => go('journal')}>
                  The Journal
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4>Boutiques</h4>
            <ul>
              <li>Geneva, Rue du Rhône 48</li>
              <li>Paris, Place Vendôme 21</li>
              <li>Tokyo, Ginza 6-chome</li>
              <li>Dubai, Mall of the Emirates</li>
              <li>New York, Madison Avenue 711</li>
            </ul>
          </div>
        </div>
        <div className="footer__word" aria-hidden="true">
          VELORA
        </div>
        <div className="footer__legal">
          <span>© 2026 Velora Time SA, Les Verrières, Switzerland</span>
          <span>Five-year international warranty on every watch</span>
          <span>Prices in Swiss francs, duties included</span>
        </div>
      </div>
    </footer>
  )
}
