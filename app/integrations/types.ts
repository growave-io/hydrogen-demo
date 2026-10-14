export type Integration = {
  title: string;
  kind: 'Drop-in widget' | 'Custom widget';
  description: string;
  code: string;
  file: string;
  docsUrl?: string;
};

export const REPO_URL = 'https://github.com/growave-io/hydrogen-demo';
export const SDK_SETUP_URL = `${REPO_URL}#growave-setup`;
export function placeholderDocsUrl(path: string) {
  return `https://docs.growave.io/docs/Sdk/placeholders/${path}/`;
}
