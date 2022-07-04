function connectBinanceWS() {
  console.log(coinListArr);

  var url = "wss://stream.binance.com:9443/ws";
  for (var i = 0; i < coinListArr.length; i++) {
    let ticker =
      "/" +
      coinListArr[i].replace("KRW-", "").toLowerCase() +
      "usdt@miniTicker";

    url = url + ticker;
  }

  const socket = new WebSocket(url);
  socket.addEventListener("open", function (event) {});
  socket.addEventListener("message", function (event) {
    if (event.data instanceof Blob) {
      reader = new FileReader();
      reader.onload = () => {
        const obj = JSON.parse(reader.result);
        console.log(obj);
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
  let upbitPrice = cells[1].innerText;
  console.log(binancePrice);
  let kimp =
    (((upbitPrice - binancePrice) / upbitPrice) * 100).toFixed(2) + "%";

  cells[3].innerText = kimp;
}
