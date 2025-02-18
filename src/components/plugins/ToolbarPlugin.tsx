import { Dispatch, useCallback, useEffect, useState } from 'react'
import { $createCodeNode } from '@lexical/code'
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import {
  $isListNode,
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  REMOVE_LIST_COMMAND,
} from '@lexical/list'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $createQuoteNode, $isHeadingNode } from '@lexical/rich-text'
import { $setBlocksType, $wrapNodes } from '@lexical/selection'
import { $getNearestNodeOfType, mergeRegister } from '@lexical/utils'
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_NORMAL,
  EditorState,
  FORMAT_TEXT_COMMAND,
  KEY_MODIFIER_COMMAND,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND,
} from 'lexical'
import { Quote, Underline } from 'lucide-react'
import AttachmentIcon from '../../../public/svgs/attachment-icon.svg'
import BoldIcon from '../../../public/svgs/bold-icon.svg'
import CheckboxListIcon from '../../../public/svgs/checklist-icon.svg'
import CodeIcon from '../../../public/svgs/code-icon.svg'
import EmojiIcon from '../../../public/svgs/emoji-icon.svg'
import ItalicIcon from '../../../public/svgs/italic-icon.svg'
import MentionIcon from '../../../public/svgs/mention-icon.svg'
import OrderListIcon from '../../../public/svgs/numbered-list-icon.svg'
import UnorderListIcon from '../../../public/svgs/ordered-list-icon.svg'
import UrlIcon from '../../../public/svgs/url-icon.svg'
import getSelectedNode from '../../utils/getSelectedNode'
import { sanitizeUrl } from '../../utils/urls'

const LowPriority = 1

