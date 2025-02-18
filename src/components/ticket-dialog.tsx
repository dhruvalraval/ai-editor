'use client'

import { useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { TAGS } from '@/constants/tags'
import FlashIcon from '../../public/svgs/flash-icon.svg'
import SuggestedTitle from './suggestedTitle'
import EditorCarrier from './ticket-editor'

type Tag = (typeof TAGS)[number]

export function TicketDialog() {
  const [title, setTitle] = useState('')
  const [suggestedTags, setSuggestedTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) {
      setTitle('')
      setSuggestedTags([])
      setIsLoading(false)
    }
  }, [open])

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <Button variant='default'>
          <div className='flex items-center space-x-2'>Create Ticket</div>
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-2xl p-0'>
        <div className='space-y-4'>
          {/* Breadcrumb */}
          <DialogTitle className='px-4 py-2'>
            <div className='flex items-center text-sm text-muted-foreground'>
              <div className='flex items-center bg-[#F5F5F580] rounded-sm p-2'>
                <FlashIcon className='h-4 w-4' />
                <span className='ml-2'>Frontend</span>
              </div>
              <ChevronRight className='h-4 w-4 mx-2' />
              <span>New Task</span>
            </div>
          </DialogTitle>
          <DialogDescription className='sr-only hidden'></DialogDescription>

          {/* Title Input */}
          <div className='px-4 m-0'>
            <SuggestedTitle
              title={title}
              setTitle={setTitle}
              setSuggestedTags={setSuggestedTags}
              setIsLoading={setIsLoading}
            />
          </div>

          {/* Editor */}
          {}
          <EditorCarrier
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            onSubmit={() => {}}
            suggestedTags={suggestedTags}
            isLoading={isLoading}
            reset={open}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
