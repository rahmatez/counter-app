import Counter from './components/Counter'
import './styles.css'

/**
 * Main App component
 * Menampilkan Hello message dan Counter component
 */
function App() {
  return (
    <div className="app">
      <main className="app-main">
        {/* Hello heading sesuai spesifikasi */}
        <h1 className="app-title">Interactive Counter App</h1>

        {/* Counter component */}
        <Counter initial={0} />

        {/* Copyright Footer */}
        <footer className="app-footer">
          <p className="copyright-text">
            Made with{' '}
            <span className="heart" aria-label="love">
              ⚒️
            </span>{' '}
            by{' '}
            <a
              href="https://github.com/rahmatez"
              target="_blank"
              rel="noopener noreferrer"
              className="author-link"
            >
              rahmatezdev
            </a>
          </p>
          <p className="tech-stack">
            React • TypeScript • Vite
          </p>
        </footer>
      </main>
    </div>
  )
}

export default App
