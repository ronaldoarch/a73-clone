// Stub - página dinâmica
function createDynamicOnlinePage(map) {
  return new Response('<html><body><h1>Offline</h1></body></html>', {
    headers: { 'Content-Type': 'text/html' }
  });
}
