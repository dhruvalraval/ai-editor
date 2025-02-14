import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { X, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

const tags = [
  { value: "performance", label: "Performance" },
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Feature" },
  { value: "bug-fixes", label: "Bug Fixes" },
  { value: "urgent", label: "Urgent" },
  { value: "hotfix", label: "Hotfix" },
]

export function MultiSelectTags() {
  const [open, setOpen] = React.useState(false)
  const [selectedTags, setSelectedTags] = React.useState<typeof tags>([])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-8 justify-between"
        >
          {selectedTags.length > 0 ? (
            <div className="flex gap-1 items-center truncate">
              {selectedTags.length > 2 ? (
                <>
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {selectedTags.length} selected
                  </Badge>
                </>
              ) : (
                selectedTags.map((tag) => (
                  <Badge
                    key={tag.value}
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {tag.label}
                  </Badge>
                ))
              )}
            </div>
          ) : (
            "Tags"
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search tags..." />
          <CommandEmpty>No tags found.</CommandEmpty>
          <CommandGroup>
            {tags.map((tag) => (
              <CommandItem
                key={tag.value}
                onSelect={() => {
                  setSelectedTags((prev) => {
                    const isSelected = prev.some((t) => t.value === tag.value)
                    if (isSelected) {
                      return prev.filter((t) => t.value !== tag.value)
                    }
                    return [...prev, tag]
                  })
                }}
              >
                <div
                  className={cn(
                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                    selectedTags.some((t) => t.value === tag.value)
                      ? "bg-primary text-primary-foreground"
                      : "opacity-50 [&_svg]:invisible"
                  )}
                >
                  <X className="h-3 w-3" />
                </div>
                {tag.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 