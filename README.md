# USB Game Controller Checker

USBゲームコントローラーの接続確認と動作チェックを行うWebアプリケーションです。

## 機能

- 🎮 USBコントローラーの自動検出
- 🔘 リアルタイムでボタン入力を可視化
- 🕹️ アナログスティックの動作を視覚的に表示
- 🎯 複数のコントローラーを同時サポート
- 📱 レスポンシブデザイン対応

## 使用方法

### 1. リポジトリをクローン

```bash
git clone https://github.com/[your-username]/usb-controller-checker.git
cd usb-controller-checker
```

### 2. ローカルサーバーを起動

Python 3を使用:
```bash
python3 -m http.server 8080
```

または Python 2を使用:
```bash
python -m SimpleHTTPServer 8080
```

Node.jsのhttp-serverを使用:
```bash
npx http-server -p 8080
```

### 3. ブラウザでアクセス

```
http://localhost:8080
```

### 4. コントローラーをテスト

1. USBゲームコントローラーをPCに接続
2. 必要に応じてコントローラーのボタンを押して認識させる
3. ボタンやアナログスティックを操作して動作確認

## 対応ブラウザ

- Chrome (推奨)
- Firefox
- Edge
- Safari (一部制限あり)

## 技術仕様

- **Gamepad API**: W3C標準のGamepad APIを使用
- **更新レート**: 60fps (requestAnimationFrame)
- **検出方式**: イベントベース + ポーリング併用

## トラブルシューティング

### コントローラーが認識されない場合

1. ブラウザがGamepad APIに対応しているか確認
2. コントローラーのドライバが正しくインストールされているか確認
3. 他のアプリケーションがコントローラーを占有していないか確認
4. コントローラーのボタンを押してアクティブ化

### セキュリティ制限

- HTTPS環境では追加の権限が必要な場合があります
- 一部のブラウザではユーザーインタラクション後にのみAPIが有効になります

## ライセンス

MIT License

## 作者

[Your Name]

## 貢献

プルリクエストは歓迎します。大きな変更の場合は、まずissueを作成して変更内容について議論してください。