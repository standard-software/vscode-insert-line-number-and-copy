const vscode = require("vscode");
const clipboardy = require("clipboardy");
const {
  _deleteFirst,
  _trimFirst,
} = require('./parts/parts.js')

function activate(context) {

  const extensionMain = (commandName) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage(`No editor is active`);
      return;
    }

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

    const getIndent = (line) => {
      return line.length - _trimFirst(line, [' ', '\t']).length;
    }

    const getMinIndent = (lines) => {
      let minIndent = Infinity;
      for (let i = 0; i < lines.length; i += 1) {
        if (lines[i].trim() === '') { continue; }
        const indent = getIndent(lines[i])
        if (indent < minIndent) {
          minIndent = indent
        }
      }
      if (minIndent === Infinity) { minIndent = 0; }
      return minIndent;
    }

    const getBlankLineCount = (select) => {
      const range = new vscode.Range(
        select.start.line,
        0,
        select.end.line,
        select.end.character
      );
      const text = editor.document.getText(range);
      const lines = text.split(`\n`);
      let blankLineCount = 0;
      lines.forEach((line) => {
        if (line.trim() === '') { blankLineCount += 1; }
      });
      return blankLineCount;
    };

    const select = editor.selections[0];
    let labelIncludeBlank = '';
    let labelExcludeBlank = '';
    const lineCount = select.end.line - select.start.line + 1;
    const blankLineCount = getBlankLineCount(select);
    switch (commandName) {
      case `InsertStartZero`:
        labelIncludeBlank = `${0} - ${lineCount - 1}`;
        labelExcludeBlank = `${0} - ${lineCount - 1 - blankLineCount}`;
      break;

      case `CopyFileLineNumer`:
        labelIncludeBlank = `${select.start.line + 1} - ${select.end.line + 1}`;
        labelExcludeBlank = `${select.start.line + 1} - ${select.end.line + 1}`;
      break;

      default:
        new Error(`extensionMain`);
    }

    const pickFormatNo = { label: `${labelIncludeBlank} | No Format`, description: "" };
    const pickFormatFull = { label: `${labelExcludeBlank} | Format : Delete Indent and Delete Blank Lines`, description: "" };
    const pickFormatIndent = { label: `${labelIncludeBlank} | Format : Delete Indent`, description: "" };
    const pickFormatBlankLine = { label: `${labelExcludeBlank} | Format : Delete Blank Lines`, description: "" };

    const quickPickItems = [
      pickFormatNo,
      pickFormatFull,
      pickFormatIndent,
      pickFormatBlankLine,
    ];
    vscode.window.showQuickPick(quickPickItems, {
      canPickMany: false,
      placeHolder: "Select Line Number Pattern",
    }).then((item) => {
      if (!item) { return; }

      editor.edit((ed) => {

        // const editorSelectionsLoopInsertLineNumber = () => {

        // }

        // const insertLineNumber = (initialValue, isIncrementBlankLine) => {

        // }

        // const insertCopyLineNumber = (initialValue, isIncrementBlankLine) => {

        // }

        // const insertStart = (initialValue) => {
        //   editorSelectionsLoop((range, text) => {
        //     const lines = text.split(`\n`);
        //     const maxLength = getNumberMaxLength(lines, 0);
        //     const newLines = [];
        //     let minIndent = 0;
        //     if ([pickFormatFull, pickFormatIndent].includes(item)) {
        //       minIndent = getMinIndent(lines);
        //     }
        //     let i = initialValue;
        //     lines.forEach((line) => {
        //       if (item === pickFormatFull) {
        //         if (line.trim() === '') { return; }
        //         line = _deleteFirst(line, minIndent);
        //       } else if (item === pickFormatBlankLine) {
        //         if (line.trim() === '') { return; }
        //       } else if (item === pickFormatIndent) {
        //         line = _deleteFirst(line, minIndent)
        //       }
        //       newLines.push(
        //         `${i.toString().padStart(maxLength)}: ${line}`
        //       );
        //       i += 1;
        //     });
        //     ed.replace(range, newLines.join("\n"));
        //   });
        // }

        switch (commandName) {
          case `InsertStartZero`:
            editorSelectionsLoop((range, text) => {
              const lines = text.split(`\n`);
              const maxLength = getNumberMaxLength(lines, 0);
              const newLines = [];
              let minIndent = 0;
              if ([pickFormatFull, pickFormatIndent].includes(item)) {
                minIndent = getMinIndent(lines);
              }
              let i = 0;
              lines.forEach((line) => {
                if (item === pickFormatFull) {
                  if (line.trim() === '') { return; }
                  line = _deleteFirst(line, minIndent);
                } else if (item === pickFormatBlankLine) {
                  if (line.trim() === '') { return; }
                } else if (item === pickFormatIndent) {
                  line = _deleteFirst(line, minIndent)
                }
                newLines.push(
                  `${i.toString().padStart(maxLength)}: ${line}`
                );
                i += 1;
              });
              ed.replace(range, newLines.join("\n"));
            });
            break;

          // case `InsertStartOne`:
          //   insertStart(1);
          //   break;

          case `CopyFileLineNumer`:
            let copyText = "";
            editorSelectionsLoop((range, text, select) => {
              const lines = text.split(`\n`);
              const start = select.start.line + 1;
              const maxLength = getNumberMaxLength(lines, start);
              const newLines = [];
              let minIndent = 0;
              if ([pickFormatFull, pickFormatIndent].includes(item)) {
                minIndent = getMinIndent(lines);
              }
              lines.forEach((line, i) => {
                if (item === pickFormatFull) {
                  if (line.trim() === '') { return; }
                  line = _deleteFirst(line, minIndent);
                } else if (item === pickFormatBlankLine) {
                  if (line.trim() === '') { return; }
                } else if (item === pickFormatIndent) {
                  line = _deleteFirst(line, minIndent)
                }
                const number = start + i;
                newLines.push(
                  `${number.toString().padStart(maxLength)}: ${line}`
                );
              });
              copyText += newLines.join("\n") + "\n";
            });
            clipboardy.writeSync(copyText);
            break;

          default:
            new Error(`extensionMain`);
        }
      });

    });

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
      `InsertLineNumberAndCopy.InsertStartOne`,
      () => {
        extensionMain(`InsertStartOne`);
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
