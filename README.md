# VSCode extension - Insert Line Number And Copy (deprecated)

[![Version][version-badge]][marketplace]
[![Ratings][ratings-badge]][marketplace-ratings]
[![Installs][installs-badge]][marketplace]
[![License][license-badge]][license]

This extension inserts line numbers and copies them to the clipboard.

## Information

This extension is deprecated.

Please use the following extension. It is upwardly compatible and more feature-rich.

- vscode-line-number  
https://marketplace.visualstudio.com/items?itemName=SatoshiYamamoto.vscode-line-number  

## Install

Search for "Insert Line Number And Copy" in the Marketplace  
https://marketplace.visualstudio.com/vscode

or here  
https://marketplace.visualstudio.com/items?itemName=SatoshiYamamoto.vscode-insert-line-number-and-copy

## Usage

Following commands are available:

- `Insert Line Number And Copy | Insert | start 0`
- `Insert Line Number And Copy | Insert | start 1`
- `Insert Line Number And Copy | Insert | start File Line Number`
- `Insert Line Number And Copy | Copy | start 0`
- `Insert Line Number And Copy | Copy | start 1`
- `Insert Line Number And Copy | Copy | start File Line Number Header FilePath`

## License

Released under the [MIT License][license].

[version-badge]: https://vsmarketplacebadge.apphb.com/version/SatoshiYamamoto.vscode-insert-line-number-and-copy.svg
[ratings-badge]: https://vsmarketplacebadge.apphb.com/rating/SatoshiYamamoto.vscode-insert-line-number-and-copy.svg
[installs-badge]: https://vsmarketplacebadge.apphb.com/installs/SatoshiYamamoto.vscode-insert-line-number-and-copy.svg
[license-badge]: https://img.shields.io/github/license/standard-software/vscode-insert-line-number-and-copy.svg

[marketplace]: https://marketplace.visualstudio.com/items?itemName=SatoshiYamamoto.vscode-insert-line-number-and-copy
[marketplace-ratings]: https://marketplace.visualstudio.com/items?itemName=SatoshiYamamoto.vscode-insert-line-number-and-copy#review-details
[license]: https://github.com/standard-software/vscode-insert-line-number-and-copy/blob/master/LICENSE

## Version

### 1.1.2
2022/01/24(Mon)
- update (deprecated)

### 1.1.1
2021/12/02(Thu)
- update README

### 1.1.0
2021/11/28(Sun)
- Change the clipboard implementation
  - Discard clipboardy
  - use vscode.env.clipboard.writeTex

### 1.0.0
2021/10/13(Wed)
- publish
