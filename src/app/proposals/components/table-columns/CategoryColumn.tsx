import { Category } from '@/components/Category/Category'
import { type CategoryType } from '@/components/Category/types'

interface CategoryColumnProps {
  proposalCategory: string | undefined
}

export const CategoryColumn = ({ proposalCategory }: CategoryColumnProps) => {
  if (typeof proposalCategory === 'undefined') {
    return null
  }
  const category = proposalCategory as CategoryType
  return <Category category={category} />
}
