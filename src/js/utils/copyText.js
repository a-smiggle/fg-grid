Fancy.copyText = (text) => {
  // Get global and document objects safely
  const globalObj = (() => {
    if (typeof globalThis !== 'undefined') return globalThis;
    if (typeof window !== 'undefined') return window;
    if (typeof global !== 'undefined') return global;
    if (typeof self !== 'undefined') return self;
    return {};
  })();
  
  const documentObj = globalObj.document;
  
  if(globalObj.navigator?.clipboard){
    globalObj.navigator.clipboard.writeText(text)
      .catch(err => console.error('FG-Grid: Error copying: ', err));
  } else if(documentObj) {
    const textarea = documentObj.createElement('textarea');
    textarea.value = text;
    documentObj.body?.appendChild(textarea);
    textarea.select?.();
    documentObj.execCommand?.('copy');
    documentObj.body?.removeChild(textarea);
  }
};
