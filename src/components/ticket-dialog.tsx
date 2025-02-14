'use client'

import { useState } from 'react';
import { ChevronRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import EditorCarrier from './ticket-editor';

export function TicketDialog() {
  const [title, setTitle] = useState('');
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Create Ticket</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-0">
        <div className="p-4 space-y-4">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-muted-foreground">
            <div className="flex items-center">
              <Zap className="h-4 w-4 text-green-500" />
              <span className="ml-2">Frontend</span>
            </div>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span>New Task</span>
          </div>

          {/* Title Input */}
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="border-none outline-none p-0 text-lg font-medium box-shadow-none"
          />

          {/* Editor */}
          {/* eslint-disable-next-line @typescript-eslint/no-empty-function */}
          <EditorCarrier onSubmit={() => {}} />


        </div>
      </DialogContent>
    </Dialog>
  );
} 