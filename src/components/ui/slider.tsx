"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
  value: number[]
  onValueChange: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  className?: string
  disabled?: boolean
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ value, onValueChange, min = 0, max = 100, step = 1, className, disabled }, ref) => {
    const percentage = ((value[0] - min) / (max - min)) * 100

    return (
      <div ref={ref} className={cn("relative flex w-full touch-none select-none items-center", className)}>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-700">
          <div
            className="absolute h-full bg-blue-500 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          disabled={disabled}
          onChange={(e) => onValueChange([parseFloat(e.target.value)])}
          className="absolute w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute h-5 w-5 rounded-full border-2 border-blue-500 bg-slate-950 ring-offset-background transition-colors focus-visible:outline-none pointer-events-none"
          style={{ left: `calc(${percentage}% - 10px)` }}
        />
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
