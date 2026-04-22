export class AuthModuleStubError extends Error {
  public constructor(message = "TDD_RED: auth module stub") {
    super(message);
    this.name = "AuthModuleStubError";
  }
}
