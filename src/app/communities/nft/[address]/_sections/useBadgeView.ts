'use client'

import { create } from 'zustand'

type ViewState = 'images' | 'table'

interface ViewIconHandlerProps {
  view: ViewState
  onChangeView: (view: ViewState) => void
}

export const useBadgeView = create<ViewIconHandlerProps>(set => ({
  view: 'images',
  onChangeView: (newView: ViewState) =>
    set(() => ({
      view: newView,
    })),
}))
