let refreshToken: null | string = null;

export function setInstantRefreshToken(token: null | string) {
  refreshToken = token;
}

export function getInstantRefreshToken() {
  return refreshToken;
}
