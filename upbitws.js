var marketAll;
var upbitCoin;

window.onload = function () {
  getCoinList();
};

function getCoinList() {
  // 코인리스트
  var xmlHttp = new XMLHttpRequest();

  xmlHttp.onreadystatechange = function () {
    if (this.status == 200 && this.readyState == this.DONE) {
      marketAll = JSON.parse(xmlHttp.responseText);
      getCoinNames("KRW");
      //       [0 … 99]
      // 0:
      // english_name: "Bitcoin"
      // korean_name: "비트코인"
      // market: "KRW-BTC"

      for (let i = 0; i < marketAll.length; i++) {
        if (marketAll[i].market.includes("KRW-")) {
          let item = marketAll[i];
          addMoreRows(item.korean_name, 0, 0, item.market);
        }
      }
      getTicker();
      connectWebsocket();
      connectBinanceWS();

      var cells = document.querySelectorAll("#tbl_coin td");
      for (var i = 0; i < cells.length; i++) {
        cells[i].addEventListener("click", function () {
          setFavorites(this.parentElement.id);
        });
      }
    }
  };

  xmlHttp.open("GET", "https://api.upbit.com/v1/market/all", true);
  xmlHttp.send();
}

function getTicker() {
  // 현재가

  //   [0 … 99]
  // 0:
  // acc_trade_price: 157689511358.8064
  // acc_trade_price_24h: 203643632575.52283
  // acc_trade_volume: 6015.20417411
  // acc_trade_volume_24h: 7771.50842008
  // change: "FALL"
  // change_price: 649000
  // change_rate: 0.0245842646
  // code: "KRW-BTC"
  // high_price: 26750000
  // highest_52_week_date: "2021-11-09"
  // highest_52_week_price: 82700000
  // low_price: 25580000
  // lowest_52_week_date: "2022-06-19"
  // lowest_52_week_price: 23800000
  // market: "KRW-BTC"
  // opening_price: 26399000
  // prev_closing_price: 26399000
  // signed_change_price: -649000
  // signed_change_rate: -0.0245842646
  // timestamp: 1657034567759
  // trade_date: "20220705"
  // trade_date_kst: "20220706"
  // trade_price: 25750000
  // trade_time: "152247"
  // trade_time_kst: "002247"
  // trade_timestamp: 1657034567000
  // trade_volume: 0.00193767

  var xmlHttp = new XMLHttpRequest();

  xmlHttp.onreadystatechange = function () {
    if (this.status == 200 && this.readyState == this.DONE) {
      const obj = JSON.parse(xmlHttp.responseText);
      // const obj = sortCoin(JSON.parse(xmlHttp.responseText), "");
      for (let i = 0; i < obj.length; i++) {
        obj[i]["code"] = obj[i]["market"];
        updateCell(obj[i]);
      }
    }
  };

  xmlHttp.open(
    "GET",
    "https://api.upbit.com/v1/ticker?markets=" + getCoinNames("KRW"),
    true
  );
  xmlHttp.send();
}

function connectWebsocket() {
  const socket = new WebSocket("wss://api.upbit.com/websocket/v1");
  socket.addEventListener("open", function (event) {
    let json = [
      { ticket: "test" },
      { type: "ticker", codes: getCoinNames("KRW", "toArray") },
    ];
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

function addMoreRows(name, lastPrice, change, rowid) {
  var table = document.getElementById("tbl_coin");
  var row = table.insertRow();
  row.id = rowid.replace("KRW-", "");

  var cell1 = row.insertCell(0);
  var cell2 = row.insertCell(1);
  var cell3 = row.insertCell(2);
  var cell4 = row.insertCell(3);

  cell1.innerHTML = name;
  cell2.innerHTML = lastPrice;
  cell3.innerHTML = change;

  cell2.style.textAlign = "right";
  cell3.style.textAlign = "right";
  cell4.style.textAlign = "right";
}

function updateCell(obj) {
  if (null != obj) {
    var row = document.getElementById(obj.code.replace("KRW-", ""));
    cells = row.getElementsByTagName("td");

    let change =
      ((obj.trade_price - obj.prev_closing_price) / obj.trade_price) * 100;

    cells[1].innerText = obj.trade_price.toLocaleString("ko-KR");
    cells[2].innerText = change.toFixed(2) + "%";
    if (change < 0) {
      cells[2].style.color = "blue";
    } else {
      cells[2].style.color = "red";
    }
  }
}

function sortCoin(obj, type) {
  //ADA
  // console.log(upbitCoin);
  var sorted = obj.sort(function (a, b) {
    return b.trade_price - a.trade_price;
  }); // Sort youngest first

  return sorted;
}

function getCoinNames(type, returnType) {
  // console.log(marketAll);
  var coinNames = [];
  for (let i = 0; i < marketAll.length; i++) {
    if (type == "KRW" && marketAll[i].market.includes("KRW-")) {
      coinNames.push(marketAll[i].market);
    }
  }

  console.log("getCoinNames()\n" + coinNames);
  if (returnType == "toArray") {
    return coinNames;
  }
  return coinNames.toString();
}
