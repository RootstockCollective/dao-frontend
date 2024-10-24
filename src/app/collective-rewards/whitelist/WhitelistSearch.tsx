import { Input } from '@/components/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select'
import { Label } from '@/components/Typography'
import { BuilderStatusFilter, useWhitelistContext } from '@/app/collective-rewards/whitelist/WhitelistContext'
import { useAlertContext } from '@/app/providers'
import { useEffect } from 'react'

export const WhitelistSearch = () => {
  const { search, filterBy, error: whitelistError } = useWhitelistContext()
  const { setMessage: setErrorMessage } = useAlertContext()

  useEffect(() => {
    if (whitelistError) {
      setErrorMessage({
        severity: 'error',
        title: 'Error loading proposals state',
        content: whitelistError.message,
      })
      console.error('🐛 whitelistError:', whitelistError)
    }
  }, [whitelistError, setErrorMessage])

  // TODO: are there other statuses to be considered?
  const statuses = [
    { value: 'all', label: 'All' },
    { value: 'Whitelisted', label: 'Whitelisted' },
    { value: 'In progress', label: 'In progress' },
  ]

  const onValueChange = (value: string) => filterBy.onChange(value as BuilderStatusFilter)

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

      <div className="flex flex-row items-center pl-4">
        <Label className="text-white text-right pr-3 w-24">Filter by</Label>
        <div>
          <Select onValueChange={onValueChange} defaultValue={'all'}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Select an asset" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map(({ value, label }, index) => (
                <SelectItem key={index} value={value}>
                  <div className="flex items-center">{label}</div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
