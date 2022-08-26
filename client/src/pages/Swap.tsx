import React from 'react'
import { useLocation } from 'react-router-dom'

export const Swap: React.FC<{}> = () => {
  const { state } = useLocation()
  const { user } = state as any

  return (
    <div>
      <h1>Swap page!</h1>
      <div>user:</div>
      <div>{JSON.stringify(user, null, 4)}</div>
    </div>
  )
}
