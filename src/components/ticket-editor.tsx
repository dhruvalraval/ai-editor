'use client'

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { $generateHtmlFromNodes } from '@lexical/html'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { ListItemNode, ListNode } from '@lexical/list'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { DropdownMenuCheckboxItemProps } from '@radix-ui/react-dropdown-menu'
import { LexicalEditor } from 'lexical'
import {
  Book,
  Brush,
  Bug,
  CircleCheck,
  CircleXIcon,
  ClockArrowUp,
  CodeXml,
  FireExtinguisher,
  Megaphone,
  Package,
  Plus,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import AssigneeIcon from '../../public/svgs/assignee-icon.svg'
import DueDateIcon from '../../public/svgs/duedate-icon.svg'
import FlagsIcon from '../../public/svgs/flag-icon.svg'
import ProjectIcon from '../../public/svgs/project-icon.svg'
import TagsIcon from '../../public/svgs/tags-icon.svg'
import TodoIcon from '../../public/svgs/todo-icon.svg'
import CreateIcon from '../../public/svgs/uil_enter.svg'
import { $isEmpty } from '../utils/checkEmpty'
import { validateUrl } from '../utils/urls'
import { MultiSelectMenu } from './multiselect-menu'
import FloatingLinkEditorPlugin from './plugins/FloatingLinkModal'
import InitializeContentPlugin from './plugins/InitializeContentPlugin'
import { ToolbarPlugin } from './plugins/ToolbarPlugin'
import { SingleSelectMenu } from './singleselect-menu'
import { Badge } from './ui/badge'
import { Calendar } from './ui/calendar'

type Checked = DropdownMenuCheckboxItemProps['checked']
// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error: Error) {
  throw error
}
const lexicalEditorTheme = {
  ltr: 'ltr',
  rtl: 'rtl',
  placeholder: 'editor-placeholder',
  paragraph: 'editor-paragraph',
  quote: 'editor-quote',
  heading: {
    h1: 'editor-heading-h1',
    h2: 'editor-heading-h2',
    h3: 'editor-heading-h3',
    h4: 'editor-heading-h4',
    h5: 'editor-heading-h5',
  },
  list: {
    nested: {
      listitem: 'editor-nested-listitem',
    },
    ol: 'editor-list-ol',
    ul: 'editor-list-ul',
    listitem: 'editor-listitem',
  },
  image: 'editor-image',
  link: 'editor-link',
  text: {
    bold: 'editor-text-bold',
    italic: 'editor-text-italic',
    overflowed: 'editor-text-overflowed',
    hashtag: 'editor-text-hashtag',
    underline: 'editor-text-underline',
    strikethrough: 'editor-text-strikethrough',
    underlineStrikethrough: 'editor-text-underlineStrikethrough',
    code: 'editor-text-code',
  },
  code: 'editor-code',
  codeHighlight: {
    atrule: 'editor-tokenAttr',
    attr: 'editor-tokenAttr',
    boolean: 'editor-tokenProperty',
    builtin: 'editor-tokenSelector',
    cdata: 'editor-tokenComment',
    char: 'editor-tokenSelector',
    class: 'editor-tokenFunction',
    'class-name': 'editor-tokenFunction',
    comment: 'editor-tokenComment',
    constant: 'editor-tokenProperty',
    deleted: 'editor-tokenProperty',
    doctype: 'editor-tokenComment',
    entity: 'editor-tokenOperator',
    function: 'editor-tokenFunction',
    important: 'editor-tokenVariable',
    inserted: 'editor-tokenSelector',
    keyword: 'editor-tokenAttr',
    namespace: 'editor-tokenVariable',
    number: 'editor-tokenProperty',
    operator: 'editor-tokenOperator',
    prolog: 'editor-tokenComment',
    property: 'editor-tokenProperty',
    punctuation: 'editor-tokenPunctuation',
    regex: 'editor-tokenVariable',
    selector: 'editor-tokenSelector',
    string: 'editor-tokenSelector',
    symbol: 'editor-tokenProperty',
    tag: 'editor-tokenProperty',
    url: 'editor-tokenOperator',
    variable: 'editor-tokenVariable',
  },
}

type EditorProps = {
  isEditable?: boolean
  editableContent?: string
  onSubmit: (content: string) => void
  suggestedTags: string[]
  isLoading: boolean
  reset: boolean
}

interface Option {
  label: string
  value: string
  disabled?: boolean
  icon?: React.ReactNode
}

