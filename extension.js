const vscode = require('vscode');
const path = require('path');

function activate(context) {
  const provider = {
    provideDocumentLinks(document) {
      const links = [];
      const text = document.getText();
      const regex = /\{>\s*(?:"([^"\\]+)"|'([^'\\]+)'|([-a-zA-Z0-9_./]+))/g;
      let match;
      while ((match = regex.exec(text))) {
        const targetPath = match[1] || match[2] || match[3];
        const start = document.positionAt(match.index + match[0].indexOf(targetPath));
        const end = document.positionAt(match.index + match[0].indexOf(targetPath) + targetPath.length);
        const range = new vscode.Range(start, end);
        const uri = resolveInclude(document.uri, targetPath);
        links.push(new vscode.DocumentLink(range, uri));
      }
      return links;
    }
  };

  context.subscriptions.push(
    vscode.languages.registerDocumentLinkProvider({ language: 'igo-dust' }, provider)
  );
}

function resolveInclude(baseUri, includePath) {
  if (!includePath.endsWith('.dust')) {
    includePath += '.dust';
  }
  if (includePath.startsWith('/')) {
    const folder = vscode.workspace.getWorkspaceFolder(baseUri);
    if (folder) {
      return vscode.Uri.joinPath(folder.uri, includePath.slice(1));
    }
  }
  const dir = path.dirname(baseUri.fsPath);
  return vscode.Uri.file(path.join(dir, includePath));
}

function deactivate() {}

module.exports = { activate, deactivate };
