const API_BASE_URL = '/api'

type ApiError = { error?: string }

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token = '',
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
    const data = (await response.json()) as T & ApiError

    if (!response.ok) {
      throw new Error(data.error || 'Não foi possível concluir a solicitação.')
    }

    return data
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        'Não foi possível conectar ao servidor. Inicie o aplicativo com “npm.cmd run dev” e tente novamente.',
        { cause: error },
      )
    }
    throw error
  }
}
