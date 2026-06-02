import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, UnderlineType, ExternalHyperlink,
  Table, TableRow, TableCell, WidthType, BorderStyle,
} from 'docx'

// ── Types ─────────────────────────────────────────────────────────────────────

interface TipTapMark {
  type: string
  attrs?: Record<string, any>
}

interface TipTapNode {
  type: string
  text?: string
  attrs?: Record<string, any>
  marks?: TipTapMark[]
  content?: TipTapNode[]
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function pxToHalfPt(px: string): number {
  // px → pt (at 96 dpi) → half-points (docx unit)
  return Math.round(parseFloat(px) * 72 / 96) * 2
}

function stripHash(color: string): string {
  return color.startsWith('#') ? color.slice(1) : color
}

function getAlignment(attrs?: Record<string, any>): typeof AlignmentType[keyof typeof AlignmentType] {
  switch (attrs?.textAlign) {
    case 'center':  return AlignmentType.CENTER
    case 'right':   return AlignmentType.RIGHT
    case 'justify': return AlignmentType.BOTH
    default:        return AlignmentType.LEFT
  }
}

// ── Text node → TextRun / ExternalHyperlink ───────────────────────────────────

function textNodeToRun(node: TipTapNode): TextRun | ExternalHyperlink {
  const text   = node.text ?? ''
  const marks  = node.marks ?? []

  let bold      = false
  let italics   = false
  let underline: { type: typeof UnderlineType[keyof typeof UnderlineType] } | undefined
  let strike    = false
  let color: string | undefined
  let size: number | undefined
  let font: string | undefined
  let highlight: string | undefined
  let subScript   = false
  let superScript = false
  let link: string | undefined

  for (const mark of marks) {
    switch (mark.type) {
      case 'bold':       bold    = true; break
      case 'italic':     italics = true; break
      case 'underline':  underline = { type: UnderlineType.SINGLE }; break
      case 'strike':     strike  = true; break
      case 'subscript':  subScript   = true; break
      case 'superscript': superScript = true; break
      case 'highlight':  highlight = 'yellow'; break
      case 'link':       link = mark.attrs?.href; break
      case 'textStyle':
        if (mark.attrs?.color)      color = stripHash(mark.attrs.color)
        if (mark.attrs?.fontSize)   size  = pxToHalfPt(mark.attrs.fontSize)
        if (mark.attrs?.fontFamily) {
          font = mark.attrs.fontFamily.split(',')[0].trim().replace(/['"]/g, '')
        }
        break
    }
  }

  const run = new TextRun({
    text,
    bold,
    italics,
    underline,
    strike,
    color,
    size,
    font: font ? { name: font } : undefined,
    subScript,
    superScript,
    highlight: highlight as any,
  })

  if (link) {
    return new ExternalHyperlink({ link, children: [run] })
  }
  return run
}

// ── Inline content → array of runs ───────────────────────────────────────────

function inlineContent(nodes: TipTapNode[]): (TextRun | ExternalHyperlink)[] {
  return nodes.flatMap(node => {
    if (node.type === 'text')      return [textNodeToRun(node)]
    if (node.type === 'hardBreak') return [new TextRun({ break: 1 })]
    // Images inside inline context — skip (handled at block level)
    return []
  })
}

// ── Block-level conversion ────────────────────────────────────────────────────

function convertNodes(nodes: TipTapNode[], listLevel = 0): Paragraph[] {
  const result: Paragraph[] = []

  for (const node of nodes) {
    switch (node.type) {

      case 'paragraph': {
        const children = inlineContent(node.content ?? [])
        result.push(new Paragraph({
          children: children.length ? children : [new TextRun('')],
          alignment: getAlignment(node.attrs),
          spacing: { after: 100 },
        }))
        break
      }

      case 'heading': {
        const levelMap: Record<number, typeof HeadingLevel[keyof typeof HeadingLevel]> = {
          1: HeadingLevel.HEADING_1,
          2: HeadingLevel.HEADING_2,
          3: HeadingLevel.HEADING_3,
          4: HeadingLevel.HEADING_4,
          5: HeadingLevel.HEADING_5,
          6: HeadingLevel.HEADING_6,
        }
        result.push(new Paragraph({
          children: inlineContent(node.content ?? []),
          heading: levelMap[node.attrs?.level ?? 1] ?? HeadingLevel.HEADING_1,
          alignment: getAlignment(node.attrs),
        }))
        break
      }

      case 'bulletList': {
        for (const item of node.content ?? []) {
          // listItem → paragraph (first child) + optional nested lists
          const [first, ...rest] = item.content ?? []
          if (first?.type === 'paragraph') {
            result.push(new Paragraph({
              children: inlineContent(first.content ?? []),
              bullet: { level: listLevel },
              spacing: { after: 40 },
            }))
          }
          // Nested lists
          for (const child of rest) {
            if (child.type === 'bulletList' || child.type === 'orderedList') {
              result.push(...convertNodes([child], listLevel + 1))
            }
          }
        }
        break
      }

      case 'orderedList': {
        let counter = node.attrs?.start ?? 1
        for (const item of node.content ?? []) {
          const [first, ...rest] = item.content ?? []
          if (first?.type === 'paragraph') {
            result.push(new Paragraph({
              children: [
                new TextRun(`${counter}. `),
                ...inlineContent(first.content ?? []),
              ],
              indent: { left: 360 * (listLevel + 1) },
              spacing: { after: 40 },
            }))
            counter++
          }
          for (const child of rest) {
            if (child.type === 'bulletList' || child.type === 'orderedList') {
              result.push(...convertNodes([child], listLevel + 1))
            }
          }
        }
        break
      }

      case 'blockquote': {
        for (const child of node.content ?? []) {
          const children = inlineContent(child.content ?? [])
          result.push(new Paragraph({
            children: children.length ? children : [new TextRun('')],
            indent: { left: 720, hanging: 0 },
            border: {
              left: { style: BorderStyle.SINGLE, size: 12, color: 'EA580C', space: 8 },
            },
            spacing: { before: 80, after: 80 },
          }))
        }
        break
      }

      case 'codeBlock': {
        const code = (node.content ?? []).map(n => n.text ?? '').join('')
        for (const line of code.split('\n')) {
          result.push(new Paragraph({
            children: [new TextRun({ text: line, font: { name: 'Courier New' }, size: 18 })],
            spacing: { after: 0 },
          }))
        }
        break
      }

      case 'horizontalRule': {
        result.push(new Paragraph({
          children: [new TextRun('')],
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'EA580C' } },
          spacing: { before: 80, after: 80 },
        }))
        break
      }

      case 'table': {
        const rows = (node.content ?? []).map(rowNode =>
          new TableRow({
            children: (rowNode.content ?? []).map(cellNode => {
              const cellContent = convertNodes(cellNode.content ?? [])
              return new TableCell({
                children: cellContent.length ? cellContent : [new Paragraph({ children: [] })],
                width: { size: 100 / (rowNode.content?.length ?? 1), type: WidthType.PERCENTAGE },
              })
            }),
          }),
        )
        if (rows.length) {
          result.push(new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }) as any)
        }
        break
      }

      default:
        // Unknown node — try to extract any inline content
        if (node.content) {
          result.push(...convertNodes(node.content, listLevel))
        }
    }
  }

  return result
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function exportToDocx(contentJson: unknown): Promise<Uint8Array> {
  let nodes: TipTapNode[] = []

  if (contentJson && typeof contentJson === 'object') {
    const doc = contentJson as TipTapNode
    nodes = doc.type === 'doc' ? (doc.content ?? []) : [doc]
  }

  const children = convertNodes(nodes)

  const wordDoc = new Document({
    sections: [{
      properties: {},
      children: children.length ? children : [new Paragraph({ children: [] })],
    }],
  })

  const blob        = await Packer.toBlob(wordDoc)
  const arrayBuffer = await blob.arrayBuffer()
  return new Uint8Array(arrayBuffer)
}
