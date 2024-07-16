import { useRouter } from 'next/router'

export default function Test() {
  const {
    query: { id },
  } = useRouter()
  if (!id) return <p>No ID found.</p>
  return <p>ID Found: {id}</p>
}
