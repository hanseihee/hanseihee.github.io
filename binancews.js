function connectBinanceWS() {
  var url = "wss://stream.binance.com:9443/ws";
  let list = getCoinNames("KRW", "toArray");

  console.log("connectBinanceWS()\n" + list);
  for (var i = 0; i < list.length; i++) {
    let ticker =
      "/" + list[i].replace("KRW-", "").toLowerCase() + "usdt@miniTicker";
    console.log(ticker);
    url = url + ticker;
  }

  const socket = new WebSocket(url);
  socket.addEventListener("open", function (event) {});
  socket.addEventListener("message", function (event) {
    if (event.data instanceof Blob) {
      reader = new FileReader();
      reader.onload = () => {
        const obj = JSON.parse(reader.result);
      };
      reader.readAsText(event.data);
    } else {
      const obj = JSON.parse(event.data);
      updateKimpCell(obj);
    }
  });
}

function updateKimpCell(obj) {
  let price = obj.c * 1298;
  var row = document.getElementById(obj.s.replace("USDT", ""));
  let binancePrice = obj.c * 1298.0;

  cells = row.getElementsByTagName("td");
  let upbitPrice = cells[1].innerText.replace(/,/gi, "");
  let kimp =
    (((upbitPrice - binancePrice) / upbitPrice) * 100).toFixed(2) + "%";

  cells[3].innerText = kimp;
}
