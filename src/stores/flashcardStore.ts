// src/stores/flashcardStore.ts

import { create } from 'zustand'; // createを正しくインポート
import { supabase } from '@/lib/supabase'; // supabaseのパスを修正

// Cardの型定義
interface Card {
  id: string;
  front_text: string | null;
  back_text: string | null;
  front_image_url: string | null;
  back_image_url: string | null;
}

// ストアが管理する状態の型
interface FlashcardState {
  deck: Card[];
  currentIndex: number;
  topCard: Card | null;
  middleCard: Card | null;
  bottomCard: Card | null;
  setDeck: (cards: Card[]) => void;
  goToNext: () => void;
  deleteCurrentCard: () => Promise<boolean>;
}

// ストア本体の作成
export const useFlashcardStore = create<FlashcardState>((set, get) => ({
  deck: [],
  currentIndex: 0,
  topCard: null,
  middleCard: null,
  bottomCard: null,

  // デッキのカードをセットし、表示する3枚を更新する
  setDeck: (cards) => {
    set({
      deck: cards,
      currentIndex: 0,
      topCard: null, // 最初のカードは中央に
      middleCard: cards[0] || null,
      bottomCard: cards[1] || null,
    });
  },

  // 次のカードに進む
  goToNext: () => {
    const { deck, currentIndex } = get();
    // 最後のカードより手前の場合のみ進む
    if (currentIndex < deck.length) {
      const nextIndex = currentIndex + 1;
      set({
        currentIndex: nextIndex,
        topCard: deck[currentIndex] || null,
        middleCard: deck[nextIndex] || null,
        bottomCard: deck[nextIndex + 1] || null,
      });
    }
  },

  // 現在のカードを削除する
  deleteCurrentCard: async () => {
    const { deck, currentIndex } = get();
    const cardToDelete = deck[currentIndex];
    if (!cardToDelete) return false;

    const { error } = await supabase.from('flashcards').delete().eq('id', cardToDelete.id);
    if (error) {
      alert(`削除エラー: ${error.message}`);
      return false;
    }

    // データベースから削除成功後、ストアの状態も更新
    const newDeck = deck.filter(card => card.id !== cardToDelete.id);
    // 削除後、インデックスが配列の範囲外にならないように調整
    const newIndex = Math.min(currentIndex, newDeck.length - 1);
    
    set({
      deck: newDeck,
      currentIndex: newIndex,
      // 新しいインデックスに基づいて、表示する3枚のカードを再計算
      topCard: newDeck[newIndex - 1] || null,
      middleCard: newDeck[newIndex] || null,
      bottomCard: newDeck[newIndex + 1] || null,
    });
    return true;
  },
}));