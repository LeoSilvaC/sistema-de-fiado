import { buttonBehavior, atualizaTotal } from "./price-calc.js";

let register, botaoAdicionar, input;

const STORAGE_KEY = "controleDespesas";
const PRODUTOS = {
  acai: { preco: 14 },
  empada: { preco: 4 },
};

function calcularTotalItem(produtos) {
  let total = 0;
  for (const [produto, quantidade] of Object.entries(produtos)) {
    total += quantidade * (PRODUTOS[produto]?.preco || 0);
  }
  return total;
}

// Funções para gerenciar o localStorage
function salvarDados() {
  const containers = document.querySelectorAll(".container");
  const dados = Array.from(containers).map((container) => {
    const nome = container.querySelector(".nome-pessoa").textContent;
    const produtos = {};
    container.querySelectorAll(".controle").forEach((controle) => {
      const produtoNome = controle.dataset.produto;
      const quantidade =
        parseInt(controle.querySelector(".controle-contador").value) || 0;
      produtos[produtoNome] = quantidade;
    });
    const total = calcularTotalItem(produtos);

    return { nome, produtos, total };
  });

  // Salvar os dados das pessoas e produtos no localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
  // Salvar também a lista de produtos (PRODUTOS) no localStorage
  localStorage.setItem("produtos", JSON.stringify(PRODUTOS));

  atualizaTotal();
}

function carregarDados() {
  const dados = localStorage.getItem(STORAGE_KEY);
  const produtosSalvos = localStorage.getItem("produtos");

  if (produtosSalvos) {
    // Carregar a lista de produtos salvos
    Object.assign(PRODUTOS, JSON.parse(produtosSalvos));
  }

  if (dados) {
    const elementoPai = document.querySelector(".container-pessoas");
    elementoPai.innerHTML = "";

    JSON.parse(dados).forEach((item) => {
      const container = createContainer(item.nome, item.produtos);
      elementoPai.appendChild(container);
    });
    atualizaTotal();
  }
}

