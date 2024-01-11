async function initRefreshTokenAuth() {}

export async function verifyAuth(request: () => Promise<Response>) {
  try {
    return await request();
  } catch (err: unknown) {
    if (err instanceof Response && err.status === 401) {
      await initRefreshTokenAuth();
      return await request();
    }
    console.log(err);
    throw new Error("Error @ cognito.verifyAuth");
  }
}
