'use client'

import {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {CodeHighlightNode, CodeNode} from '@lexical/code'
import {$generateHtmlFromNodes} from '@lexical/html'
import {AutoLinkNode, LinkNode} from '@lexical/link'
import {ListItemNode, ListNode} from '@lexical/list'
import {AutoFocusPlugin} from '@lexical/react/LexicalAutoFocusPlugin'
import {LexicalComposer} from '@lexical/react/LexicalComposer'
import {ContentEditable} from '@lexical/react/LexicalContentEditable'
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary'
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin'
import {LinkPlugin} from '@lexical/react/LexicalLinkPlugin'
import {ListPlugin} from '@lexical/react/LexicalListPlugin'
import {OnChangePlugin} from '@lexical/react/LexicalOnChangePlugin'
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin'
import {HeadingNode, QuoteNode} from '@lexical/rich-text'
import { DropdownMenuCheckboxItemProps } from '@radix-ui/react-dropdown-menu'
import {LexicalEditor} from 'lexical'
import { Book, Brush, Bug, Calendar, CircleCheck, CircleDashed, CircleUserRound, ClockArrowUp, CodeXml, FireExtinguisher, Flag, Grid2x2, Megaphone, Package, Plus, ShieldAlert, Sparkles, Tag } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Button } from '@/components/ui/button';
import {$isEmpty} from '../utils/checkEmpty'
import {validateUrl} from '../utils/urls'
import { MultiSelectMenu } from './multiselect-menu'
import FloatingLinkEditorPlugin from './plugins/FloatingLinkModal'
import InitializeContentPlugin from './plugins/InitializeContentPlugin'
import { ToolbarPlugin } from './plugins/ToolbarPlugin'
import { SingleSelectMenu } from './singleselect-menu'
import { Badge } from './ui/badge'

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

