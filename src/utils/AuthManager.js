import { SimpleStorage, createStorage } from "./createStorage";

class AuthManager {
  _storage = createStorage("calls@authManager");
  _credential = null;

  async getSavedCredential() {
    if (this._credential) {
      return this._credential;
    }
    const cred = await this._storage.get();
    if (cred) {
      this._credential = cred;
    }
    return this._credential;
  }
  isAuthenticated() {
    return Boolean(this._credential);
  }
  authenticate(cred) {
    this._credential = cred;
    return this._storage.update(this._credential);
  }
  deAuthenticate() {
    this._credential = null;
    return this._storage.update(this._credential);
  }
}

export default new AuthManager();
