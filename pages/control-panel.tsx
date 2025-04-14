import { useSession } from "next-auth/react"
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import ControlPanel from '../components/control-panel'

export default function ControlPanelPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/login')
    }
  }, [status, router])

  if (status === "loading") {
    return <p>Loading...</p>
  }

  if (!session) {
    return null
  }

  return <ControlPanel />
}