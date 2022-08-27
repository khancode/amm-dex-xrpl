import React, { useEffect, useState } from 'react'
import { LoginResponse } from '../util/apiModels'
import { login } from '../util/apiRequests'
import { PASSWORD, USERNAME } from '../util/constants'

export const Swap: React.FC<{}> = () => {
  const [user, setUser] = useState<LoginResponse>()

  useEffect(() => {
    login(USERNAME, PASSWORD).then((loginResponse) => {
      setUser(loginResponse)
    })
  }, [])

  return (
    <div>
      <h1>Swap page!</h1>
      <div>user:</div>
      <div>{user != null && JSON.stringify(user, null, 4)}</div>
    </div>
  )
}
