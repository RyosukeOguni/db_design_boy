function onEdit(e) {
  /** スプレッドシート情報を取得 */
  var sheet = e.source.getActiveSheet() // 現在編集中のシートを取得
  var column = e.source.getActiveRange().getColumn() // 編集したカラムを取得

  /** 選択範囲の取得 */
  var rowStart = e.range.rowStart //行の始点を取得
  var rowEnd = e.range.rowEnd //行の終点を取得

  /** セルの値を代入する変数をまとめて宣言 */
  var physics, logic, type, letter, nullable, code

  /** 編集された行(row)分のマイグレーションコード生成を繰返し処理 */
  for (var row = rowStart; row <= rowEnd; row++) {
    /** セルの値を取得 */
    physics = sheet.getRange(row, 1).getValue()
    logic = sheet.getRange(row, 2).getValue()
    type = sheet.getRange(row, 3).getValue()
    letter = sheet.getRange(row, 4).getValue()
    nullable = sheet.getRange(row, 6).getValue()

    /** マイグレーションコードの生成 */
    if (row !== 1 && column !== 5 && column !== 7) { // コード生成に関係ないセルへの入力を除外
      if (physics === "deleted_at") {
        /** 特殊物理名：deleted_at */
        code = "$table->softDeletes()" + (logic && "->comment('" + logic + "');")
      } else if (!!physics && !!type) {
        /** 通常の物理名 */
        switch (type) {
          case "bigint": // MySQLのデータ型
            type = "bigIncrements" // MySQLのデータ型をマイグレーションのコマンドに変換
            break;
          case "varchar":
            type = "string"
            break;
          case "tinyint(1)":
            type = "boolean"
            break;
          default:
            break;
        }
        /** コード文章を生成 */
        code = "$table->" + type + "('" + physics + "'" + (letter && ", " + letter) + ")" +
          (nullable ? "->nullable()" : "") +
          (logic && "->comment('" + logic + "');")
      } else {
        code = ""
      }
      /** コード文章を規定セルにセット */
      sheet.getRange(row, 5).setValue(code)
    }
  }
}