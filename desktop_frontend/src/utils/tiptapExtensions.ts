import { Extension } from '@tiptap/core'

// ── FontSize ──────────────────────────────────────────────────────────────────
// Adds font-size via the TextStyle mark (requires @tiptap/extension-text-style).

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize:   (size: string)  => ReturnType
      unsetFontSize: ()              => ReturnType
    }
    lineHeight: {
      setLineHeight:   (value: string) => ReturnType
      unsetLineHeight: ()              => ReturnType
    }
  }
}

export const FontSize = Extension.create({
  name: 'fontSize',
  addOptions: () => ({ types: ['textStyle'] }),
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        fontSize: {
          default:    null,
          parseHTML:  el  => el.style.fontSize || null,
          renderHTML: attrs => attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
        },
      },
    }]
  },
  addCommands() {
    return {
      setFontSize:   size => ({ chain }) => chain().setMark('textStyle', { fontSize: size }).run(),
      unsetFontSize: ()   => ({ chain }) => chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    }
  },
})

// ── LineHeight ────────────────────────────────────────────────────────────────
// Adds a line-height attribute to paragraph and heading nodes.

export const LineHeight = Extension.create({
  name: 'lineHeight',
  addGlobalAttributes() {
    return [{
      types: ['paragraph', 'heading'],
      attributes: {
        lineHeight: {
          default:    null,
          parseHTML:  el  => el.style.lineHeight || null,
          renderHTML: attrs => attrs.lineHeight ? { style: `line-height: ${attrs.lineHeight}` } : {},
        },
      },
    }]
  },
  addCommands() {
    return {
      setLineHeight: value => ({ chain }) =>
        chain()
          .updateAttributes('paragraph', { lineHeight: value })
          .updateAttributes('heading',   { lineHeight: value })
          .run(),
      unsetLineHeight: () => ({ chain }) =>
        chain()
          .resetAttributes('paragraph', 'lineHeight')
          .resetAttributes('heading',   'lineHeight')
          .run(),
    }
  },
})
