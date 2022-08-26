import axios from 'axios'
import React, { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_SERVER } from '../util/constants'

import './Login.scss'

export const Login: React.FC<{}> = () => {
  const [username, setUsername] = useState(``)
  const [password, setPassword] = useState(``)
  const navigate = useNavigate()

  const handleSubmit: (
    event: FormEvent<HTMLFormElement>
  ) => Promise<void> = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    // 👇️ prevent page refresh
    event.preventDefault()

    const response = await axios.post(`${API_SERVER}/login`, {
      username,
      password,
    })
    const result = response.data
    if (!(`success` in result)) {
      const error: string = result.error
      alert(`Login failed: ${error}`)
    }
    navigate(`/swap`, { state: { user: result.user } })
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
