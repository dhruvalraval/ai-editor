import {Dispatch, useCallback, useEffect, useState} from 'react'
import {$isLinkNode, TOGGLE_LINK_COMMAND} from '@lexical/link'
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  REMOVE_LIST_COMMAND,
} from '@lexical/list'
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext'
import {$createHeadingNode, $createQuoteNode, $isHeadingNode} from '@lexical/rich-text'
import {$setBlocksType} from '@lexical/selection'
import {$getNearestNodeOfType, mergeRegister} from '@lexical/utils'
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_NORMAL,
  EditorState,
  FORMAT_TEXT_COMMAND,
  KEY_MODIFIER_COMMAND,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND,
} from 'lexical'
import {
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Underline,
} from 'lucide-react'
import getSelectedNode from '../../utils/getSelectedNode'
import {sanitizeUrl} from '../../utils/urls'

const LowPriority = 1

export function ToolbarPlugin({setIsLinkEditMode}: {setIsLinkEditMode: Dispatch<boolean>}) {
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
        anchorNode.getKey() === 'root' ? anchorNode : anchorNode.getTopLevelElementOrThrow()
      const elementKey = element.getKey()
      const elementDOM = editor.getElementByKey(elementKey)
      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode)
          const type = parentList ? parentList.getTag() : element.getTag()
          setBlockType(type)
        } else {
          const type = $isHeadingNode(element) ? element.getTag() : element.getType()
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
      editor.registerUpdateListener(({editorState}) => {
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
        LowPriority,
      ),
    )
  }, [editor, $updateToolbar])

  useEffect(() => {
    return editor.registerUpdateListener(({editorState}: {editorState: EditorState}) => {
      editorState.read(() => {
        $updateToolbar()
      })
    })
  }, [editor, $updateToolbar])

  useEffect(() => {
    return activeEditor.registerCommand(
      KEY_MODIFIER_COMMAND,
      payload => {
        const event: KeyboardEvent = payload
        const {code, ctrlKey, metaKey} = event

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
      COMMAND_PRIORITY_NORMAL,
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
      <div className='flex items-center justify-start w-full gap-4'>
          <span>
            <button
              onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
              color={isBold ? 'primary' : 'default'}>
              <Bold strokeWidth={1} width={18} height={18} />
            </button>
          </span>
          <span>
            <button
              onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
              color={isItalic ? 'primary' : 'default'}>
              <Italic strokeWidth={1} width={18} height={18} />
            </button>
          </span>
          <span>
            <button
              onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
              color={isUnderline ? 'primary' : 'default'}>
              <Underline strokeWidth={1} width={18} height={18} />
            </button>
          </span>
          <span>
            <button
              onClick={insertLink}
              color={isLink ? 'primary' : 'default'}>
              <Link2 strokeWidth={1} width={18} height={18} />
            </button>
          </span>
          <span>
            <button
              onClick={formatBulletList.bind(null, {blockType, editor})}>
              <List strokeWidth={1} width={18} height={18} />
            </button>
          </span>
          <span>
            <button
              onClick={formatNumberedList.bind(null, {blockType, editor})}>
              <ListOrdered strokeWidth={1} width={18} height={18} />
            </button>
          </span>
          <span>
            <button
              onClick={formatQuote.bind(null, {blockType, editor})}>
              <Quote strokeWidth={1} width={18} height={18} />
            </button>
          </span>
      </div>
  )
}

interface ToolbarPluginProps {
  blockType: string
  editor: LexicalEditor
}

const formatParagraph = ({blockType, editor}: ToolbarPluginProps) => {
  if (blockType !== 'paragraph') {
    editor.update(() => {
      const selection = $getSelection()

      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode())
      }
    })
  }
}

const formatLargeHeading = ({blockType, editor}: ToolbarPluginProps) => {
  if (blockType !== 'h1') {
    editor.update(() => {
      const selection = $getSelection()

      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode('h1'))
      }
    })
  }
}

const formatSmallHeading = ({blockType, editor}: ToolbarPluginProps) => {
  if (blockType !== 'h2') {
    editor.update(() => {
      const selection = $getSelection()

      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode('h2'))
      }
    })
  }
}

const formatBulletList = ({blockType, editor}: ToolbarPluginProps) => {
  if (blockType !== 'ul') {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
  } else {
    editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
  }
}

const formatNumberedList = ({blockType, editor}: ToolbarPluginProps) => {
  if (blockType !== 'ol') {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
  } else {
    editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
  }
}

const formatQuote = ({blockType, editor}: ToolbarPluginProps) => {
  if (blockType !== 'quote') {
    editor.update(() => {
      const selection = $getSelection()

      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode())
      }
    })
  } else {
    formatParagraph({blockType, editor})
  }
}
