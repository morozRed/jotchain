"use client"

import { Clock } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  className?: string
  placeholder?: string
}

export function TimePicker({
  value = "09:00",
  onChange,
  disabled,
  className,
  placeholder = "Select time",
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [tempHour, setTempHour] = React.useState("09")
  const [tempMinute, setTempMinute] = React.useState("00")

  React.useEffect(() => {
    if (value) {
      const [hour, minute] = value.split(":")
      setTempHour(hour?.padStart(2, "0") || "09")
      setTempMinute(minute?.padStart(2, "0") || "00")
    }
  }, [value])

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"))
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0"),
  )

  const handleSelect = (hour: string, minute: string) => {
    const newValue = `${hour}:${minute}`
    onChange?.(newValue)
    setOpen(false)
  }

  const handleHourClick = (hour: string) => {
    setTempHour(hour)
  }

  const handleMinuteClick = (minute: string) => {
    handleSelect(tempHour, minute)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className,
          )}
          disabled={disabled}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          <div className="h-[200px] w-20 overflow-y-auto">
            <div className="flex flex-col p-2">
              {hours.map((hour) => (
                <Button
                  key={hour}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 w-16 justify-center px-0 font-normal",
                    tempHour === hour && "bg-accent font-medium",
                  )}
                  onClick={() => handleHourClick(hour)}
                >
                  {hour}
                </Button>
              ))}
            </div>
          </div>
          <div className="h-[200px] w-px bg-border" />
          <div className="h-[200px] w-20 overflow-y-auto">
            <div className="flex flex-col p-2">
              {minutes.map((minute) => (
                <Button
                  key={minute}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 w-16 justify-center px-0 font-normal",
                    tempMinute === minute && "bg-accent font-medium",
                  )}
                  onClick={() => handleMinuteClick(minute)}
                >
                  {minute}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
