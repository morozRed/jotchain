"use client"

import { Check, ChevronsUpDown, MapPin } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import {
  formatTimezoneLabel,
  getGroupedTimezones,
  getTimezoneRegions,
  getUserTimezone,
} from "@/utils/timezone"

interface TimezoneComboboxProps {
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  className?: string
  placeholder?: string
}

export function TimezoneCombobox({
  value,
  onChange,
  disabled,
  className,
  placeholder = "Select timezone...",
}: TimezoneComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const userTimezone = getUserTimezone()
  const groupedTimezones = getGroupedTimezones()
  const regions = getTimezoneRegions()

  const handleSelect = (timezone: string) => {
    onChange?.(timezone)
    setOpen(false)
  }

  // Get display label for selected timezone
  const selectedLabel = value ? formatTimezoneLabel(value) : placeholder
  const isUserTimezone = value === userTimezone

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            className,
          )}
          disabled={disabled}
        >
          <span className="flex items-center gap-2 truncate">
            {isUserTimezone && <MapPin className="h-3.5 w-3.5 text-primary" />}
            <span className="truncate">{selectedLabel}</span>
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search timezone..." />
          <CommandEmpty>No timezone found.</CommandEmpty>
          <CommandList className="max-h-[300px]">
            {regions.map((region) => {
              const timezones = groupedTimezones[region]
              if (!timezones || timezones.length === 0) return null

              return (
                <CommandGroup key={region} heading={region}>
                  {timezones.map((tz) => {
                    const isSelected = value === tz.value
                    const isUser = tz.value === userTimezone

                    return (
                      <CommandItem
                        key={tz.value}
                        value={tz.value}
                        onSelect={() => handleSelect(tz.value)}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          {isUser && (
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                          )}
                          <span className="truncate">{tz.label}</span>
                        </div>
                        <Check
                          className={cn(
                            "ml-2 h-4 w-4 shrink-0",
                            isSelected ? "opacity-100" : "opacity-0",
                          )}
                        />
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export { TimezoneCombobox as ComboboxTimezone }
