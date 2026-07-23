/**
 * Resolves Astro's virtual content module during unit tests. Repository tests
 * inject loaders, so reaching this function is always a test setup error.
 */
export async function getCollection(): Promise<never> {
  throw new Error("Tests must inject content repository loaders");
}
