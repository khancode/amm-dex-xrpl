import axios from 'axios'
import { LoginResponse } from './apiModels'

const API_SERVER = `http://localhost:3000`
const API_LOGIN_URL = `${API_SERVER}/login`

export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {
  return await new Promise((resolve, reject) => {
    const body = { username, password }
    axios
      .post(API_LOGIN_URL, body)
      .then((response) => {
        if (response.status < 200 || response.status > 299) {
          reject(response.data.error)
        }
        resolve(response.data)
      })
      .catch((error) => {
        throw new Error(error)
      })
  })
}
