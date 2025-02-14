import {useEffect} from 'react'
import {$generateNodesFromDOM} from '@lexical/html'
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext'
import {$createParagraphNode, $createTextNode, $getRoot} from 'lexical'

function InitializeContentPlugin({
  isContentAvailable,
  htmlContent,
}: {
  isContentAvailable: boolean
  htmlContent: string
}) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!isContentAvailable) return
    editor.update(() => {
      const root = $getRoot()
      root.clear()

      const isHTML = /<[a-z][\s\S]*>/i.test(htmlContent)

      // If HTML then Convert HTML to Lexical nodes else convert plain text to Lexical para nodes
      if (isHTML) {
        const parser = new DOMParser()
        const dom = parser.parseFromString(htmlContent, 'text/html')
        const nodes = $generateNodesFromDOM(editor, dom)

        // Append the nodes to the editor
        nodes.forEach(node => {
          root.append(node)
        })
      } else {
        const paraNodes = $createParagraphNode()
        const textNode = $createTextNode(htmlContent)
        paraNodes.append(textNode)
        root.append(paraNodes)
      }
    })
  }, [editor, htmlContent, isContentAvailable])

  return null
}

export default InitializeContentPlugin
