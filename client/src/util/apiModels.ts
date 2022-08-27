export interface LoginResponse {
  success: string
  user: {
    _id: string
    username: string
    password: string
    wallet: {
      address: string
      seed: string
      _id: string
    }
  }
}
