'use client'

import { Dispatch, SetStateAction, useCallback } from 'react'
import debounce from 'lodash.debounce'
import { TAGS } from '@/constants/tags'
import { openaiapi } from '@/hooks/useOpenAI'
import { Input } from './ui/input'

type Tag = (typeof TAGS)[number]

function SuggestedTitle({
  title,
  setTitle,
  setSuggestedTags,
  setIsLoading,
}: {
  title: string
  setTitle: Dispatch<SetStateAction<string>>
  setSuggestedTags: Dispatch<SetStateAction<Tag[]>>
  setIsLoading: Dispatch<SetStateAction<boolean>>
}) {

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetchTags = useCallback(
    debounce(async (title: string) => {
      if (!title) {
        setSuggestedTags([])
        return
      }

      try {
        setIsLoading(true)
        const response = await openaiapi.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: [
                {
                  type: 'text',
                  text: `You are a helpful assistant that suggests tags for a ticket title based on the title provided. Tags should be from this list: ${
                TAGS.join(', ')
                }. Return only the tag names separated by commas.`,
                },
              ],
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Suggest tags for a ticket titled: "${title}".`,
                },
              ],
            },
          ],
          response_format: {
            type: 'text',
          },
        })

        // Extract and parse suggested tags from the API response
        const suggestedText = response.choices[0].message.content
        const parsedTags = suggestedText
          ?.split(',')
          .map(tag => tag.trim())
          .filter(tag => TAGS.includes(tag as Tag)) as Tag[]
        
        setSuggestedTags(parsedTags)
      } catch (error) {
        /*eslint-disable-next-line no-console*/
        console.error('Error fetching tags:', error)
        setSuggestedTags([])
      } finally {
        setIsLoading(false)
      }
    }, 500),
    []
  )

  return (
    <>
      <Input
        value={title}
        onChange={(e) => {
          const newTitle = e.target.value
          setTitle(newTitle)
          debouncedFetchTags(newTitle)
        }}
        placeholder='Task title'
        className='border-none outline-none p-0 text-lg font-medium box-shadow-none'
      />
    </>
  )
}

export default SuggestedTitle
