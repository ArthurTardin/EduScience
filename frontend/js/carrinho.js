document.addEventListener("DOMContentLoaded", carregarCarrinho);

async function carregarCarrinho() {
    const listaCarrinho = document.getElementById("lista-carrinho");
    const token = localStorage.getItem("token");

    try {
        const response = await fetch("/api/carrinho", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Erro ao carregar carrinho");
        }

        const produtos = await response.json();

        listaCarrinho.innerHTML = "";

        if (!produtos.length) {
            listaCarrinho.innerHTML = `
                <p class="carrinho-vazio">
                    Seu carrinho está vazio.
                </p>
            `;
            return;
        }

        produtos.forEach(produto => {
            const item = document.createElement("div");

            item.classList.add("produto-carrinho");

            item.innerHTML = `
                <h3>${produto.nome}</h3>
                <p>Preço: R$ ${produto.preco}</p>
                <p>Quantidade: ${produto.quantidade}</p>
            `;

            listaCarrinho.appendChild(item);
        });

    } catch (error) {
        console.error(error);

        listaCarrinho.innerHTML = `
            <p class="erro-carrinho">
                Nao foi possível carregar os produtos do carrinho.
            </p>
        `;
    }
}