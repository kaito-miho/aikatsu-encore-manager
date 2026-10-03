import fs from "fs";

const url =
  "https://dcd.aikatsu.com/encore/cardlist/?search=true&series=629001&display=1&sort=1";

console.log("公式サイトからカード情報を取得しています...");

fetch(url)
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTPエラー: ${response.status}`);
    }

    return response.text();
  })
  .then((html) => {
    const regex =
      /images\/cardlist\/card\/(E1-\d{2}_[A-Z]+)\.webp/g;

    const cards = [];
    let match;

    while ((match = regex.exec(html)) !== null) {
      const cardNumber = match[1];

      if (!cards.some((card) => card.cardNumber === cardNumber)) {
        const rarity = cardNumber.split("_")[1];

        cards.push({
          cardNumber: cardNumber,
          rarity: rarity,
          imageUrl:
            `https://dcd.aikatsu.com/encore/images/cardlist/card/${cardNumber}.webp`,
        });
      }
    }

    fs.writeFileSync(
      "cards.json",
      JSON.stringify(cards, null, 2),
      "utf-8"
    );

    console.log(`カードを ${cards.length} 枚取得しました。`);
    console.log("cards.json を作成しました。");
  })
  .catch((error) => {
    console.error("取得エラー:", error);
  });