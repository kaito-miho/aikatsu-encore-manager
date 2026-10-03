import "./App.css";
import { coords } from "./data/coords";
import { useEffect, useState } from "react";

const officialCards = `${import.meta.env.BASE_URL}cards.json`;

const COORD_TYPES = [
  "キュート",
  "クール",
  "ポップ",
  "セクシー",
];

const ITEM_TYPES = [
  "トップス",
  "ボトムス",
  "シューズ",
  "アクセサリー",
  "ワンピース",
  "フルコーデ",
];

const OLD_ITEM_TYPES = [
  "トップス",
  "ボトムス",
  "シューズ",
  "アクセサリー",
];

function App() {
  // =========================
  // 画面
  // =========================

  const [selectedCoord, setSelectedCoord] =
    useState(null);

  const [showCardForm, setShowCardForm] =
    useState(false);

  const [showCardList, setShowCardList] =
    useState(false);
  
  const [selectedImage, setSelectedImage] =
    useState(null);

  // =========================
  // コーデ
  // =========================

  const [coordList, setCoordList] = useState(() => {
    const saved = localStorage.getItem(
      "aikatsu-coords"
    );

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        return parsed.map((coord) => ({
          ...coord,
          coordType:
            coord.coordType || "キュート",
          series:
            coord.series || "",
        }));
      } catch (error) {
        console.error(
          "コーデデータの読み込みに失敗しました",
          error
        );
      }
    }

    return coords.map((coord) => ({
      ...coord,
      coordType:
        coord.coordType || "キュート",
      series:
        coord.series || "",
    }));
  });

  const [editingCoordId, setEditingCoordId] =
    useState(null);

  const [editingCoordName, setEditingCoordName] =
    useState("");

  const [editingCoordType, setEditingCoordType] =
    useState("キュート");

  const [editingCoordSeries, setEditingCoordSeries] =
    useState("");

  // =========================
  // カード
  // =========================

  const [cards, setCards] = useState(() => {
    const saved = localStorage.getItem(
      "aikatsu-cards"
    );

    if (!saved) {
      return [];
    }

    try {
      const parsed = JSON.parse(saved);

      return parsed.map((card) => ({
        ...card,

        // 以前の「type」をそのまま利用
        itemType:
          card.itemType ||
          card.type ||
          "トップス",

        // 以前のカードに保有枚数がなければ
        // 所持状態から1枚として扱う
        quantity:
          typeof card.quantity === "number"
            ? card.quantity
            : 0,
      }));
    } catch (error) {
      console.error(
        "カードデータの読み込みに失敗しました",
        error
      );

      return [];
    }
  });

  // =========================
  // 旧・所持データ
  // =========================

  const [ownedCards, setOwnedCards] =
    useState(() => {
      const saved = localStorage.getItem(
        "aikatsu-owned-cards"
      );

      if (!saved) {
        return {};
      }

      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    });

  // =========================
  // 編集中カード
  // =========================

  const [editingCardId, setEditingCardId] =
    useState(null);

  // =========================
  // 公式カード
  // =========================

  const [officialCardList, setOfficialCardList] =
    useState([]);

  const [selectedOfficialCard, setSelectedOfficialCard] =
    useState("");

  const [cardNumber, setCardNumber] =
    useState("");

  const [rarity, setRarity] =
    useState("");

  const [itemType, setItemType] =
    useState("トップス");

  const [brand, setBrand] =
    useState("");

  const [cardName, setCardName] =
    useState("");

  const [image, setImage] =
    useState("");

  // =========================
  // コーデ設定
  // =========================

  const [coordName, setCoordName] =
    useState("");

  const [coordType, setCoordType] =
    useState("キュート");

  const [coordSeries, setCoordSeries] =
    useState("");

  // =========================
  // フィルター
  // =========================

  const [filterType, setFilterType] =
    useState("すべて");

  const [filterSeries, setFilterSeries] =
    useState("すべて");

  const [filterBrand, setFilterBrand] =
    useState("すべて");
  
  const [filterRarity, setFilterRarity] =
  useState("すべて");

  // =========================
  // 公式カード読み込み
  // =========================

  useEffect(() => {
    fetch(officialCards)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `カード情報の取得に失敗しました: ${response.status}`
          );
        }

        return response.json();
      })
      .then((data) => {
        setOfficialCardList(data);

        console.log(
          "公式カード枚数:",
          data.length
        );
      })
      .catch((error) => {
        console.error(
          "カード取得エラー:",
          error
        );
      });
  }, []);

  // =========================
  // localStorage保存
  // =========================

  useEffect(() => {
    localStorage.setItem(
      "aikatsu-cards",
      JSON.stringify(cards)
    );
  }, [cards]);

  useEffect(() => {
    localStorage.setItem(
      "aikatsu-owned-cards",
      JSON.stringify(ownedCards)
    );
  }, [ownedCards]);

  useEffect(() => {
    localStorage.setItem(
      "aikatsu-coords",
      JSON.stringify(coordList)
    );
  }, [coordList]);

  // =========================
  // カード保有枚数
  // =========================

  const getCardQuantity = (card) => {
    // 新しい方式
    if (typeof card.quantity === "number") {
      return card.quantity;
    }

    // 古い方式との互換
    const oldOwned = ownedCards[card.id];

    if (typeof oldOwned === "number") {
      return oldOwned;
    }

    if (oldOwned === true) {
      return 1;
    }

    return 0;
  };

  // =========================
  // 保有枚数変更
  // =========================

  const changeCardQuantity = (
    cardId,
    amount
  ) => {
    setCards((prev) =>
      prev.map((card) => {
        if (card.id !== cardId) {
          return card;
        }

        const currentQuantity =
          getCardQuantity(card);

        const newQuantity = Math.max(
          0,
          currentQuantity + amount
        );

        return {
          ...card,
          quantity: newQuantity,
        };
      })
    );
  };

  // =========================
  // 直接枚数指定
  // =========================

  const setCardQuantity = (
    cardId,
    value
  ) => {
    const numberValue =
      Number(value);

    if (
      Number.isNaN(numberValue) ||
      numberValue < 0
    ) {
      return;
    }

    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId
          ? {
              ...card,
              quantity:
                Math.floor(
                  numberValue
                ),
            }
          : card
      )
    );
  };

  // =========================
  // 旧データ用
  // =========================

  const toggleOwned = (
    coordId,
    itemType
  ) => {
    const key = `${coordId}-${itemType}`;

    setOwnedCards((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // =========================
  // フォーム初期化
  // =========================

  const resetCardForm = () => {
    setEditingCardId(null);

    setSelectedOfficialCard("");

    setCardNumber("");

    setRarity("");

    setItemType("トップス");

    setBrand("");

    setCardName("");

    setImage("");

    setCoordName("");

    setCoordType("キュート");

    setCoordSeries("");
  };

  const openNewCardForm = () => {
    resetCardForm();

    setShowCardList(false);

    setShowCardForm(true);
  };

  // =========================
  // カード編集
  // =========================

  const handleEditCard = (card) => {
    setEditingCardId(card.id);

    setSelectedOfficialCard(
      card.cardNumber
    );

    setCardNumber(
      card.cardNumber
    );

    setRarity(card.rarity);

    setItemType(
      card.itemType ||
        card.type ||
        "トップス"
    );

    setBrand(card.brand || "");

    setCardName(card.name || "");

    setImage(card.image || "");

    const currentCoord =
      coordList.find(
        (coord) =>
          coord.id === card.coordId
      );

    if (currentCoord) {
      setCoordName(
        currentCoord.name
      );

      setCoordType(
        currentCoord.coordType ||
          "キュート"
      );

      setCoordSeries(
        currentCoord.series || ""
      );
    } else {
      setCoordName("");

      setCoordType("キュート");

      setCoordSeries("");
    }

    setShowCardList(false);

    setShowCardForm(true);
  };

  // =========================
  // 公式カード選択
  // =========================

  const handleOfficialCardChange = (
    event
  ) => {
    const selectedNumber =
      event.target.value;

    setSelectedOfficialCard(
      selectedNumber
    );

    if (!selectedNumber) {
      setCardNumber("");

      setRarity("");

      setImage("");

      return;
    }

    const selectedCard =
      officialCardList.find(
        (card) =>
          card.cardNumber ===
          selectedNumber
      );

    if (!selectedCard) {
      return;
    }

    setCardNumber(
      selectedCard.cardNumber
    );

    setRarity(
      selectedCard.rarity
    );

    setImage(
      selectedCard.imageUrl
    );
  };

  // =========================
  // カード保存
  // =========================

  const handleSaveCard = () => {
    if (!selectedOfficialCard) {
      alert(
        "公式カードを選択してください。"
      );
      return;
    }

    if (!cardName.trim()) {
      alert(
        "カード名を入力してください。"
      );
      return;
    }

    

    if (!coordSeries) {
      alert(
        "シリーズを入力してください。"
      );
      return;
    }

    const trimmedCoordName =
      coordName.trim();

    let targetCoord =
      coordList.find(
        (coord) =>
          coord.name ===
          trimmedCoordName
      );

    // =========================
    // 新しいコーデ
    // =========================

    if (!targetCoord) {
      targetCoord = {
        id: `coord-${Date.now()}`,
        name: trimmedCoordName,
        coordType,
        series: coordSeries,
        items: [],
      };

      setCoordList((prev) => [
        ...prev,
        targetCoord,
      ]);
    } else {
      // =========================
      // 既存コーデ
      // =========================

      const updatedCoord = {
        ...targetCoord,
        coordType,
        series: coordSeries,
      };

      targetCoord =
        updatedCoord;

      setCoordList((prev) =>
        prev.map((coord) =>
          coord.id ===
          targetCoord.id
            ? updatedCoord
            : coord
        )
      );
    }

    // =========================
    // カード更新
    // =========================

    if (editingCardId !== null) {
      setCards((prev) =>
        prev.map((card) =>
          card.id === editingCardId
            ? {
                ...card,
                cardNumber,
                rarity,
                itemType,
                // 旧typeも残して互換性確保
                type: itemType,
                brand:
                  brand.trim(),
                name:
                  cardName.trim(),
                image,
                coordId:
                  targetCoord.id,

                // 既存の保有枚数は維持
                quantity:
                  getCardQuantity(
                    card
                  ),
              }
            : card
        )
      );

      alert(
        "カードを更新しました！"
      );
    }

    // =========================
    // 新規カード
    // =========================

    else {
      const newCard = {
        id: Date.now(),

        cardNumber,

        rarity,

        itemType,

        // 互換用
        type: itemType,

        brand:
          brand.trim(),

        name:
          cardName.trim(),

        image,

        coordId:
          targetCoord.id,

        // 新規カードは0枚
        quantity: 0,
      };

      setCards((prev) => [
        ...prev,
        newCard,
      ]);

      alert(
        "カードを登録しました！"
      );
    }

    resetCardForm();

    setShowCardForm(false);
  };

  // =========================
  // カード削除
  // =========================

  const handleDeleteCard = (
    cardId
  ) => {
    const targetCard =
      cards.find(
        (card) =>
          card.id === cardId
      );

    if (!targetCard) {
      return;
    }

    const confirmed =
      window.confirm(
        `「${targetCard.cardNumber} ${targetCard.name}」を削除しますか？`
      );

    if (!confirmed) {
      return;
    }

    setCards((prev) =>
      prev.filter(
        (card) =>
          card.id !== cardId
      )
    );

    setOwnedCards((prev) => {
      const newOwnedCards = {
        ...prev,
      };

      delete newOwnedCards[
        cardId
      ];

      return newOwnedCards;
    });

    alert(
      "カードを削除しました。"
    );
  };

  // =========================
  // 全データリセット
  // =========================

  const handleResetData = () => {
    const confirmed =
      window.confirm(
        "登録したカードと所持情報をすべて削除します。\n\nこの操作は元に戻せません。よろしいですか？"
      );

    if (!confirmed) {
      return;
    }

    setCards([]);

    setOwnedCards({});

    localStorage.removeItem(
      "aikatsu-cards"
    );

    localStorage.removeItem(
      "aikatsu-owned-cards"
    );

    alert(
      "カードの登録データをリセットしました。"
    );
  };

  // =========================
  // コーデ編集
  // =========================

  const handleEditCoord = (
    coord
  ) => {
    setEditingCoordId(coord.id);

    setEditingCoordName(
      coord.name
    );

    setEditingCoordType(
      coord.coordType ||
        "キュート"
    );

    setEditingCoordSeries(
      coord.series || ""
    );
  };

  const handleSaveCoord = () => {
    if (!editingCoordName.trim()) {
      alert(
        "コーデ名を入力してください。"
      );
      return;
    }

    if (!editingCoordSeries) {
      alert(
        "シリーズを入力してください。"
      );
      return;
    }

    const newName =
      editingCoordName.trim();

    setCoordList((prev) =>
      prev.map((coord) =>
        coord.id ===
        editingCoordId
          ? {
              ...coord,
              name: newName,
              coordType:
                editingCoordType,
              series:
                editingCoordSeries,
            }
          : coord
      )
    );

    if (
      selectedCoord &&
      selectedCoord.id ===
        editingCoordId
    ) {
      setSelectedCoord(
        (prev) => ({
          ...prev,
          name: newName,
          coordType:
            editingCoordType,
          series:
            editingCoordSeries,
        })
      );
    }

    setEditingCoordId(null);

    setEditingCoordName("");

    setEditingCoordType(
      "キュート"
    );

    setEditingCoordSeries("");

    alert(
      "コーデ情報を変更しました！"
    );
  };

  const handleCancelCoordEdit =
    () => {
      setEditingCoordId(null);

      setEditingCoordName("");

      setEditingCoordType(
        "キュート"
      );

      setEditingCoordSeries("");
    };

  // =========================
  // コーデのカード取得
  // =========================

  const getCardsForCoord = (
    coordId
  ) => {
    return cards.filter(
      (card) =>
        card.coordId === coordId
    );
  };

  // =========================
  // コーデに含まれる種類
  // =========================

  const getCoordItemTypes = (
    coord
  ) => {
    const coordCards =
      getCardsForCoord(
        coord.id
      );

    const registeredTypes =
      coordCards
        .map(
          (card) =>
            card.itemType ||
            card.type ||
            "トップス"
        );

    const staticTypes =
      (coord.items || [])
        .map(
          (item) =>
            item.type
        );

    const allTypes = [
      ...registeredTypes,
      ...staticTypes,
    ];

    // 登録順を保ちながら重複削除
    return [
      ...new Set(allTypes),
    ];
  };

  // =========================
  // 種類ごとのカード
  // =========================

  const getCardsForItemType = (
    coord,
    itemType
  ) => {
    return cards.filter(
      (card) =>
        card.coordId ===
          coord.id &&
        (card.itemType ||
          card.type) ===
          itemType
    );
  };

  // =========================
  // コーデの総保有数
  // =========================

  const getCoordOwnedCount = (
    coord
  ) => {
    const coordCards =
      getCardsForCoord(
        coord.id
      );

    // 登録済みカードがある場合
    if (coordCards.length > 0) {
      return coordCards.reduce(
        (total, card) =>
          total +
          getCardQuantity(card),
        0
      );
    }

    // 旧形式のコーデ
    const itemTypes =
      getCoordItemTypes(
        coord
      );

    return itemTypes.filter(
      (itemType) => {
        const key = `${coord.id}-${itemType}`;

        return !!ownedCards[key];
      }
    ).length;
  };

  // =========================
  // コーデの必要カード数
  // =========================

  const getCoordRequiredCount = (
    coord
  ) => {
    const coordCards =
      getCardsForCoord(
        coord.id
      );

    if (coordCards.length > 0) {
      return coordCards.length;
    }

    return getCoordItemTypes(
      coord
    ).length;
  };

  // =========================
  // カード表示
  // =========================

  const renderRegisteredCard = (
    card
  ) => {
    const quantity =
      getCardQuantity(card);

    return (
      <div
        className={`coord-item ${
          quantity > 0
            ? "is-owned"
            : "not-owned"
        }`}
        key={card.id}
      >
        <div className="coord-item-type">
          {card.itemType ||
            card.type}
        </div>

        <div className="coord-item-image">
          {card.image ? (
            <img
              src={card.image}
              alt={card.name}
              onClick={() =>
               setSelectedImage(card.image)
              }
            />
          ) : (
            <div className="no-image">
              画像なし
            </div>
          )}
        </div>

        <div className="coord-item-info">
          <p className="coord-item-name">
            {card.name}
          </p>

          <p className="coord-item-number">
            {card.cardNumber}
          </p>
        </div>

        <div className="quantity-control">
          <button
            type="button"
            onClick={() =>
              changeCardQuantity(
                card.id,
                -1
              )
            }
            disabled={
              quantity <= 0
            }
          >
            −
          </button>

          <span>
            {quantity}枚
          </span>

          <button
            type="button"
            onClick={() =>
              changeCardQuantity(
                card.id,
                1
              )
            }
          >
            ＋
          </button>
        </div>
      </div>
    );
  };

  // =========================
  // 未登録の旧コーデアイテム
  // =========================

  const renderStaticCoordItem = (
    coord,
    itemType
  ) => {
    const coordItem =
      (coord.items || []).find(
        (item) =>
          item.type ===
          itemType
      );

    if (!coordItem) {
      return null;
    }

    const key = `${coord.id}-${itemType}`;

    const isOwned =
      !!ownedCards[key];

    return (
      <div
        className={`coord-item ${
          isOwned
            ? "is-owned"
            : "not-owned"
        }`}
        key={`${coord.id}-${itemType}`}
      >
        <div className="coord-item-type">
          {itemType}
        </div>

        <div className="coord-item-image">
          {coordItem.image ? (
            <img
              src={coordItem.image}
              alt={coordItem.name}
            />
          ) : (
            <div className="no-image">
              未登録
            </div>
          )}
        </div>

        <div className="coord-item-info">
          <p className="coord-item-name">
            {coordItem.name ||
              "カード未登録"}
          </p>

          <p className="coord-item-number">
            -
          </p>
        </div>

        <label className="owned-checkbox">
          <input
            type="checkbox"
            checked={isOwned}
            onChange={() =>
              toggleOwned(
                coord.id,
                itemType
              )
            }
          />

          <span>所持</span>
        </label>
      </div>
    );
  };

  // =========================
  // コーデ全体表示
  // =========================

  const renderCoordItems = (
    coord
  ) => {
    const coordCards =
      getCardsForCoord(
        coord.id
      );

    // 登録済みカードがある場合
    if (coordCards.length > 0) {
      return coordCards.map(
        (card) =>
          renderRegisteredCard(
            card
          )
      );
    }

    // まだカード登録していない
    // 旧形式のコーデ
    const itemTypes =
      getCoordItemTypes(
        coord
      );

    return itemTypes.map(
      (itemType) =>
        renderStaticCoordItem(
          coord,
          itemType
        )
    );
  };

  // =========================
  // シリーズ一覧
  // =========================

  const seriesList = [
    ...new Set(
      coordList
        .map(
          (coord) =>
            coord.series
        )
        .filter(
          (series) =>
            series !== ""
        )
    ),
  ].sort(
    (a, b) =>
      Number(a) -
      Number(b)
  );

  // =========================
  // ブランド一覧
  // =========================

  const brandList = [

  ...new Set(

    cards

      .map((card) =>

        card.brand

          ?.trim()

      )

      .filter(Boolean)

  ),

].sort((a, b) =>

  a.localeCompare(

    b,

    "ja"

  )

);

// レアリティ一覧
const rarityList = [
  ...new Set(
    cards
      .map((card) =>
        card.rarity?.trim()
      )
      .filter(Boolean)
  ),
].sort((a, b) => {
  const order = [
    "ER",
    "PR",
    "R",
    "N",
  ];

  return (
    order.indexOf(a) -
    order.indexOf(b)
  );
});

// ブランド未設定用
brandList.push("なし");

  // =========================
  // フィルター
  // =========================

  const filteredCoords =
    coordList.filter(
      (coord) => {
        const typeMatch =
          filterType ===
            "すべて" ||
          coord.coordType ===
            filterType;

        const seriesMatch =
          filterSeries ===
            "すべて" ||
          String(
            coord.series
          ) ===
            String(
              filterSeries
            );

        const brandMatch =

  filterBrand ===

    "すべて" ||

  cards.some(

    (card) => {

      if (

        card.coordId !==

        coord.id

      ) {

        return false;

      }

      const cardBrand =

        card.brand

          ?.trim() ||

        "なし";

      return (

        cardBrand ===

        filterBrand

      );

    }
    

  );
  const rarityMatch =
  filterRarity === "すべて" ||
  cards.some((card) => {
    if (card.coordId !== coord.id) {
      return false;
    }

    return (
      card.rarity?.trim() === filterRarity
    );
  });

        return (
          typeMatch &&
          seriesMatch &&
          brandMatch &&
          rarityMatch
        );
      }
    );

  // =========================
  // JSX
  // =========================

  return (
    <div className="app">
      {/* =========================
          ヘッダー
      ========================= */}

      <header className="header">
        <h1>
          アイカツ！アンコール
        </h1>

        <p>
          カードコレクション管理
        </p>
      </header>

      <main>

        {/* =====================================================
            カード追加・編集
        ===================================================== */}

        {showCardForm && (
          <>
            <button
              className="back-button"
              onClick={() => {
                resetCardForm();

                setShowCardForm(
                  false
                );
              }}
            >
              ← 戻る
            </button>

            <h2 className="section-title">
              {editingCardId !==
              null
                ? "カードを編集"
                : "カードを追加"}
            </h2>

            <div className="card-form">

              {/* 編集カード */}

              <label>
                編集する登録済みカード

                <select
                  value={
                    editingCardId ===
                    null
                      ? ""
                      : String(
                          editingCardId
                        )
                  }
                  onChange={(e) => {
                    const value =
                      e.target.value;

                    if (!value) {
                      resetCardForm();

                      return;
                    }

                    const card =
                      cards.find(
                        (item) =>
                          String(
                            item.id
                          ) ===
                          value
                      );

                    if (card) {
                      handleEditCard(
                        card
                      );
                    }
                  }}
                >
                  <option value="">
                    新しいカードを追加
                  </option>

                  {cards.map(
                    (card) => (
                      <option
                        key={card.id}
                        value={
                          card.id
                        }
                      >
                        {
                          card.cardNumber
                        }
                        {"　"}
                        {card.name}
                      </option>
                    )
                  )}
                </select>
              </label>

              {/* 公式カード */}

              <label>
                公式カードを選択

                <select
                  value={
                    selectedOfficialCard
                  }
                  onChange={
                    handleOfficialCardChange
                  }
                >
                  <option value="">
                    カードを選択してください
                  </option>

                  {officialCardList.map(
                    (card) => (
                      <option
                        key={
                          card.cardNumber
                        }
                        value={
                          card.cardNumber
                        }
                      >
                        {
                          card.cardNumber
                        }
                      </option>
                    )
                  )}
                </select>
              </label>

              {/* カード番号 */}

              <label>
                カード番号

                <input
                  type="text"
                  value={
                    cardNumber
                  }
                  readOnly
                  placeholder="公式カードを選択してください"
                />
              </label>

              {/* カード名 */}

              <label>
                カード名

                <input
                  type="text"
                  value={
                    cardName
                  }
                  onChange={(e) =>
                    setCardName(
                      e.target.value
                    )
                  }
                  placeholder="例：オーロラキスミニショール"
                />
              </label>

              {/* レアリティ */}

              <label>
                レアリティ

                <input
                  type="text"
                  value={
                    rarity
                  }
                  readOnly
                />
              </label>

              {/* =========================
                  アイテム種類
              ========================= */}

              <label>
                アイテムの種類

                <select
                  value={
                    itemType
                  }
                  onChange={(e) =>
                    setItemType(
                      e.target.value
                    )
                  }
                >
                  {ITEM_TYPES.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </label>

              {/* ブランド */}

              <label>
                ブランド

                <input
                  type="text"
                  value={
                    brand
                  }
                  onChange={(e) =>
                    setBrand(
                      e.target.value
                    )
                  }
                  placeholder="例：エンジェリーシュガー"
                />
              </label>

              {/* コーデ名 */}

              <label>
                コーデ名

                <input
                  type="text"
                  value={
                    coordName
                  }
                  onChange={(e) =>
                    setCoordName(
                      e.target.value
                    )
                  }
                  placeholder="例：オーロラキスコーデ"
                />

                <span
                  style={{
                    fontSize:
                      "12px",
                    fontWeight:
                      "normal",
                    color:
                      "#888",
                  }}
                >
                  新しいコーデ名を入力すると、自動でコーデが作成されます。
                </span>
              </label>

              {/* タイプ */}

              <label>
                コーデタイプ

                <select
                  value={
                    coordType
                  }
                  onChange={(e) =>
                    setCoordType(
                      e.target.value
                    )
                  }
                >
                  {COORD_TYPES.map(
                    (
                      typeItem
                    ) => (
                      <option
                        key={
                          typeItem
                        }
                        value={
                          typeItem
                        }
                      >
                        {typeItem}
                      </option>
                    )
                  )}
                </select>
              </label>

              {/* シリーズ */}

              <label>
                シリーズ

                <input
                  type="number"
                  min="1"
                  value={
                    coordSeries
                  }
                  onChange={(e) =>
                    setCoordSeries(
                      e.target.value
                    )
                  }
                  placeholder="例：1"
                />

                <span
                  style={{
                    fontSize:
                      "12px",
                    fontWeight:
                      "normal",
                    color:
                      "#888",
                  }}
                >
                  数字で入力してください。
                </span>
              </label>

              {/* カード画像 */}

              <div className="card-preview">
                <p>
                  カード画像
                </p>

                {image ? (
                  <img
                    src={image}
                    alt={
                      cardNumber
                    }
                  />
                ) : (
                  <div>
                    カードを選択してください
                  </div>
                )}
              </div>

              {/* 保存 */}

              <button
                className="register-button"
                onClick={
                  handleSaveCard
                }
              >
                {editingCardId !==
                null
                  ? "変更を保存する"
                  : "カードを登録する"}
              </button>

              {editingCardId !==
                null && (
                <button
                  className="back-button"
                  onClick={
                    openNewCardForm
                  }
                >
                  新しいカードを追加する
                </button>
              )}
            </div>
          </>
        )}

        {/* =====================================================
            カード一覧
        ===================================================== */}

        {showCardList &&
          !showCardForm && (
            <>
              <button
                className="back-button"
                onClick={() =>
                  setShowCardList(
                    false
                  )
                }
              >
                ← 戻る
              </button>

              <h2 className="section-title">
                カード一覧
              </h2>

              {cards.length ===
              0 ? (
                <p>
                  まだカードが登録されていません。
                </p>
              ) : (
                <div className="registered-card-list">
                  {cards.map(
                    (card) => {
                      const cardCoord =
                        coordList.find(
                          (coord) =>
                            coord.id ===
                            card.coordId
                        );

                      const quantity =
                        getCardQuantity(
                          card
                        );

                      return (
                        <div
                          className="registered-card"
                          key={
                            card.id
                          }
                        >
                          <div className="registered-card-image">
                            {card.image ? (
                              <img
                                src={
                                  card.image
                                }
                                alt={
                                  card.name
                                }
                              />
                            ) : (
                              <div>
                                画像なし
                              </div>
                            )}
                          </div>

                          <div className="registered-card-info">
                            <p className="registered-card-number">
                              {
                                card.cardNumber
                              }
                            </p>

                            <h3>
                              {
                                card.name
                              }
                            </h3>

                            <p>
                              {
                                card.rarity
                              }
                            </p>

                            <p>
                              種類：
                              {
                                card.itemType ||
                                card.type
                              }
                            </p>

                            <p>
                              ブランド：
                              {card.brand ||
                                "未設定"}
                            </p>

                            <p>
                              コーデ：
                              {cardCoord
                                ? cardCoord.name
                                : "未設定"}
                            </p>

                            {cardCoord && (
                              <p>
                                タイプ：
                                {
                                  cardCoord.coordType
                                }
                                {"　"}
                                第
                                {
                                  cardCoord.series
                                }
                                弾
                              </p>
                            )}

                            {/* 保有枚数 */}

                            <div className="quantity-control">
                              <button
                                type="button"
                                onClick={() =>
                                  changeCardQuantity(
                                    card.id,
                                    -1
                                  )
                                }
                                disabled={
                                  quantity <=
                                  0
                                }
                              >
                                −
                              </button>

                              <span>
                                {quantity}枚
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  changeCardQuantity(
                                    card.id,
                                    1
                                  )
                                }
                              >
                                ＋
                              </button>
                            </div>

                            <button
                              className="edit-button"
                              onClick={() =>
                                handleEditCard(
                                  card
                                )
                              }
                            >
                              編集
                            </button>

                            <button
                              className="delete-button"
                              onClick={() =>
                                handleDeleteCard(
                                  card.id
                                )
                              }
                            >
                              削除
                            </button>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </>
          )}

        {/* =====================================================
            メイン画面
        ===================================================== */}

        {!selectedCoord &&
          !showCardForm &&
          !showCardList && (
            <>
              <div className="top-buttons">
                <button
                  className="add-card-button"
                  onClick={
                    openNewCardForm
                  }
                >
                  ＋ カードを追加・編集
                </button>

                <button
                  className="card-list-button"
                  onClick={() =>
                    setShowCardList(
                      true
                    )
                  }
                >
                  カード一覧
                </button>
              </div>

              <h2 className="section-title">
                コーデ一覧
              </h2>

              <div className="card-count">
  入手カード：
  {cards.reduce(
    (total, card) =>
      total +
      (typeof card.quantity === "number"
        ? card.quantity
        : 0),
    0
  )}
  枚 / {cards.length}枚
</div>

              {/* =========================
                  フィルター
              ========================= */}

              <div className="coord-filters">

                {/* タイプ */}

                <div className="filter-group">
                  <span className="filter-label">
                    タイプ
                  </span>

                  <div className="filter-buttons">
                    <button
                      className={
                        filterType ===
                        "すべて"
                          ? "filter-button active"
                          : "filter-button"
                      }
                      onClick={() =>
                        setFilterType(
                          "すべて"
                        )
                      }
                    >
                      すべて
                    </button>

                    {COORD_TYPES.map(
                      (
                        typeItem
                      ) => (
                        <button
                          key={
                            typeItem
                          }
                          className={
                            filterType ===
                            typeItem
                              ? "filter-button active"
                              : "filter-button"
                          }
                          onClick={() =>
                            setFilterType(
                              typeItem
                            )
                          }
                        >
                          {
                            typeItem
                          }
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* シリーズ */}

                <div className="filter-group">
                  <span className="filter-label">
                    シリーズ
                  </span>

                  <div className="filter-buttons">
                    <button
                      className={
                        filterSeries ===
                        "すべて"
                          ? "filter-button active"
                          : "filter-button"
                      }
                      onClick={() =>
                        setFilterSeries(
                          "すべて"
                        )
                      }
                    >
                      すべて
                    </button>

                    {seriesList.map(
                      (series) => (
                        <button
                          key={series}
                          className={
                            String(
                              filterSeries
                            ) ===
                            String(
                              series
                            )
                              ? "filter-button active"
                              : "filter-button"
                          }
                          onClick={() =>
                            setFilterSeries(
                              series
                            )
                          }
                        >
                          第
                          {series}
                          弾
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* ブランド */}

                <div className="filter-group">
                  <span className="filter-label">
                    ブランド
                  </span>

                  <div className="filter-buttons">
                    <button
                      className={
                        filterBrand ===
                        "すべて"
                          ? "filter-button active"
                          : "filter-button"
                      }
                      onClick={() =>
                        setFilterBrand(
                          "すべて"
                        )
                      }
                    >
                      すべて
                    </button>

                    {brandList.map(
                      (brandItem) => (
                        <button
                          key={
                            brandItem
                          }
                          className={
                            filterBrand ===
                            brandItem
                              ? "filter-button active"
                              : "filter-button"
                          }
                          onClick={() =>
                            setFilterBrand(
                              brandItem
                            )
                          }
                        >
                          {
                            brandItem
                          }
                        </button>
                      )
                    )}
                  </div>
                </div>
              {/* レアリティ */}

<div className="filter-group">
  <span className="filter-label">
    レアリティ
  </span>

  <div className="filter-buttons">
    <button
      className={
        filterRarity === "すべて"
          ? "filter-button active"
          : "filter-button"
      }
      onClick={() =>
        setFilterRarity("すべて")
      }
    >
      すべて
    </button>

    {rarityList.map(
      (rarityItem) => (
        <button
          key={rarityItem}
          className={
            filterRarity === rarityItem
              ? "filter-button active"
              : "filter-button"
          }
          onClick={() =>
            setFilterRarity(
              rarityItem
            )
          }
        >
          {rarityItem}
        </button>
      )
    )}
  </div>
</div>
</div>

              {/* =========================
                  コーデ一覧
              ========================= */}

              <div className="coord-list">
                {filteredCoords.length ===
                0 ? (
                  <p className="no-results">
                    条件に一致するコーデがありません。
                  </p>
                ) : (
                  filteredCoords.map(
                    (coord) => {
                      const ownedCount =
                        getCoordOwnedCount(
                          coord
                        );

                      const requiredCount =
                        getCoordRequiredCount(
                          coord
                        );

                      return (
                        <section
                          className="coord-row"
                          key={
                            coord.id
                          }
                        >
                          {/* コーデヘッダー */}

                          <div className="coord-row-header">
                            <div>
                              {editingCoordId ===
                              coord.id ? (
                                <div className="coord-edit-form">

                                  <input
                                    type="text"
                                    value={
                                      editingCoordName
                                    }
                                    onChange={(
                                      e
                                    ) =>
                                      setEditingCoordName(
                                        e.target
                                          .value
                                      )
                                    }
                                  />

                                  <select
                                    value={
                                      editingCoordType
                                    }
                                    onChange={(
                                      e
                                    ) =>
                                      setEditingCoordType(
                                        e.target
                                          .value
                                      )
                                    }
                                  >
                                    {COORD_TYPES.map(
                                      (
                                        typeItem
                                      ) => (
                                        <option
                                          key={
                                            typeItem
                                          }
                                          value={
                                            typeItem
                                          }
                                        >
                                          {
                                            typeItem
                                          }
                                        </option>
                                      )
                                    )}
                                  </select>

                                  <input
                                    type="number"
                                    min="1"
                                    value={
                                      editingCoordSeries
                                    }
                                    onChange={(
                                      e
                                    ) =>
                                      setEditingCoordSeries(
                                        e.target
                                          .value
                                      )
                                    }
                                    placeholder="シリーズ"
                                  />

                                  <div className="coord-edit-actions">
                                    <button
                                      className="edit-button"
                                      onClick={
                                        handleSaveCoord
                                      }
                                    >
                                      保存
                                    </button>

                                    <button
                                      className="delete-button"
                                      onClick={
                                        handleCancelCoordEdit
                                      }
                                    >
                                      キャンセル
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="coord-title-line">
                                    <h3 className="coord-row-title">
                                      {
                                        coord.name
                                      }
                                    </h3>

                                    <span className="coord-type-badge">
                                      {
                                        coord.coordType
                                      }
                                    </span>

                                    <span className="coord-series-badge">
                                      第
                                      {
                                        coord.series
                                      }
                                      弾
                                    </span>
                                  </div>

                                  <button
                                    className="coord-edit-button"
                                    onClick={() =>
                                      handleEditCoord(
                                        coord
                                      )
                                    }
                                  >
                                    コーデ情報を編集
                                  </button>
                                </>
                              )}
                            </div>

                            <div className="coord-progress">
                              {
                                ownedCount
                              }
                              {" / "}
                              {
                                requiredCount
                              }
                              {" 所持"}
                            </div>
                          </div>

                          {/* カード */}

                          <div className="coord-items-row">
                            {renderCoordItems(
                              coord
                            )}
                          </div>
                        </section>
                      );
                    }
                  )
                )}
              </div>
            </>
          )}

        {/* =====================================================
            コーデ詳細
        ===================================================== */}

        {selectedCoord &&
          !showCardForm &&
          !showCardList && (
            <>
              <button
                className="back-button"
                onClick={() =>
                  setSelectedCoord(
                    null
                  )
                }
              >
                ← コーデ一覧に戻る
              </button>

              <h2 className="section-title">
                {
                  selectedCoord.name
                }
              </h2>

              <div className="item-grid">
                {cards
                  .filter(
                    (card) =>
                      card.coordId ===
                      selectedCoord.id
                  )
                  .map((card) => {
                    const quantity =
                      getCardQuantity(
                        card
                      );

                    return (
                      <div
                        className={`item-card ${
                          quantity > 0
                            ? "is-owned"
                            : "not-owned"
                        }`}
                        key={
                          card.id
                        }
                      >
                        <div className="item-type">
                          {
                            card.itemType ||
                            card.type
                          }
                        </div>

                        <div className="item-image">
                          {card.image ? (
                            <img
                              src={
                                card.image
                              }
                              alt={
                                card.name
                              }
                            />
                          ) : (
                            <div>
                              画像なし
                            </div>
                          )}
                        </div>

                        <p className="item-name">
                          {
                            card.name
                          }
                        </p>

                        <p>
                          {
                            card.cardNumber
                          }
                        </p>

                        <div className="quantity-control">
                          <button
                            type="button"
                            onClick={() =>
                              changeCardQuantity(
                                card.id,
                                -1
                              )
                            }
                            disabled={
                              quantity <=
                              0
                            }
                          >
                            −
                          </button>

                          <span>
                            {quantity}枚
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              changeCardQuantity(
                                card.id,
                                1
                              )
                            }
                          >
                            ＋
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </>
          )}
      </main>
  {selectedImage && (
    <div
      className="image-modal"
      onClick={() => setSelectedImage(null)}
    >
      <div
        className="image-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="image-modal-close"
          onClick={() => setSelectedImage(null)}
        >
          ×
        </button>

        <img
          src={selectedImage}
          alt="カード拡大画像"
        />
      </div>
    </div>
  )}
  </div>
);
}

export default App;
