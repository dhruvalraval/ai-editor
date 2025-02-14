import { Dispatch } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

	interface Option {
			label: string
			value: string
			disabled?: boolean
			icon?: React.ReactNode
		}

export function SingleSelectMenu({title, options, setSelectedOption}: {title: string, options: Option[], setSelectedOption: Dispatch<React.SetStateAction<Option | null>>}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
      <Button variant="outline" size="sm" className="h-8">{title}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          {options.map((option) => (
            <DropdownMenuItem key={option.value} className="flex items-center gap-2" onClick={() => setSelectedOption(option)}>
							{option.icon}
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