export function ToolbarPlugin({
  setIsLinkEditMode,
}: {
  setIsLinkEditMode: Dispatch<boolean>
}) {
  const [editor] = useLexicalComposerContext()
  const [isLink, setIsLink] = useState(false)
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [blockType, setBlockType] = useState('paragraph')
  const [activeEditor, setActiveEditor] = useState(editor)

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode()
      const element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow()
      const elementKey = element.getKey()
      const elementDOM = editor.getElementByKey(elementKey)
      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode)
          const type = parentList ? parentList?.getListType() : element.getTag()
          setBlockType(type)
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType()
          setBlockType(type)
        }
      }

      // Update states based on selection
      setIsBold(selection.hasFormat('bold'))
      setIsItalic(selection.hasFormat('italic'))
      setIsUnderline(selection.hasFormat('underline'))

      // Check if the selection contains a link
      const node = getSelectedNode(selection)
      const parent = node.getParent()
      if ($isLinkNode(parent)) {
        setIsLink(true)
      } else {
        setIsLink(false)
      }
    }
  }, [editor])

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar()
        })
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, newEditor) => {
          setActiveEditor(newEditor)
          $updateToolbar()
          return false
        },
        LowPriority
      )
    )
  }, [editor, $updateToolbar])

  useEffect(() => {
    return editor.registerUpdateListener(
      ({ editorState }: { editorState: EditorState }) => {
        editorState.read(() => {
          $updateToolbar()
        })
      }
    )
  }, [editor, $updateToolbar])

  useEffect(() => {
    return activeEditor.registerCommand(
      KEY_MODIFIER_COMMAND,
      (payload) => {
        const event: KeyboardEvent = payload
        const { code, ctrlKey, metaKey } = event

        if (code === 'KeyK' && (ctrlKey || metaKey)) {
          event.preventDefault()
          let url: string | null
          if (!isLink) {
            setIsLinkEditMode(true)
            url = sanitizeUrl('https://')
          } else {
            setIsLinkEditMode(false)
            url = null
          }
          return activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, url)
        }
        return false
      },
      COMMAND_PRIORITY_NORMAL
    )
  }, [activeEditor, isLink, setIsLinkEditMode])

  const insertLink = useCallback(() => {
    if (!isLink) {
      setIsLinkEditMode(true)
      activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl('https://'))
    } else {
      setIsLinkEditMode(false)
      activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
    }
  }, [activeEditor, isLink, setIsLinkEditMode])

  return (
    <div className='flex items-center justify-start w-full gap-2 flex-wrap sm:gap-4'>
      <span>
        <button
          className='item'
          color={isBold ? 'primary' : 'default'}
          style={{
            padding: '2px',
            borderRadius: '4px',
            background: 'transparent',
          }}
        >
          <AttachmentIcon
            strokeWidth={1}
            width={18}
            height={18}
          />
        </button>
      </span>
      <span>
        <button
          className='item'
          color={isBold ? 'primary' : 'default'}
          style={{
            padding: '2px',
            borderRadius: '4px',
            background: 'transparent',
          }}
        >
          <MentionIcon
            strokeWidth={1}
            width={18}
            height={18}
          />
        </button>
      </span>
      <span>
        <button
          className='item'
          color={isBold ? 'primary' : 'default'}
          style={{
            padding: '2px',
            borderRadius: '4px',
            background: 'transparent',
          }}
        >
          <EmojiIcon
            strokeWidth={1}
            width={18}
            height={18}
          />
        </button>
      </span>
      <span>
        <button
          className='item'
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
          color={isBold ? 'primary' : 'default'}
          style={{
            padding: '2px',
            borderRadius: '4px',
            background: isBold ? '#f1f1f1' : 'transparent',
          }}
        >
          <BoldIcon
            strokeWidth={1}
            width={18}
            height={18}
          />
        </button>
      </span>
      <span>
        <button
          className='item'
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
          color={isItalic ? 'primary' : 'default'}
          style={{
            padding: '2px',
            borderRadius: '4px',
            background: isItalic ? '#f1f1f1' : 'transparent',
          }}
        >
          <ItalicIcon
            strokeWidth={1}
            width={18}
            height={18}
          />
        </button>
      </span>
      <span>
        <button
          className='item'
          onClick={() =>
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
          }
          color={isUnderline ? 'primary' : 'default'}
          style={{
            padding: '2px',
            borderRadius: '4px',
            background: isUnderline ? '#f1f1f1' : 'transparent',
          }}
        >
          <Underline
            strokeWidth={1}
            width={18}
            height={18}
          />
        </button>
      </span>
      <span>
        <button
          className='item'
          onClick={insertLink}
          color={isLink ? 'primary' : 'default'}
          style={{
            padding: '2px',
            borderRadius: '4px',
            background: isLink ? '#f1f1f1' : 'transparent',
          }}
        >
          <UrlIcon
            strokeWidth={1}
            width={18}
            height={18}
          />
        </button>
      </span>
      <span>
        <button
          className='item'
          onClick={formatNumberedList.bind(null, { blockType, editor })}
          style={{
            padding: '2px',
            borderRadius: '4px',
            background:
              blockType === 'ol' || blockType === 'number'
                ? '#f1f1f1'
                : 'transparent',
          }}
        >
          <OrderListIcon
            strokeWidth={1}
            width={18}
            height={18}
          />
        </button>
      </span>
      <span>
        <button
          className='item'
          onClick={formatBulletList.bind(null, { blockType, editor })}
          style={{
            padding: '2px',
            borderRadius: '4px',
            background:
              blockType === 'ul' || blockType === 'bullet'
                ? '#f1f1f1'
                : 'transparent',
          }}
        >
          <UnorderListIcon
            strokeWidth={1}
            width={18}
            height={18}
          />
        </button>
      </span>
      <span>
        <button
          className='item'
          onClick={formatCheckList.bind(null, { blockType, editor })}
          style={{
            padding: '2px',
            borderRadius: '4px',
            background: blockType === 'check' ? '#f1f1f1' : 'transparent',
          }}
        >
          <CheckboxListIcon
            strokeWidth={1}
            width={18}
            height={18}
          />
        </button>
      </span>
      <span>
        <button
          className='item'
          onClick={formatCode.bind(null, { blockType, editor })}
          style={{
            padding: '2px',
            borderRadius: '4px',
            background: blockType === 'code' ? '#f1f1f1' : 'transparent',
          }}
        >
          <CodeIcon
            strokeWidth={1}
            width={18}
            height={18}
          />
        </button>
      </span>
      <span>
        <button
          className='item'
          onClick={formatQuote.bind(null, { blockType, editor })}
          style={{
            padding: '2px',
            borderRadius: '4px',
            background: blockType === 'quote' ? '#f1f1f1' : 'transparent',
          }}
        >
          <Quote
            strokeWidth={1}
            width={16}
            height={16}
          />
        </button>
      </span>
    </div>
  )
}

interface ToolbarPluginProps {
  blockType: string
  editor: LexicalEditor
}

const formatParagraph = ({ blockType, editor }: ToolbarPluginProps) => {
  if (blockType !== 'paragraph') {
    editor.update(() => {
      const selection = $getSelection()

      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode())
      }
    })
  }
}

const formatBulletList = ({ blockType, editor }: ToolbarPluginProps) => {
  if (blockType !== 'ul' && blockType !== 'bullet') {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
  } else {
    editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
  }
}

const formatNumberedList = ({ blockType, editor }: ToolbarPluginProps) => {
  if (blockType !== 'ol' && blockType !== 'number') {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
  } else {
    editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
  }
}

const formatCheckList = ({ blockType, editor }: ToolbarPluginProps) => {
  if (blockType !== 'check') {
    editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)
  } else {
    editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
  }
}

const formatQuote = ({ blockType, editor }: ToolbarPluginProps) => {
  if (blockType !== 'quote') {
    editor.update(() => {
      const selection = $getSelection()

      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode())
      }
    })
  } else {
    formatParagraph({ blockType, editor })
  }
}

const formatCode = ({ blockType, editor }: ToolbarPluginProps) => {
  if (blockType !== 'code') {
    editor.update(() => {
      const selection = $getSelection()

      if ($isRangeSelection(selection)) {
        $wrapNodes(selection, () => $createCodeNode())
      }
    })
  } else {
    formatParagraph({ blockType, editor })
  }
}
