// Send
export const updateSendDapp = (data) => {
  (window as any)?.chrome?.runtime?.sendMessage({
    data,
    target: 'kda.background',
    action: 'res_sendKadena',
  });
};

// Connect
export const updateConnectMessage = (result, tabId) => {
  (window as any)?.chrome?.runtime?.sendMessage({
    result,
    target: 'kda.background',
    action: 'res_checkStatus',
    tabId,
  });
};

// Sign cmd
export const updateSignedCmdMessage = (result, tabId) => {
  (window as any)?.chrome?.runtime?.sendMessage({
    result,
    target: 'kda.background',
    action: 'res_requestSign',
    tabId,
  });
};

// QuickSign cmd
export const updateQuickSignedCmdMessage = (result, tabId) => {
  (window as any)?.chrome?.runtime?.sendMessage({
    result,
    target: 'kda.background',
    action: 'res_requestQuickSign',
    tabId,
  });
};

export const initWalletConnect = (uri) => {
  (window as any)?.chrome?.runtime?.sendMessage({
    uri,
    target: 'kda.background',
    action: 'initWalletConnect',
  });
};
