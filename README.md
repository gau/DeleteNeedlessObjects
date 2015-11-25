# 不要オブジェクトを削除 ReadMe #

ドキュメント中の不要なオブジェクトを削除するIllustrator用スクリプト（jsx）です。孤立点、空のポイント文字、空のエリア内文字、空のパス上文字、ヘアラインパスを検出できます。

-----

### 更新履歴 ###

* 0.7.4：不透明度0％のオブジェクトに対応
* 0.7.3：へアラインパスの検出を改善
* 0.7.2：へアラインパスの検出を改善
* 0.7.1：シンボルオブジェクトが存在するときに不要なアラートが表示されるのを改善
* 0.7.0：ロック、非表示オブジェクトの削除機能追加／ヘアラインパスに対応
* 0.6.0：削除が正しく行われないのを修正
* 0.5.0：新規作成

-----

### 対応バージョン ###

* Illustrator CS5／CS6／CC／CC2014

-----

### インストール方法 ###

1. 以下の場所に、「不要オブジェクトの削除.jsx」をコピーします。Windows版ではお使いのIllustratorのモードによって保存する場所が異なりますのでご注意ください。
	* 【Mac】/Applications/Adobe Illustrator {バージョン}/Presets/ja_JP/スクリプト/
	* 【Win32】C:\Program Files\Adobe\Adobe Illustrator {バージョン}\Presets\ja_JP\スクリプト\
	* 【Win64】C:\Program Files\Adobe\Adobe Illustrator {バージョン} (64 Bit)\Presets\ja_JP\スクリプト\　または　C:\Program Files (x86)\Adobe\Adobe Illustrator {バージョン}\Presets\ja_JP\スクリプト\
2. Illustratorを再起動します。
3. “ファイル”メニュー→“スクリプト”に“不要オブジェクトの削除”と表示されていればインストール成功です。

-----

### 使い方 ###

1. “ファイル”メニュー→“スクリプト”→“不要オブジェクトの削除”を選択します。
2. 削除したいオブジェクトの種類にチェックを入れます。
3. オプションを設定します。
4. ［実行］をクリックします。

-----

### 削除対象について ###

削除できるオブジェクトは4種類です。それぞれは、以下のような基準で検出されます

| オブジェクト | 説明 |
|:-----------|:------------|
| 孤立点 | アンカーポイントが1つしかないオブジェクト |
| 空のポイント文字 | 文字がまったく入力されていないポイント文字。スペースも文字と見なします |
| 空のエリア内文字 | 文字がまったく入力されていないエリア内文字。スペースも文字と見なします |
| 空のパス上文字 | 文字がまったく入力されていないパス上文字。スペースも文字と見なします |
| 不透明度0％のオブジェクト | 不透明度が0％に設定されたオブジェクト。塗りのみ、線のみの不透明度は対象外です |
| ヘアラインパス | 線幅がなく、塗りだけの直線パス（詳しくは「 [ヘアラインパスについて](#aboutHairline) 」の項を参照）） |

-----

### オプションについて ###

| オプション | 説明 |
|:-----------|:------------|
| 削除せずに選択する | 対象オブジェクトを選択した状態にします。いきなり削除したくないときや、対応オブジェクトを確認したいときに有効です |
| ロック、非表示オブジェクトも対象にする | ロック、非表示になっているオブジェクトも強制的に対象にします。ロック、非表示にされたレイヤー上のオブジェクトも対象となります |
| 実行後に報告メッセージを表示する | 削除、または選択を実行したあとに、対象オブジェクトの数を報告します |

-----

### ロック、非表示オブジェクトも対象にする ###

［削除せずに選択する］と［ロック、非表示オブジェクトも対象にする］を両方選択したときは、対象オブジェクトとそれらが属するレイヤーのロック、非表示が強制的に解除されます。この組み合わせの際は、実行前に警告を表示します

-----

### <a name="aboutHairline"></a>ヘアラインパスについて ###

ヘアラインパスとは、線の設定がない塗りのみの直線パスで、印刷事故につながる要素のひとつです。本スクリプトでは、塗りのみの直線パスのうち、セグメントの角度がすべて同一のものをヘアラインパスとして検出します。また、2つ以上のアンカーポイントをもち、それらすべてが方向線を持たず同一座標で重なっているパスも、ヘアラインパスとして検出します。

-----

### ヘアラインパスの検出精度 ###

ヘアラインパスは、各セグメントの角度から直線かどうかを判断します。直線とみなす角度の精度は、スクリプトの中の25行目あたりにある「HAIRLINE_ACCURACY」の値で変更できます。数が大きくなるほどシビアになり、わずかなゆがみでもヘアラインパスと判断します。初期値は800です。

-----

### カスタマイズ ###

各チェックボックスの初期選択状態を変更したいときは、スクリプト中の12行目〜あたりにある「settings」の内容を変更します。オンの場合は「true」、オフの場合は「false」に変更してください。

| キー | デフォルト値 | 項目 |
|:-----------|:------------|:------------|:------------|
| flagPathItem | true | 削除の対象：孤立点 |
| flagPointText | true | 削除の対象：空のポイント文字 |
| flagAreaText | false | 削除の対象：空のエリア内文字 |
| flagPathText | false | 削除の対象：空のパス上文字 |
| flagTransparent | false | 削除の対象：不透明度0％のオブジェクト |
| flagHairline | false | 削除の対象：ヘアラインパス |
| notDelete | false | オプション：削除せずに選択する |
| delLockObject | false | オプション：ロック、非表示オブジェクトも対象にする |
| showAlert | true | オプション：実行後に報告メッセージを表示する |

-----

### その他 ###

* シンボルやパターンなど、通常と異なる要素の中にあるオブジェクトは、スクリプト側から取得できないため対象となりません。
* ヘアラインパスは、塗りあり、線なしのオブジェクトを対象としています。塗り、線ともに設定されていない透明のパスはアラインパスとして検出しません。
* グループ化されている場合も、対象オブジェクトを個別に検出します。

-----

### 免責事項 ###

* このスクリプトを使って起こったいかなる現象についても制作者は責任を負えません。すべて自己責任にてお使いください。
* 一応CS5、CS6、CS6、CC、CC2014、CC2015で動作の確認はしましたが、OSのバージョンやその他の状況によって実行できないことがあるかもしれません。もし動かなかったらごめんなさい。

-----

### ライセンス ###

* 不要オブジェクトを削除.jsx
* Copyright (c) 2014 - 2015 Toshiyuki Takahashi
* Released under the MIT license
* [http://opensource.org/licenses/mit-license.php](http://opensource.org/licenses/mit-license.php)
* Created by Toshiyuki Takahashi ([Graphic Arts Unit](http://www.graphicartsunit.com/))
* [Twitter](https://twitter.com/gautt)