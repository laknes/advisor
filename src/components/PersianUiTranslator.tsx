'use client';

import { useEffect } from 'react';
import { translateFaUiText } from '@/lib/format';

const excludedTags = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE']);

function translateTextNode(node: Text) {
  const parent = node.parentElement;
  if (!parent || excludedTags.has(parent.tagName) || parent.closest('[data-no-translate]')) return;

  const translated = translateFaUiText(node.nodeValue || '');
  if (translated !== node.nodeValue) node.nodeValue = translated;
}

export function PersianUiTranslator({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return;

    const translateTree = (root: Node) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        translateTextNode(node as Text);
        node = walker.nextNode();
      }
    };

    translateTree(document.body);
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => translateTree(node)));
    });
    observer.observe(document.body, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, [enabled]);

  return null;
}
