import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Counter from '../components/Counter'

describe('Counter Component', () => {
  it('renders with initial value of 0', () => {
    render(<Counter />)

    // Test heading tampil
    expect(screen.getByText('Counter App')).toBeInTheDocument()

    // Test nilai awal 0
    const countValue = screen.getByTestId('count-value')
    expect(countValue).toHaveTextContent('0')

    // Test tombol decrement disabled pada nilai 0
    const decrementBtn = screen.getByTestId('decrement-btn')
    expect(decrementBtn).toBeDisabled()

    // Test tombol increment tidak disabled
    const incrementBtn = screen.getByTestId('increment-btn')
    expect(incrementBtn).not.toBeDisabled()
  })

  it('renders with custom initial value', () => {
    render(<Counter initial={5} />)

    const countValue = screen.getByTestId('count-value')
    expect(countValue).toHaveTextContent('5')

    // Dengan nilai > 0, tombol decrement tidak disabled
    const decrementBtn = screen.getByTestId('decrement-btn')
    expect(decrementBtn).not.toBeDisabled()
  })

  it('increments counter when increment button is clicked', async () => {
    const user = userEvent.setup()
    render(<Counter />)

    const countValue = screen.getByTestId('count-value')
    const incrementBtn = screen.getByTestId('increment-btn')

    // Klik increment
    await user.click(incrementBtn)
    expect(countValue).toHaveTextContent('1')

    // Klik lagi
    await user.click(incrementBtn)
    expect(countValue).toHaveTextContent('2')
  })

  it('decrements counter when decrement button is clicked', async () => {
    const user = userEvent.setup()
    render(<Counter initial={3} />)

    const countValue = screen.getByTestId('count-value')
    const decrementBtn = screen.getByTestId('decrement-btn')

    // Klik decrement
    await user.click(decrementBtn)
    expect(countValue).toHaveTextContent('2')

    // Klik lagi
    await user.click(decrementBtn)
    expect(countValue).toHaveTextContent('1')
  })

  it('prevents counter from going below 0', async () => {
    const user = userEvent.setup()
    render(<Counter initial={1} />)

    const countValue = screen.getByTestId('count-value')
    const decrementBtn = screen.getByTestId('decrement-btn')

    // Turunkan ke 0
    await user.click(decrementBtn)
    expect(countValue).toHaveTextContent('0')

    // Tombol decrement harus disabled pada nilai 0
    expect(decrementBtn).toBeDisabled()

    // Coba klik lagi (seharusnya tidak berubah karena disabled)
    await user.click(decrementBtn)
    expect(countValue).toHaveTextContent('0')
  })

  it('enables decrement button after incrementing from 0', async () => {
    const user = userEvent.setup()
    render(<Counter />)

    const decrementBtn = screen.getByTestId('decrement-btn')
    const incrementBtn = screen.getByTestId('increment-btn')

    // Awalnya decrement disabled
    expect(decrementBtn).toBeDisabled()

    // Increment dari 0
    await user.click(incrementBtn)

    // Sekarang decrement harus enabled
    expect(decrementBtn).not.toBeDisabled()
  })

  it('has proper accessibility attributes', () => {
    render(<Counter />)

    const countValue = screen.getByTestId('count-value')
    const decrementBtn = screen.getByTestId('decrement-btn')
    const incrementBtn = screen.getByTestId('increment-btn')

    // Test aria-live untuk screen readers
    expect(countValue).toHaveAttribute('aria-live', 'polite')
    expect(countValue).toHaveAttribute('aria-label', 'Current count is 0')

    // Test aria-label pada tombol
    expect(decrementBtn).toHaveAttribute('aria-label', 'Decrease counter value')
    expect(incrementBtn).toHaveAttribute('aria-label', 'Increase counter value')

    // Test button type
    expect(decrementBtn).toHaveAttribute('type', 'button')
    expect(incrementBtn).toHaveAttribute('type', 'button')
  })

  it('updates aria-label when count changes', async () => {
    const user = userEvent.setup()
    render(<Counter />)

    const countValue = screen.getByTestId('count-value')
    const incrementBtn = screen.getByTestId('increment-btn')

    // Increment dan test aria-label update
    await user.click(incrementBtn)
    expect(countValue).toHaveAttribute('aria-label', 'Current count is 1')

    await user.click(incrementBtn)
    expect(countValue).toHaveAttribute('aria-label', 'Current count is 2')
  })
})
