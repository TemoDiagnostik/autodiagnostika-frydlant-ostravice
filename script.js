
function togglePrices() {
  const list = document.getElementById("price-list");
  if (list.style.display === "none") {
    fetch('prices.json')
      .then(response => response.json())
      .then(data => {
        list.innerHTML = "<ul>" + data.map(item =>
          `<li>${item.service}: <strong>${item.price}</strong></li>`
        ).join('') + "</ul>";
        list.style.display = "block";
      });
  } else {
    list.style.display = "none";
  }
}
