'use client'

import { useEffect, useState } from 'react'
import { ChevronRight, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { TAGS } from '@/constants/tags'
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
        <Button variant='default'>Create Ticket</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-2xl p-0'>
        <div className='p-4 space-y-4'>
          {/* Breadcrumb */}
          <DialogTitle>
          <div className='flex items-center text-sm text-muted-foreground'>
                <div className='flex items-center'>
                  <Zap className='h-4 w-4 text-green-500' />
                  <span className='ml-2'>Frontend</span>
                </div>
                <ChevronRight className='h-4 w-4 mx-2' />
                <span>New Task</span>
              </div>
          </DialogTitle>
          <DialogDescription className='sr-only hidden'>
          </DialogDescription>

            {/* Title Input */}
            <SuggestedTitle
              title={title}
              setTitle={setTitle}
              setSuggestedTags={setSuggestedTags}
              setIsLoading={setIsLoading}
            />

            {/* Editor */}
            {/* eslint-disable-next-line @typescript-eslint/no-empty-function */}
            <EditorCarrier onSubmit={() => {}} suggestedTags={suggestedTags} isLoading={isLoading} reset={open} />

        </div>
      </DialogContent>
    </Dialog>
  )
}
