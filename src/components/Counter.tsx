import { useState } from 'react'

// Interface untuk props Counter component
interface CounterProps {
  initial?: number
}

/**
 * Counter component dengan increment/decrement functionality
 * Tidak bisa turun di bawah 0 (decrement button akan disabled)
 */
export const Counter = ({ initial = 0 }: CounterProps) => {
  const [count, setCount] = useState<number>(initial)

  // Handler untuk increment counter
  const handleIncrement = () => {
    setCount((prev) => prev + 1)
  }

  // Handler untuk decrement counter (tidak boleh < 0)
  const handleDecrement = () => {
    setCount((prev) => Math.max(0, prev - 1))
  }

  return (
    <div className="counter">
      <h2>Click & Count</h2>

      {/* Counter value dengan aria-live untuk accessibility */}
      <div
        className="counter-display"
        aria-live="polite"
        aria-label={`Current count is ${count}`}
        data-testid="count-value"
      >
        <span className="counter-value">{count}</span>
      </div>

      <div className="counter-buttons">
        {/* Decrement button - disabled saat count = 0 */}
        <button
          type="button"
          onClick={handleDecrement}
          disabled={count === 0}
          aria-label="Decrease counter value"
          data-testid="decrement-btn"
          className="counter-btn decrement"
        >
          Decrement
        </button>

        {/* Increment button */}
        <button
          type="button"
          onClick={handleIncrement}
          aria-label="Increase counter value"
          data-testid="increment-btn"
          className="counter-btn increment"
        >
          Increment
        </button>
      </div>
    </div>
  )
}

export default Counter
