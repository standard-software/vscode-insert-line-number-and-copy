const vscode = require("vscode");
const clipboardy = require("clipboardy");

function activate(context) {
  const extensionMain = (commandName) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage(`No editor is active`);
      return;
    }

    // const quickPickItems = [
    //   { label: "A", description: "AA" },
    //   { label: "B", description: "BB" },
    // ];
    // console.log('vscode.window.showQuickPick(quickPickItems before')
    // vscode.window.showQuickPick(quickPickItems, {
    //   canPickMany: false,
    //   placeHolder: "Select Line Number Pattern",
    // }).then((item) => {
    //   console.log('vscode.window.showQuickPick(quickPickItems after')
    //   if (!item) { return; }

    editor.edit((ed) => {
      const editorSelectionsLoop = (func) => {
        editor.selections.forEach((select) => {
          const range = new vscode.Range(
            select.start.line,
            0,
            select.end.line,
            select.end.character
          );
          const text = editor.document.getText(range);
          func(range, text, select);
        });
      };

      const getNumberMaxLength = (lines, start) => {
        let maxLength = 0;
        lines.forEach((line, i) => {
          const number = start + i;
          const length = number.toString().length;
          if (maxLength < length) {
            maxLength = length;
          }
        });
        return maxLength;
      };

      switch (commandName) {
        case `InsertStartZero`:
          editorSelectionsLoop((range, text) => {
            const lines = text.split(`\n`);
            const maxLength = getNumberMaxLength(lines, 0);
            lines.forEach((line, i) => {
              lines[i] = `${i.toString().padStart(maxLength)}: ${line}`;
            });
            ed.replace(range, lines.join("\n"));
          });
          break;

        case `CopyFileLineNumer`:
          let copyText = "";
          editorSelectionsLoop((range, text, select) => {
            const lines = text.split(`\n`);
            const start = select.start.line + 1;
            const maxLength = getNumberMaxLength(lines, start);
            lines.forEach((line, i) => {
              const number = start + i;
              lines[i] = `${number
                .toString()
                .padStart(maxLength)}: ${line}`;
            });
            copyText += lines.join("\n") + "\n";
          });
          clipboardy.writeSync(copyText);
          break;

        default:
          new Error(`extensionMain`);
      }
    });

    // });

  };

  context.subscriptions.push(
    vscode.commands.registerCommand(
      `InsertLineNumberAndCopy.InsertStartZero`,
      () => {
        extensionMain(`InsertStartZero`);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      `InsertLineNumberAndCopy.CopyFileLineNumer`,
      () => {
        extensionMain(`CopyFileLineNumer`);
      }
    )
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
