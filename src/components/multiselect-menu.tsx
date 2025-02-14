"use client"

import * as React from "react"
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Checked = DropdownMenuCheckboxItemProps["checked"]

interface Option {
  label: string
  value: string
  disabled?: boolean
  icon?: React.ReactNode
}

interface DropdownMenuCheckboxesProps {
  title: string
  options: Option[]
  selectedOptions: { [key: string]: Checked }
  setSelectedOptions: React.Dispatch<React.SetStateAction<{ [key: string]: Checked }>>
}

export function MultiSelectMenu({ title, options, selectedOptions, setSelectedOptions }: DropdownMenuCheckboxesProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
      <Button variant="outline" size="sm" className="h-8">{title}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={selectedOptions[option.value]}
            onCheckedChange={(checked) => 
              setSelectedOptions(prev => ({ ...prev, [option.value]: checked }))
            }
            disabled={option.disabled}
            className="flex items-center gap-2"
            style={{
              //if checked, add a background color
              cursor: 'pointer',
              backgroundColor: selectedOptions[option.value] ? 'var(--accent-foreground)' : 'transparent',
            }}
          >
            {option.icon}
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