function returnCurrency(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function createProdutoHTML(nome, preco, quantidade = 0) {
  return `
    <div class="produto-item">
      <label class="nome">${nome} (R$ ${preco},00)</label>
      <div class="controle" data-produto="${nome}">
        <button class="controle-botao">-</button>
        <input
          type="text"
          class="controle-contador"
          value="${quantidade}"
          data-contador
        />
        <button class="controle-botao">+</button>
        <button class="remover-produto">🗑️</button>
      </div>
    </div>
  `;
}

function createContainer(name, produtos = {}) {
  const container = document.createElement("div");
  container.classList.add("container");

  function handleButtonBehavior(event) {
    buttonBehavior(event, container);
    atualizaTotalPessoa(container);
    salvarDados();
  }

  let produtosHTML = "";
  for (const [nome, quantidade] of Object.entries(produtos)) {
    if (PRODUTOS[nome]) {
      produtosHTML += createProdutoHTML(nome, PRODUTOS[nome].preco, quantidade);
    }
  }

  container.innerHTML = `<div class="pessoa">
    <p class="nome-pessoa">${name}</p>
    <div class="acoes">
      <button class="remove-button">Remover Pessoa</button>
      <button class="add-produto-button">+ Produto</button>
    </div>
    <div class="novo-produto" style="display: none;">
      <input type="text" class="nome-produto" placeholder="Nome do produto">
      <input type="number" class="preco-produto" placeholder="Preço">
      <button class="confirmar-produto">Adicionar</button>
      <button class="cancelar-produto">Cancelar</button>
    </div>
    <div class="produtos-container">
      ${produtosHTML}
    </div>
    <p class="texto-total">Total</p>
    <p class="valor-total" data-estatistica>${returnCurrency(
      calcularTotalItem(produtos)
    )}</p>
  </div>`;

  // Adicionar produto
  const btnAddProduto = container.querySelector(".add-produto-button");
  const novoProdutoDiv = container.querySelector(".novo-produto");
  const btnConfirmarProduto = container.querySelector(".confirmar-produto");
  const btnCancelarProduto = container.querySelector(".cancelar-produto");

  btnAddProduto.addEventListener("click", () => {
    novoProdutoDiv.style.display = "flex";
  });

  btnCancelarProduto.addEventListener("click", () => {
    novoProdutoDiv.style.display = "none";
    novoProdutoDiv.querySelector(".nome-produto").value = "";
    novoProdutoDiv.querySelector(".preco-produto").value = "";
  });

  btnConfirmarProduto.addEventListener("click", () => {
    const nomeProduto = novoProdutoDiv
      .querySelector(".nome-produto")
      .value.trim()
      .toLowerCase();
    const precoProduto = parseFloat(
      novoProdutoDiv.querySelector(".preco-produto").value
    );

    if (!nomeProduto || !precoProduto) {
      alert("Preencha todos os campos!");
      return;
    }

    // Adicionar o novo produto ao objeto PRODUTOS
    PRODUTOS[nomeProduto] = { preco: precoProduto };

    const produtosContainer = container.querySelector(".produtos-container");
    const novoProdutoHTML = createProdutoHTML(nomeProduto, precoProduto, 0);
    produtosContainer.insertAdjacentHTML("beforeend", novoProdutoHTML);

    // Adicionar eventos aos novos botões
    const novoProdutoElement = produtosContainer.lastElementChild;
    const botoesNovoProduto =
      novoProdutoElement.querySelectorAll(".controle-botao");
    botoesNovoProduto.forEach((botao) => {
      botao.addEventListener("click", handleButtonBehavior);
    });

    const inputNovoProduto =
      novoProdutoElement.querySelector(".controle-contador");
    inputNovoProduto.addEventListener("change", () => {
      handleButtonBehavior({ target: inputNovoProduto });
    });

    const btnRemoverProduto =
      novoProdutoElement.querySelector(".remover-produto");
    btnRemoverProduto.addEventListener("click", () => {
      novoProdutoElement.remove();
      atualizaTotalPessoa(container);
      salvarDados();
    });

    novoProdutoDiv.style.display = "none";
    novoProdutoDiv.querySelector(".nome-produto").value = "";
    novoProdutoDiv.querySelector(".preco-produto").value = "";

    atualizaTotalPessoa(container);
    salvarDados();
  });

  // Eventos para botões existentes
  const botoes = container.querySelectorAll(".controle-botao");
  botoes.forEach((botao) => {
    botao.addEventListener("click", handleButtonBehavior);
  });

  const inputs = container.querySelectorAll(".controle-contador");
  inputs.forEach((input) => {
    input.addEventListener("change", () => {
      handleButtonBehavior({ target: input });
    });
  });

  // Remover produtos individuais
  const botoesRemoverProduto = container.querySelectorAll(".remover-produto");
  botoesRemoverProduto.forEach((botao) => {
    botao.addEventListener("click", () => {
      botao.closest(".produto-item").remove();
      atualizaTotalPessoa(container);
      salvarDados();
    });
  });

  const botaoRemover = container.querySelector(".remove-button");
  botaoRemover.addEventListener("click", () => {
    container.remove();
    atualizaTotal();
    salvarDados();
  });

  return container;
}

function atualizaTotalPessoa(container) {
  const produtos = {};
  container.querySelectorAll(".controle").forEach((controle) => {
    const produtoNome = controle.dataset.produto;
    const quantidade =
      parseInt(controle.querySelector(".controle-contador").value) || 0;
    produtos[produtoNome] = quantidade;
  });

  const total = calcularTotalItem(produtos);
  container.querySelector("[data-estatistica]").innerText =
    returnCurrency(total);
}

function submit(e) {
  if (e) {
    e.preventDefault();
  }

  if (input.value.length == 0) {
    window.alert("Você precisa inserir um nome");
    return;
  }

  const elementoPai = document.querySelector(".container-pessoas");
  elementoPai.appendChild(createContainer(input.value));
  input.value = "";
  salvarDados();
}

// Inicialização quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
  register = document.querySelector(".container-registro");
  botaoAdicionar = register.querySelector(".botao-adicionar");
  input = document.querySelector(".form-input");

  botaoAdicionar.addEventListener("click", submit);

  input.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      submit(e);
    }
  });

  // Implementação da pesquisa
  const pesquisaInput = document.getElementById("pesquisa-input");
  const botaoPesquisar = document.querySelector(".botao-pesquisar");

  function realizarPesquisa() {
    const termoPesquisa = pesquisaInput.value.toLowerCase().trim();
    const pessoas = document.querySelectorAll(".pessoa");

    pessoas.forEach((pessoa) => {
      const nomePessoa = pessoa
        .querySelector(".nome-pessoa")
        .textContent.toLowerCase();
      const containerPessoa = pessoa.closest(".container");

      if (nomePessoa.includes(termoPesquisa)) {
        containerPessoa.style.display = "block";
      } else {
        containerPessoa.style.display = "none";
      }
    });
  }

  pesquisaInput.addEventListener("input", realizarPesquisa);
  botaoPesquisar.addEventListener("click", realizarPesquisa);

  pesquisaInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      realizarPesquisa();
    }
  });

  carregarDados();
});
