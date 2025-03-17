
import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipIndicatorProps {
  indicator?: "line" | "dot" | "dashed"
  hideIndicator?: boolean
  color?: string
}

export function TooltipIndicator({
  indicator = "dot",
  hideIndicator = false,
  color,
}: TooltipIndicatorProps) {
  if (hideIndicator) {
    return null
  }

  return (
    <div
      className={cn(
        "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
        {
          "h-2.5 w-2.5": indicator === "dot",
          "w-1": indicator === "line",
          "w-0 border-[1.5px] border-dashed bg-transparent": indicator === "dashed",
        }
      )}
      style={
        {
          "--color-bg": color,
          "--color-border": color,
        } as React.CSSProperties
      }
    />
  )
}
