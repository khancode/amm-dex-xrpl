import React, { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
// import { login } from '../util/apiRequests'

import './Login.scss'

export const Login: React.FC<{}> = () => {
  const [username, setUsername] = useState(``)
  const [password, setPassword] = useState(``)
  const navigate = useNavigate()

  // TODO: remove after login modal is implemented on /swap page
  useEffect(() => {
    // DEV: immediately redirect to /swap page until login modal is implemented
    navigate(`/swap`)
  })

  const handleSubmit: (
    event: FormEvent<HTMLFormElement>
  ) => Promise<void> = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    // 👇️ prevent page refresh
    event.preventDefault()

    // const response = await login(username, password)
    // navigate(`/swap`, { state: { user: result.user } })
  }

  return (
    <main>
      <h1>Login page!</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
        <input
          type="text"
          placeholder="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <input type="submit" />
      </form>
    </main>
  )
}
