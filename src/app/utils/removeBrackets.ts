export const removeBrackets = (name?: string) => {
  if (!name) {
    return ''
  }
  const bracketIndex = name.indexOf(']')
  if (bracketIndex !== -1) {
    return name.slice(bracketIndex + 1).trimStart()
  }
  return name
}
