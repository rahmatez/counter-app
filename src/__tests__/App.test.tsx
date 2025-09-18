import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App Component', () => {
  it('renders hello message and counter component', () => {
    render(<App />)

    // Test hello heading sesuai spesifikasi
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Interactive Counter App')

    // Test counter component ada
    expect(screen.getByText('Counter App')).toBeInTheDocument()
    expect(screen.getByTestId('count-value')).toBeInTheDocument()
    expect(screen.getByTestId('increment-btn')).toBeInTheDocument()
    expect(screen.getByTestId('decrement-btn')).toBeInTheDocument()
  })

  it('counter starts with value 0', () => {
    render(<App />)

    const countValue = screen.getByTestId('count-value')
    expect(countValue).toHaveTextContent('0')
  })

  it('decrement button is disabled when counter is 0', () => {
    render(<App />)

    const decrementBtn = screen.getByTestId('decrement-btn')
    expect(decrementBtn).toBeDisabled()
  })

  it('renders copyright footer with author information', () => {
    render(<App />)

    // Test copyright text
    expect(screen.getByText(/Made with/)).toBeInTheDocument()
    expect(screen.getByText('rahmatezdev')).toBeInTheDocument()

    // Test author link
    const authorLink = screen.getByRole('link', { name: 'rahmatezdev' })
    expect(authorLink).toHaveAttribute('href', 'https://github.com/rahmatez')
    expect(authorLink).toHaveAttribute('target', '_blank')
    expect(authorLink).toHaveAttribute('rel', 'noopener noreferrer')

    // Test tech stack
    expect(screen.getByText('React • TypeScript • Vite')).toBeInTheDocument()
  })
})
