import { inject, type ShallowRef } from 'vue'
import type { Editor } from '@tiptap/vue-3'

export function useEditorInstance() {
  return inject<ShallowRef<Editor | undefined>>('editor')
}
