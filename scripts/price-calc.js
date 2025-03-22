const itens = document.querySelectorAll(".container");

const produtos = {
  empada: 4,
  acai: 14,
};

const returnCurrency = (value) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function buttonBehavior(event, container) {
  atualizaItem(event.target.parentElement, event);
  atualizaTotalItem(container);
  atualizaTotal();
}

function atualizaItem(controle, botao) {
  const input = controle.querySelector(".controle-contador");
  const inputValue = parseInt(input.value) || 0;

  if (botao.target.innerText === "-" && inputValue > 0) {
    input.value = inputValue - 1;
  } else if (botao.target.innerText === "+") {
    input.value = inputValue + 1;
  } else if (botao.target.classList.contains("controle-contador")) {
    input.value = Math.max(0, parseInt(input.value) || 0);
  }
}

function atualizaTotalItem(container) {
  const controles = container.querySelectorAll(".controle");
  let totalValue = 0;

  controles.forEach((controle) => {
    const quantidade = parseInt(controle.querySelector("input").value) || 0;
    totalValue += quantidade * produtos[controle.dataset.produto];
  });

  container.querySelector("[data-estatistica]").innerText =
    returnCurrency(totalValue);
}

export function atualizaTotal() {
  const valoresItens = document.querySelectorAll(".container .valor-total");
  let caixaTotal = 0;

  valoresItens.forEach((element) => {
    const valor =
      parseFloat(element.innerText.replace(/[^\d,]/g, "").replace(",", ".")) ||
      0;
    caixaTotal += valor;
  });

  document.querySelector(".caixa-valor").innerText = returnCurrency(caixaTotal);

  // Salva os dados após atualizar o total
  if (typeof window !== "undefined" && window.salvarDados) {
    window.salvarDados();
  }
}