function Component({
  isEditable = false,
  editableContent,
  onSubmit,
  suggestedTags,
  isLoading,
  reset,
}: EditorProps) {
  const initialConfig = {
    namespace: 'MyEditor',
    theme: lexicalEditorTheme,
    onError,
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      AutoLinkNode,
      LinkNode,
    ],
  }

  const tagOptions = useMemo(
    () => [
      {
        label: 'Performance',
        value: 'performance',
        color: '#7886c7',
        icon: (
          <CircleCheck
            className='w-4 h-4 mr-2'
            stroke='#608bc1'
            fill='#c6e7ff'
          />
        ),
      },
      {
        label: 'Productivity',
        value: 'productivity',
        color: '#b3d8a8',
        icon: (
          <ClockArrowUp
            className='w-4 h-4 mr-2'
            fill='#c6ffb4'
            stroke='#6a9c89'
          />
        ),
      },
      {
        label: 'Design',
        value: 'design',
        color: '#d17d98',
        icon: (
          <Brush
            className='w-4 h-4 mr-2'
            fill='#ffd7c4'
            stroke='#d17d98'
          />
        ),
      },
      {
        label: 'Development',
        value: 'development',
        color: '#344cb7',
        icon: (
          <CodeXml
            className='w-4 h-4 mr-2'
            fill='#c4d7ff'
            stroke='#344cb7'
          />
        ),
      },
      {
        label: 'Marketing',
        value: 'marketing',
        color: '#f2ae66',
        icon: (
          <Megaphone
            className='w-4 h-4 mr-2'
            fill='#ffdbb5'
            stroke='#ff7209'
          />
        ),
      },
      {
        label: 'Bugs',
        value: 'bugs',
        color: '#d2665a',
        icon: (
          <Bug
            className='w-4 h-4 mr-2'
            fill='#ffe9d0'
            stroke='#d2665a'
          />
        ),
      },
      {
        label: 'Feature',
        value: 'feature',
        color: '#79d7be',
        icon: (
          <Plus
            className='w-4 h-4 mr-2'
            fill='#79d7be'
            stroke='#79d7be'
          />
        ),
      },
      {
        label: 'Urgent',
        value: 'urgent',
        color: '#fada7a',
        icon: (
          <ShieldAlert
            className='w-4 h-4 mr-2'
            fill='#feff9f'
            stroke='#fccd2a'
          />
        ),
      },
      {
        label: 'Hotfix',
        value: 'hotfix',
        color: '#ffcce1',
        icon: (
          <FireExtinguisher
            className='w-4 h-4 mr-2'
            fill='#ffdff5'
            stroke='#da7297'
          />
        ),
      },
      {
        label: 'Documentation',
        value: 'documentation',
        color: '#e8ecd7',
        icon: (
          <Book
            className='w-4 h-4 mr-2'
            fill='#e7f0dc'
            stroke='#698474'
          />
        ),
      },
      {
        label: 'Release',
        value: 'release',
        color: '#cacff1',
        icon: (
          <Package
            className='w-4 h-4 mr-2'
            fill='#e3e7ff'
            stroke='#460d9c'
          />
        ),
      },
    ],
    []
  )

  const todoOptions = useMemo(
    () => [
      {
        label: 'Todo',
        value: 'todo',
      },
      {
        label: 'Checklist',
        value: 'checklist',
      },
    ],
    []
  )

  const assigneeOptions = useMemo(
    () => [
      {
        label: 'John Doe',
        value: 'john-doe',
      },
      {
        label: 'Jane Doe',
        value: 'jane-doe',
      },
      {
        label: 'John Smith',
        value: 'john-smith',
      },
      {
        label: 'Jane Smith',
        value: 'jane-smith',
      },
    ],
    []
  )

  const priorityOptions = useMemo(
    () => [
      {
        label: 'Low',
        value: 'low',
      },
      {
        label: 'Medium',
        value: 'medium',
      },
      {
        label: 'High',
        value: 'high',
      },
      {
        label: 'Critical',
        value: 'critical',
      },
    ],
    []
  )

  const projectOptions = useMemo(
    () => [
      {
        label: 'Project 1',
        value: 'project-1',
      },
      {
        label: 'Project 2',
        value: 'project-2',
      },
      {
        label: 'Project 3',
        value: 'project-3',
      },
    ],
    []
  )

  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null)
  const [isLinkEditMode, setIsLinkEditMode] = useState(false)
  const editorRef = useRef<LexicalEditor | null>(null)
  const [prevHtmlContent, setPrevHtmlContent] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<{ [key: string]: Checked }>(
    {}
  )
  const [selectedTodo, setSelectedTodo] = useState<Option | null>(null)
  const [selectedAssignee, setSelectedAssignee] = useState<Option | null>(null)
  const [selectedPriority, setSelectedPriority] = useState<Option | null>(null)
  const [selectedProject, setSelectedProject] = useState<Option | null>(null)
  const [openCalender, setOpenCalender] = useState<boolean>(false)

  useEffect(() => {
    if (reset) {
      setSelectedTags({})
      setSelectedTodo(null)
      setSelectedAssignee(null)
      setSelectedPriority(null)
      setSelectedProject(null)
      editorRef.current?.update(() => {
        const root = editorRef.current?.getRootElement()
        if (root) {
          root.innerHTML = ''
        }
      })
    }
  }, [reset])

  useEffect(() => {
    if (suggestedTags.length > 0) {
      setSelectedTags(
        suggestedTags.reduce(
          (acc, tag) => ({
            ...acc,
            [tag]: true,
          }),
          {}
        )
      )
    }
  }, [suggestedTags])

  const exportToHtml = useCallback(
    /* eslint-disable-next-line */
    (editorState: any, editor: any) => {
      editorState.read(() => {
        const htmlContent = $generateHtmlFromNodes(editor)
        if (htmlContent !== prevHtmlContent) {
          const isEmpty = $isEmpty(editorState)
          if (isEmpty) {
            setPrevHtmlContent(null) // Update previous HTML content
            onSubmit('')
          } else {
            setPrevHtmlContent(htmlContent) // Update previous HTML content
            onSubmit(htmlContent)
          }
        }
      })
    },
    [onSubmit, prevHtmlContent]
  )

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        gap: 1,
        width: '100%',
        margin: 0,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          backgroundColor: '#fff',
          marginBottom: 1,
          borderRadius: 1,
        }}
      >
        <LexicalComposer initialConfig={initialConfig}>
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <RichTextPlugin
              contentEditable={
                <div
                  ref={onRef}
                  className='p-4'
                >
                  <ContentEditable
                    readOnly={false}
                    aria-placeholder='Describe this task'
                    placeholder={
                      <div className='editor-placeholder'>
                        Describe this task
                      </div>
                    }
                    style={editableContentStyle}
                  />
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <AutoFocusPlugin />
            <LinkPlugin validateUrl={validateUrl} />
            <InitializeContentPlugin
              isContentAvailable={isEditable}
              htmlContent={editableContent!}
            />
            {floatingAnchorElem && (
              <FloatingLinkEditorPlugin
                anchorElem={floatingAnchorElem}
                isLinkEditMode={isLinkEditMode}
                setIsLinkEditMode={setIsLinkEditMode}
              />
            )}
            <ListPlugin />
            <CheckListPlugin />
            <OnChangePlugin
              onChange={(state, editor) => {
                exportToHtml(state, editor)
                editorRef.current = editor
              }}
            />
          </div>
          <div className='flex flex-wrap gap-2 mt-2 px-4'>
            {isLoading && (
              <Sparkles className='w-4 h-4 animate-ping text-[#94989E] mr-2' />
            )}
            <AnimatePresence>
              {selectedTags && (
                <>
                  {Object.entries(selectedTags).map(([key, value]) => {
                    const tag = tagOptions.find(
                      (option) => option.value === key
                    )
                    return (
                      value && (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                          layout
                        >
                          <Badge
                            key={key}
                            variant='outline'
                            className='flex items-center gap-1 border-dashed p-2 rounded-[8px]'
                          >
                            {tag?.icon}
                            {tag?.label}
                          </Badge>
                        </motion.div>
                      )
                    )
                  })}
                </>
              )}
            </AnimatePresence>
          </div>
          <div className='flex flex-wrap gap-2 mt-1 px-4'>
            <AnimatePresence>
              {selectedTodo && (
                <motion.div
                  key={selectedTodo.value}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  layout
                  className='relative'
                >
                  <CircleXIcon
                    fill='rgba(255, 255, 255, 0.8)'
                    stroke='#94989e'
                    className='absolute w-4 h-4 -right-2 -top-[5px] cursor-pointer'
                    onClick={() => setSelectedTodo(null)}
                  />
                  <Badge
                    variant='outline'
                    className='flex items-center gap-2 bg-cyan-50 px-1.5 py-1.5'
                  >
                    {
                      todoOptions.find(
                        (option) => option.value === selectedTodo.value
                      )?.label
                    }
                  </Badge>
                </motion.div>
              )}
              {selectedAssignee && (
                <motion.div
                  key={selectedAssignee.value}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  layout
                  className='relative'
                >
                  <CircleXIcon
                    fill='rgba(255, 255, 255, 0.8)'
                    stroke='#94989e'
                    className='absolute w-4 h-4 -right-2 -top-[5px] cursor-pointer'
                    onClick={() => setSelectedAssignee(null)}
                  />
                  <Badge
                    variant='outline'
                    className='flex items-center gap-2 bg-amber-50  px-1.5 py-1.5'
                  >
                    {
                      assigneeOptions.find(
                        (option) => option.value === selectedAssignee.value
                      )?.label
                    }
                  </Badge>
                </motion.div>
              )}
              {selectedPriority && (
                <motion.div
                  key={selectedPriority.value}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  layout
                  className='relative'
                >
                  <CircleXIcon
                    fill='rgba(255, 255, 255, 0.8)'
                    stroke='#94989e'
                    className='absolute w-4 h-4 -right-2 -top-[5px] cursor-pointer'
                    onClick={() => setSelectedPriority(null)}
                  />
                  <Badge
                    variant='outline'
                    className='flex items-center gap-2  px-1.5 py-1.5'
                    style={{
                      backgroundColor:
                        selectedPriority.value === 'critical'
                          ? '#ffaeae'
                          : selectedPriority.value === 'high'
                          ? '#ffe2ae'
                          : selectedPriority.value === 'medium'
                          ? '#fff6ae'
                          : selectedPriority.value === 'low'
                          ? '#b8ffae'
                          : '#fefefe',
                    }}
                  >
                    {
                      priorityOptions.find(
                        (option) => option.value === selectedPriority.value
                      )?.label
                    }
                  </Badge>
                </motion.div>
              )}
              {selectedProject && (
                <motion.div
                  key={selectedProject.value}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  layout
                  className='relative'
                >
                  <CircleXIcon
                    fill='rgba(255, 255, 255, 0.8)'
                    stroke='#94989e'
                    className='absolute w-4 h-4 -right-2 -top-[5px] cursor-pointer'
                    onClick={() => setSelectedProject(null)}
                  />
                  <Badge
                    variant='outline'
                    className='flex items-center gap-2 bg-blue-50  px-1.5 py-1.5'
                  >
                    {
                      projectOptions.find(
                        (option) => option.value === selectedProject.value
                      )?.label
                    }
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Action Buttons */}
          <div className='flex flex-wrap gap-2 mt-4 px-4'>
            <SingleSelectMenu
              title={
                <div className='flex items-center gap-2 text-[#94989E]'>
                  <TodoIcon className='h-4 w-4' />
                  Todo
                </div>
              }
              options={todoOptions}
              setSelectedOption={setSelectedTodo}
            />
            <SingleSelectMenu
              title={
                <div className='flex items-center gap-2 text-[#94989E]'>
                  <AssigneeIcon className='h-4 w-4' />
                  Assignee
                </div>
              }
              options={assigneeOptions}
              setSelectedOption={setSelectedAssignee}
            />
            <SingleSelectMenu
              title={
                <div className='flex items-center gap-2 text-[#94989E]'>
                  <FlagsIcon className='h-4 w-4' />
                  Priority
                </div>
              }
              options={priorityOptions}
              setSelectedOption={setSelectedPriority}
            />
            <MultiSelectMenu
              selectedOptions={selectedTags}
              setSelectedOptions={setSelectedTags}
              title={
                <div className='flex items-center gap-2 text-[#94989E]'>
                  <TagsIcon className='h-4 w-4' />
                  Tags
                </div>
              }
              options={tagOptions}
            />
            <SingleSelectMenu
              title={
                <div className='flex items-center gap-2 text-[#94989E]'>
                  <ProjectIcon className='h-4 w-4' />
                  Project
                </div>
              }
              options={projectOptions}
              setSelectedOption={setSelectedProject}
            />
            <span className='relative'>
              <Button
                variant='outline'
                size='sm'
                className='h-8 rounded-[8px]'
                onClick={() => setOpenCalender(!openCalender)}
              >
                <div className='flex items-center gap-2 text-[#94989E]'>
                  <DueDateIcon className='h-4 w-4' />
                  Due Date
                </div>
              </Button>
              <AnimatePresence>
                {openCalender && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: 10, x: '-50%' }}
                    transition={{ duration: 0.3 }}
                    layout
                    className='absolute top-10 left-[50%] translate-x-[-50%] bg-white rounded-lg'
                  >
                    <Calendar mode='single' />
                  </motion.div>
                )}
              </AnimatePresence>
            </span>
          </div>
          <div className='flex items-center justify-start w-full h-[65px] gap-4 mt-4 border-t px-4'>
            <ToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />
            {/* Create Button */}
            <div className='flex justify-end'>
              <Button
                className='bg-indigo-600 hover:bg-indigo-700 py-0 px-0 w-[110px] h-[33px] flex items-center justify-start'
                style={{
                  boxShadow: '0px 3px 0px 0px #3F2ABD',
                }}
              >
                <div className='border-r border-[#FFFFFF33] h-[100%] flex items-center justify-center flex-[0.9] font-[14px]'>
                  Create
                </div>
                <CreateIcon className='h-4 w-4 pt-[1px]' />
              </Button>
            </div>
          </div>
        </LexicalComposer>
      </div>
    </div>
  )
}

const EditorCarrier = memo(Component)
export default EditorCarrier

const editableContentStyle = {
  minHeight: '20px',
  border: 'none',
  outline: 'none',
}
