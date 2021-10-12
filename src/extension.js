const vscode = require("vscode");
const clipboardy = require("clipboardy");
const {
  _deleteFirst,
  _trimFirst,
  _includeCount,
  _indexOfLast,
  _subIndex, _subLength,
} = require('./parts/parts.js')

function activate(context) {

  const extensionMain = (commandName) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage(`No editor is active`);
      return;
    }
    console.log({editor});

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

    const getLinebreakInfo = (select) => {
      const range = new vscode.Range(
        select.start.line,
        0,
        select.end.line,
        select.end.character
      );
      const text = editor.document.getText(range);
      const crlf = _includeCount(text, '\r\n');
      const cr = _includeCount(text, '\r');
      const lf = _includeCount(text, '\n');
      let most = '';
      if (crlf < cr) {
        most = 'cr';
        if (cr < lf) {
          most = 'lf';
        }
      } else {
        most = 'crlf';
        if (crlf < lf) {
          most = 'lf';
        }
      }
      const code =
        most === 'crlf' ? '\r\n'
        : most === 'cr' ? '\r'
        : most === 'lf' ? '\n'
        : '';
      return {
        crlf,
        cr,
        lf,
        most,
        code,
      }
    }

    const select = editor.selections[0];
    let labelIncludeBlank = '';
    let labelExcludeBlank = '';
    const lineCount = select.end.line - select.start.line + 1;
    const blankLineCount = getBlankLineCount(select);
    switch (commandName) {
      case `InsertStartZero`:
      case `CopyStartZero`:
        labelIncludeBlank = `${0} - ${lineCount - 1}`;
        labelExcludeBlank = `${0} - ${lineCount - 1 - blankLineCount}`;
      break;

      case `InsertStartOne`:
      case `CopyStartOne`:
        labelIncludeBlank = `${1} - ${lineCount}`;
        labelExcludeBlank = `${1} - ${lineCount - blankLineCount}`;
      break;

      case `InsertFileLineNumer`:
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

        const editorSelectionsLoopInsertLineNumber = (option, func) => {
          editorSelectionsLoop((range, text) => {
            const lines = text.split(`\n`);
            const newLines = [];
            let minIndent = 0;
            if ([pickFormatFull, pickFormatIndent].includes(item)) {
              minIndent = getMinIndent(lines);
            }
            let initLineNumber =
              option.initialValue === 'Zero' ? 0
              : option.initialValue === 'One' ? 1
              : option.initialValue === 'LineNumber' ? select.start.line + 1
              : (() => { throw new Error('editorSelectionsLoopInsertLineNumber') })()
            ;

            let lineNumber = initLineNumber;
            lines.forEach((line, i) => {
              if (item === pickFormatFull) {
                if (line.trim() === '') { return; }
              } else if (item === pickFormatBlankLine) {
                if (line.trim() === '') { return; }
              } else if (item === pickFormatIndent) {
              }
              if (option.isIncrementBlankLine) {
                lineNumber = initLineNumber + i;
              } else {
                lineNumber += 1;
              }
            });
            const maxLength = lineNumber.toString().length;

            lineNumber = initLineNumber;
            lines.forEach((line, i) => {
              if (item === pickFormatFull) {
                if (line.trim() === '') { return; }
                line = _deleteFirst(line, minIndent);
              } else if (item === pickFormatBlankLine) {
                if (line.trim() === '') { return; }
              } else if (item === pickFormatIndent) {
                line = _deleteFirst(line, minIndent)
              }
              if (option.isIncrementBlankLine) {
                lineNumber = initLineNumber + i;
                newLines.push(
                  `${lineNumber.toString().padStart(maxLength)}: ${line}`
                );
              } else {
                newLines.push(
                  `${lineNumber.toString().padStart(maxLength)}: ${line}`
                );
                lineNumber += 1;
              }
            });
            func(range, newLines);
          });
        }

        const insertLineNumber = (option) => {
          editorSelectionsLoopInsertLineNumber(option,
            (range, newLines) => {
              ed.replace(range, newLines.join("\n"));
            }
          );
        }

        const insertCopyLineNumber = (option) => {
          const linebreakInfo = getLinebreakInfo(editor.selections[0]);
          let linebreak = linebreakInfo.code
          if (linebreak === '') { linebreak = '\n' }

          let copyText = '';
          if (option.initialValue === 'LineNumber') {
            let pathDelimiterIndex = _indexOfLast(editor.document.fileName, '\\');
            if (pathDelimiterIndex === -1) {
              pathDelimiterIndex = _indexOfLast(editor.document.fileName, '/');
            }
            if ([-1, 0].includes(pathDelimiterIndex)) {
              copyText = editor.document.fileName + linebreak;
            } else {
              copyText =
                _subIndex(editor.document.fileName, 0, pathDelimiterIndex)
                + linebreak
                + _subLength(editor.document.fileName, pathDelimiterIndex + 1)
                + linebreak
            }

          }
          editorSelectionsLoopInsertLineNumber(option,
            (range, newLines) => {
              copyText += newLines.join("\n") + linebreak;
            }
          );
          clipboardy.writeSync(copyText);
        }

        switch (commandName) {
          case `InsertStartZero`:
            insertLineNumber({ isIncrementBlankLine: false, initialValue: 'Zero', });
            break;

          case `InsertStartOne`:
            insertLineNumber({ isIncrementBlankLine: false, initialValue: 'One', });
            break;

          case `InsertFileLineNumer`:
            insertLineNumber({ isIncrementBlankLine: true, initialValue: 'LineNumber', });
            break;

          case `CopyStartZero`:
            insertCopyLineNumber({ isIncrementBlankLine: false, initialValue: 'Zero', });
            break;

          case `CopyStartOne`:
            insertCopyLineNumber({ isIncrementBlankLine: false, initialValue: 'One', });
            break;

          case `CopyFileLineNumer`:
            insertCopyLineNumber({ isIncrementBlankLine: true, initialValue: 'LineNumber', });
            break;

          default:
            new Error(`extensionMain`);
        }
      });

    });

  };

  context.subscriptions.push(vscode.commands.registerCommand(
    `InsertLineNumberAndCopy.InsertStartZero`,
    () => { extensionMain(`InsertStartZero`); }
  ));

  context.subscriptions.push(vscode.commands.registerCommand(
    `InsertLineNumberAndCopy.InsertStartOne`,
    () => { extensionMain(`InsertStartOne`); }
  ));

  context.subscriptions.push(vscode.commands.registerCommand(
    `InsertLineNumberAndCopy.InsertFileLineNumer`,
    () => { extensionMain(`InsertFileLineNumer`); }
  ));

  context.subscriptions.push(vscode.commands.registerCommand(
    `InsertLineNumberAndCopy.CopyStartZero`,
    () => { extensionMain(`CopyStartZero`); }
  ));

  context.subscriptions.push(vscode.commands.registerCommand(
    `InsertLineNumberAndCopy.CopyStartOne`,
    () => { extensionMain(`CopyStartOne`); }
  ));

  context.subscriptions.push(vscode.commands.registerCommand(
    `InsertLineNumberAndCopy.CopyFileLineNumer`,
    () => { extensionMain(`CopyFileLineNumer`); }
  ));
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
