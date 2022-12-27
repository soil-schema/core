export default interface TokenProvider {
  token(offset: number): string | undefined;
};