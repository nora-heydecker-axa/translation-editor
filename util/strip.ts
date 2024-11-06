export function stripProject(path: string): string {
  if (path.endsWith("/lang")) {
    path = path.slice(0, path.length - "/lang".length);
  }
  if (path.endsWith("/i18n")) {
    path = path.slice(0, path.length - "/i18n".length);
  }
  if (path.endsWith("/locales")) {
    path = path.slice(0, path.length - "/locales".length);
  }
  if (path.startsWith("frontend/packages/")) {
    return path.slice("frontend/packages/".length);
  }
  if (path.startsWith("node/")) {
    return path.slice("node/".length);
  }
  return path;
}
