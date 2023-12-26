
if (!!window.SharedWorker) {
  try {
    const scriptURL = new URL('../bundle.js', import.meta.url);
    scriptURL.search = '';
    const worker = new SharedWorker(scriptURL.toString(), 'sharedWorker');
    worker.port.start();


    worker.port.postMessage({ baseUrl: window.location.origin });

    worker.port.onmessage = function (e) {
      if (e.data.type === 'connected') {
        console.log('Connected tabs:', e.data.count);
      } else {
        console.log('Message received from worker:', e.data);
      }
    };

  } catch (error) {
    console.log("error", error);
  }
} else {
  console.log('Your browser does not support Shared Workers.');
}
