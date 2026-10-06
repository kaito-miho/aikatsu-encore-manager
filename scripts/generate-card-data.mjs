import fs from "node:fs";
import path from "node:path";
import XLSX from "xlsx";

const inputFile = "card_master.xlsx";
const outputDir = "src/data";
const outputFile = path.join(
  outputDir,
  "cardMaster.generated.js"
);

if (!fs.existsSync(inputFile)) {
  throw new Error(
    `Excelファイルが見つかりません: ${inputFile}`
  );
}

const workbook = XLSX.readFile(inputFile);

if (!workbook.SheetNames.includes("Cards")) {
  throw new Error(
    `Cardsシートが見つかりません。
現在のシート: ${workbook.SheetNames.join(", ")}`
  );
}

const sheet = workbook.Sheets["Cards"];

const rows = XLSX.utils.sheet_to_json(sheet, {
  defval: "",
});

const requiredColumns = [
  "カード番号",
  "カード名",
  "レアリティ",
  "シリーズ",
  "コーデ名",
  "タイプ",
  "ブランド",
  "カテゴリ",
  "画像URL",
  "出典URL",
  "メモ",
];

const missingColumns = requiredColumns.filter(
  (column) =>
    !Object.prototype.hasOwnProperty.call(
      rows[0] || {},
      column
    )
);

if (missingColumns.length > 0) {
  throw new Error(
    `Excelに必要な列がありません: ${missingColumns.join(", ")}`
  );
}

const cards = rows
  .filter((row) => row["カード番号"])
  .map((row) => {
    const cardNumber = String(
      row["カード番号"] || ""
    ).trim();

    const cardName = String(
      row["カード名"] || ""
    ).trim();

    const rarity = String(
      row["レアリティ"] || ""
    ).trim();

    const series = String(
      row["シリーズ"] || ""
    ).trim();

    const coordName = String(
      row["コーデ名"] || ""
    ).trim();

    const coordType = String(
      row["タイプ"] || ""
    ).trim();

    const brand = String(
      row["ブランド"] || ""
    ).trim();

    const category = String(
      row["カテゴリ"] || ""
    ).trim();

    const imageUrl = String(
      row["画像URL"] || ""
    ).trim();

    const sourceUrl = String(
      row["出典URL"] || ""
    ).trim();

    const memo = String(
      row["メモ"] || ""
    ).trim();

    return {
      id: `official-${cardNumber}`,
      cardNumber,
      cardName,
      name: cardName,
      rarity,
      series,
      coordName,
      coordType,
      brand:
        brand === "No Brand"
          ? ""
          : brand,
      category,
      itemType:
        category || "トップス",
      type:
        category || "トップス",
      imageUrl,
      image: imageUrl,
      sourceUrl,
      memo,
      quantity: 0,
    };
  });

const coordMap = new Map();

for (const card of cards) {
  if (!card.coordName) {
    continue;
  }

  if (!coordMap.has(card.coordName)) {
    const coordId =
      card.coordName ===
      "オーロラキスコーデ"
        ? "aurora-kiss"
        : `official-${card.cardNumber}`;

    coordMap.set(card.coordName, {
      id: coordId,
      name: card.coordName,
      coordType:
        card.coordType || "キュート",
      series:
        card.series || "",
      brand:
        card.brand || "",
      official: true,
      items: [],
    });
  }

  coordMap.get(card.coordName).items.push({
    type:
      card.category || "トップス",
    name:
      card.cardName,
    image:
      card.imageUrl,
    cardNumber:
      card.cardNumber,
    rarity:
      card.rarity,
  });
}

const officialCoords =
  Array.from(coordMap.values());

fs.mkdirSync(outputDir, {
  recursive: true,
});

const fileContents = `// このファイルは card_master.xlsx から自動生成されます。
// 直接編集せず、ExcelのCardsシートを編集してください。

export const cardMaster = ${JSON.stringify(
  cards,
  null,
  2
)};

export const officialCoords = ${JSON.stringify(
  officialCoords,
  null,
  2
)};
`;

fs.writeFileSync(
  outputFile,
  fileContents,
  "utf-8"
);

console.log(
  `カードデータ生成完了: ${cards.length}枚`
);

console.log(
  `公式コーデ生成完了: ${officialCoords.length}件`
);

