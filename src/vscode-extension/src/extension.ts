import * as path from 'path';
import * as vscode from 'vscode';
import { Uri, WebviewPanel } from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient/node';

let client: LanguageClient;

const generator = (function* () {
  let i = 0;
  while (true) {
    yield i++;
  }
})();

export function activate(context: vscode.ExtensionContext) {
  const insiders = context.extension.id.endsWith("-insiders");
  const extensionVersion = context.extension.packageJSON.version;

  context.subscriptions.push(vscode.commands.registerCommand('azure-cost-estimator.estimate', (uri: vscode.Uri) => {

    const window = vscode.window;

    const file = uri.fsPath || window.activeTextEditor?.document.fileName;

    window.setStatusBarMessage(`Estimating cost of Azure resources for ${file}`, 3000);

    window.setStatusBarMessage(`Estimated cost of Azure resources for ${file}`, 3000);

    const _panel: WebviewPanel | undefined = window.createWebviewPanel(
      `${file}`,
      `Cost estimation for ${file}`,
      { viewColumn: vscode.ViewColumn.Beside, preserveFocus: false },
      {
        retainContextWhenHidden: true,
        enableFindWidget: true,
        enableCommandUris: true,
        enableScripts: true,
      }
    );
    _panel.iconPath = {
      light: Uri.file(context.asAbsolutePath("light-panel-icon.svg")),
      dark: Uri.file(context.asAbsolutePath("dark-panel-icon.svg"))
    };
    _panel.webview.html = "_panel.webview";

    const serverModule = context.asAbsolutePath(
      path.join("cli")
    );

    const serverOptions: ServerOptions = {
      run: { module: serverModule, transport: TransportKind.ipc },
      debug: {
        module: serverModule,
        transport: TransportKind.ipc,
        options: { execArgv: ["--file", `${file}`] }
      }
    };

    const clientOptions: LanguageClientOptions = {
      documentSelector: [{ scheme: "file", language: "plaintext" }],
      synchronize: {
        fileEvents: vscode.workspace.createFileSystemWatcher("**/.clientrc")
      }
    };

    client = new LanguageClient(
      "BicepCostEstimatorLanguageServer",
      "Bicep Cost Estimator Language Server",
      serverOptions,
      clientOptions
    );

    client.start();
  }));
}

export function deactivate() {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