function Component({isEditable = false, editableContent, onSubmit, suggestedTags, isLoading, reset}: EditorProps) {
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

  const tagOptions = useMemo(() => (
    [{
      label: 'Performance',
      value: 'performance',
      icon: <CircleCheck className="w-4 h-4 mr-2" />
    },  {
      label: 'Productivity',
      value: 'productivity',
      icon: <ClockArrowUp className="w-4 h-4 mr-2" />
    },  {
      label: 'Design',
      value: 'design',
      icon: <Brush className="w-4 h-4 mr-2" />
    }, {
      label: 'Development',
      value: 'development',
      icon: <CodeXml className="w-4 h-4 mr-2" />
    },{
      label: 'Marketing',
      value: 'marketing',
      icon: <Megaphone className="w-4 h-4 mr-2" />
    },  {
      label: 'Bugs',
      value: 'bugs',
      icon: <Bug className="w-4 h-4 mr-2" />
    }, {
      label: 'Feature',
      value: 'feature',
      icon: <Plus className="w-4 h-4 mr-2" />
    }, {
      label: 'Urgent',
      value: 'urgent',
      icon: <ShieldAlert className="w-4 h-4 mr-2" />
    },  {
      label: 'Hotfix',
      value: 'hotfix',
      icon: <FireExtinguisher className="w-4 h-4 mr-2" />
    }, {
      label: 'Documentation',
      value: 'documentation',
      icon: <Book className="w-4 h-4 mr-2" />
    },{
      label: 'Release',
      value: 'release',
      icon: <Package className="w-4 h-4 mr-2" />
    }, ]
  ), [])

  const todoOptions = useMemo(() => (
    [{
      label: 'Todo',
      value: 'todo',
    }, {
      label: 'Checklist',
      value: 'checklist',
    },]
  ), [])

  const assigneeOptions = useMemo(() => (
    [{
      label: 'John Doe',
      value: 'john-doe',
    }, {
      label: 'Jane Doe',
      value: 'jane-doe',
    }, {
      label: 'John Smith',
      value: 'john-smith',
    }, {
      label: 'Jane Smith',
      value: 'jane-smith',
    },]
  ), [])

  const priorityOptions = useMemo(() => (
    [{
      label: 'Low',
      value: 'low',
    }, {
      label: 'Medium',
      value: 'medium',
    }, {
      label: 'High',
      value: 'high',
    }, {
      label: 'Critical',
      value: 'critical',
    },]
  ), [])

  const projectOptions = useMemo(() => (
    [{
      label: 'Project 1',
      value: 'project-1',
    }, {
      label: 'Project 2',
      value: 'project-2',
    }, {
      label: 'Project 3',
      value: 'project-3',
    },]
  ), [])
  
  

  const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null)
  const [isLinkEditMode, setIsLinkEditMode] = useState(false)
  const editorRef = useRef<LexicalEditor | null>(null)
  const [prevHtmlContent, setPrevHtmlContent] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<{ [key: string]: Checked }>({})
  const [selectedTodo, setSelectedTodo] = useState<Option | null>(null)
  const [selectedAssignee, setSelectedAssignee] = useState<Option | null>(null)
  const [selectedPriority, setSelectedPriority] = useState<Option | null>(null)
  const [selectedProject, setSelectedProject] = useState<Option | null>(null)

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
        suggestedTags.reduce((acc, tag) => ({
          ...acc,
          [tag]: true
        }), {})
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
    [onSubmit, prevHtmlContent],
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
      }}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          backgroundColor: '#fff',
          marginBottom: 1,
          borderRadius: 1,
        }}>
        <LexicalComposer initialConfig={initialConfig}>
          <div style={{position: 'relative', width: '100%', height: '100%'}}>
            <RichTextPlugin
              contentEditable={
                <div ref={onRef}>
                  <ContentEditable readOnly={false} aria-placeholder='Describe this task'  placeholder={<div className="editor-placeholder">Describe this task</div>} style={editableContentStyle} />
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
            <OnChangePlugin
              onChange={(state, editor) => {
                exportToHtml(state, editor)
                editorRef.current = editor
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {isLoading && (
              <Sparkles className="w-4 h-4 animate-ping text-indigo-600 mr-2" />
            )}
            <AnimatePresence>
              {selectedTags && (
                <>
                  {Object.entries(selectedTags).map(([key, value]) => {
                    return value && (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0}}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3, delay: 0.2, }}
                        layout
                      >
                      <Badge key={key} variant="outline" className="flex items-center gap-2 border-dashed">
                        {tagOptions.find(option => option.value === key)?.icon}
                        {tagOptions.find(option => option.value === key)?.label}
                      </Badge>
                      </motion.div>
                    )
                  })}
                </>
              )}
            </AnimatePresence>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <AnimatePresence>
              {selectedTodo && (
                <motion.div
                key={selectedTodo.value}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                layout
                >
                <Badge variant="outline" className="flex items-center gap-2 bg-cyan-50">
                  {todoOptions.find(option => option.value === selectedTodo.value)?.label}
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
                >
                  <Badge variant="outline" className="flex items-center gap-2 bg-amber-50">
                    {assigneeOptions.find(option => option.value === selectedAssignee.value)?.label}
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
                >
                  <Badge variant="outline" className="flex items-center gap-2 " style={{backgroundColor: selectedPriority.value === 'critical' ? '#ffaeae' : selectedPriority.value === 'high' ? '#ffe2ae' : selectedPriority.value === 'medium' ? '#fff6ae' : selectedPriority.value === 'low' ? '#b8ffae' : '#fefefe'}}>
                    {priorityOptions.find(option => option.value === selectedPriority.value)?.label}
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
                >
                  <Badge variant="outline" className="flex items-center gap-2 bg-blue-50">
                    {projectOptions.find(option => option.value === selectedProject.value)?.label}
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            <SingleSelectMenu title={
              <div className="flex items-center gap-2">
                <CircleDashed />
                Todo
              </div>
            } options={todoOptions} setSelectedOption={setSelectedTodo} />
            <SingleSelectMenu title={
              <div className="flex items-center gap-2">
                <CircleUserRound />
                Assignee
                </div>
            } options={assigneeOptions} setSelectedOption={setSelectedAssignee} />
            <SingleSelectMenu title={
              <div className="flex items-center gap-2">
                <Flag />
                Priority
              </div>
            } options={priorityOptions} setSelectedOption={setSelectedPriority} />
            <MultiSelectMenu selectedOptions={selectedTags} setSelectedOptions={setSelectedTags} title={
              <div className="flex items-center gap-2">
                <Tag />
                Tags
              </div>
            } options={tagOptions} />
            <SingleSelectMenu title={
              <div className="flex items-center gap-2">
                <Grid2x2 />
                Project
              </div>
            } options={projectOptions} setSelectedOption={setSelectedProject} />
            <Button variant="outline" size="sm" className="h-8 flex items-center gap-2">
              <Calendar />
              Due Date
            </Button>
          </div>
          <div className='flex items-center justify-start w-full gap-4 mt-4 border-t pt-4'>
          <ToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />
          {/* Create Button */}
          <div className="flex justify-end">
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              Create
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
  minHeight: '100px',
  border: 'none',
  outline: 'none',
}