var coinListArr = [];
window.onload = function () {
  getCoinList();
};

function refreshTable() {
  addMoreRows("리플", "400", "+2.1%");
}

function addMoreRows(name, lastPrice, change, rowid) {
  var tbodyRef = document.getElementById("tbl_coin");

  var table = document.getElementById("tbl_coin");
  var row = table.insertRow();
  row.id = rowid.replace("KRW-", "");

  var cell1 = row.insertCell(0);
  var cell2 = row.insertCell(1);
  var cell3 = row.insertCell(2);
  var cell3 = row.insertCell(3);

  cell1.innerHTML = name;
  cell2.innerHTML = lastPrice;
  cell3.innerHTML = change;
}

function getCoinList() {
  var xmlHttp = new XMLHttpRequest();

  xmlHttp.onreadystatechange = function () {
    if (this.status == 200 && this.readyState == this.DONE) {
      const obj = JSON.parse(xmlHttp.responseText);
      for (let i = 0; i < obj.length; i++) {
        if (obj[i].market.includes("KRW-")) {
          let item = obj[i];
          addMoreRows(item.korean_name, 0, 0, item.market);
          coinListArr.push(item.market);
        }
      }
      connectWebsocket();
      connectBinanceWS();
    }
  };

  xmlHttp.open("GET", "https://api.upbit.com/v1/market/all", true);
  xmlHttp.send();
}

function connectWebsocket() {
  const socket = new WebSocket("wss://api.upbit.com/websocket/v1");

  socket.addEventListener("open", function (event) {
    let json = [{ ticket: "test" }, { type: "ticker", codes: coinListArr }];
    socket.send(JSON.stringify(json));
  });

  socket.addEventListener("message", function (event) {
    if (event.data instanceof Blob) {
      reader = new FileReader();

      reader.onload = () => {
        const obj = JSON.parse(reader.result);
        updateCell(obj);
      };

      reader.readAsText(event.data);
    } else {
      console.log("Result: " + event.data);
    }
  });
}

function updateCell(obj) {
  if (null != obj) {
    var row = document.getElementById(obj.code.replace("KRW-", ""));
    cells = row.getElementsByTagName("td");

    let change =
      ((obj.trade_price - obj.prev_closing_price) / obj.trade_price) * 100;
    cells[1].innerText = obj.trade_price;
    cells[2].innerText = change.toFixed(2) + "%";
    if (change < 0) {
      cells[2].style.color = "blue";
    } else {
      cells[2].style.color = "red";
    }
  }
}
