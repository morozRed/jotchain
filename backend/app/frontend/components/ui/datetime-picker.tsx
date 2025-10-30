"use client"

import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface DateTimePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  disabled?: boolean
  className?: string
  placeholder?: string
}

export function DateTimePicker({
  value,
  onChange,
  disabled,
  className,
  placeholder = "Pick a date & time",
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value)
  const [tempHour, setTempHour] = React.useState("09")
  const [tempMinute, setTempMinute] = React.useState("00")

  React.useEffect(() => {
    if (value) {
      setSelectedDate(value)
      setTempHour(value.getHours().toString().padStart(2, "0"))
      setTempMinute(value.getMinutes().toString().padStart(2, "0"))
    }
  }, [value])

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"))
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0"),
  )

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const newDate = new Date(date)
      newDate.setHours(Number.parseInt(tempHour, 10))
      newDate.setMinutes(Number.parseInt(tempMinute, 10))
      setSelectedDate(newDate)
      onChange?.(newDate)
    }
  }

  const handleTimeChange = (hour: string, minute: string) => {
    setTempHour(hour)
    setTempMinute(minute)

    if (selectedDate) {
      const newDate = new Date(selectedDate)
      newDate.setHours(Number.parseInt(hour, 10))
      newDate.setMinutes(Number.parseInt(minute, 10))
      setSelectedDate(newDate)
      onChange?.(newDate)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground",
            className,
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? (
            format(selectedDate, "PPP 'at' HH:mm")
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
          />
          <div className="flex border-l">
            <ScrollArea className="h-[300px]">
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
                    onClick={() => handleTimeChange(hour, tempMinute)}
                  >
                    {hour}
                  </Button>
                ))}
              </div>
            </ScrollArea>
            <div className="h-[300px] w-px bg-border" />
            <ScrollArea className="h-[300px]">
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
                    onClick={() => handleTimeChange(tempHour, minute)}
                  >
                    {minute}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
