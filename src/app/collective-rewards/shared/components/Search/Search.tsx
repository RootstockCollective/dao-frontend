import { Input } from '@/components/Input'
import { useSearchContext } from '../../context'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select'
import { Label } from '@/components/Typography'
import { FC } from 'react'

type SearchProps = {
  status?: Array<{ value: string; label: string }>
}
export const Search: FC<SearchProps> = ({ status }) => {
  const { search, filterBy } = useSearchContext()

  const onValueChange = (value: string) => filterBy.onChange(value)

  return (
    <div className="flex items-center py-6">
      <Input
        name="builderSearch"
        placeholder="Search a builder"
        className="w-full"
        fullWidth
        value={search.value}
        onChange={search.onChange}
        type="search"
      />

      {status && (
        <div className="flex flex-row items-center pl-4">
          <Label className="text-white text-right pr-3 w-24">Filter by</Label>
          <div>
            <Select onValueChange={onValueChange} defaultValue={'all'}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Select an asset" />
              </SelectTrigger>
              <SelectContent>
                {status.map(({ value, label }, index) => (
                  <SelectItem key={index} value={value}>
                    <div className="flex items-center">{label}</div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}
