# Controle de Vazamentos: site público

Formulário diário de inspeção que **qualquer pessoa abre pelo link, sem login**.
As respostas vão para uma **Planilha Google** sua, e o próprio site tem a aba **Compilar**,
com resumo do período e exportação para Excel/CSV e PDF.

Arquivos:
- `index.html`: o site (um arquivo só)
- `Code.gs`: o "servidor" grátis que grava na Planilha Google

---

## Passo 1: criar a planilha e o servidor (5 min)

1. Acesse sheets.google.com e crie uma planilha em branco (ex.: "Inspeções de Vazamento").
2. Menu **Extensões → Apps Script**.
3. Apague o conteúdo do editor, cole **todo** o `Code.gs` e salve (ícone de disquete).
4. Clique em **Implantar → Nova implantação**.
   - Engrenagem → tipo **App da Web**
   - **Executar como:** Eu
   - **Quem pode acessar:** **Qualquer pessoa**
5. Clique em **Implantar** e autorize (o Google mostra "app não verificado": clique em
   *Avançado → Acessar*; o script é seu e só mexe nesta planilha).
6. Copie a **URL do app da Web** (termina em `/exec`).

## Passo 2: ligar o site à planilha

Abra o `index.html` num editor de texto e, no topo, cole a URL:

```js
window.CONFIG = {
  API_URL: "https://script.google.com/macros/s/XXXXXXXX/exec",
  CHAVE: ""
};
```

## Passo 3: publicar o site (grátis, escolha um)

- **Netlify Drop (mais fácil):** acesse app.netlify.com/drop e arraste a pasta com o
  `index.html`. Você recebe um link na hora (crie uma conta grátis para o link não expirar).
- **GitHub Pages:** crie um repositório, envie o `index.html` e ative
  *Settings → Pages → Branch: main*.
- **Google Sites / intranet da empresa:** qualquer hospedagem de arquivo HTML estático serve.

Compartilhe o link (ou um QR Code dele colado nos equipamentos). No celular, use
"Adicionar à tela inicial" para abrir como app.

---

## Como funciona no dia a dia

- **Nova inspeção:** preencha e envie. "Marcar pendentes como C" agiliza; itens NC pedem
  descrição. O rascunho fica salvo no aparelho se a página fechar.
- **Sem internet no campo?** A inspeção fica guardada no celular (aviso amarelo) e é
  enviada sozinha quando a conexão voltar.
- **Histórico:** todas as inspeções da equipe, com filtro por equipamento e "Só com NC".
- **Compilar:** escolha o período (Hoje, 7 dias, 30 dias, Este mês, Tudo, ou datas), o equipamento,
  o turno ou uma busca por inspetor/local/TAG. Mostra os totais, os itens com mais NC e os equipamentos
  bloqueados. Botões:
  - *Planilha de inspeções*: uma linha por inspeção (.csv, abre no Excel)
  - *Planilha de itens*: uma linha por item respondido, ideal para tabela dinâmica
  - *Imprimir / salvar PDF*: relatório pronto
- **Na Planilha Google**, a aba `Inspecoes` tem uma linha por inspeção e a aba `Itens` uma
  linha por item. A última coluna (JSON) é usada pelo site: não edite.

## Observações

- **Sem a URL configurada**, o site funciona em *modo local*: os dados ficam só naquele
  aparelho (bom para testar).
- **Segurança:** quem tem o link pode enviar e ver o histórico. Para dificultar abusos, defina uma
  `CHAVE` igual no `Code.gs` e no `index.html` (é uma barreira simples, não uma senha forte).
- **Mudou o `Code.gs`?** Use *Implantar → Gerenciar implantações → editar → Nova versão*
  para manter a mesma URL.
- **Para editar os itens do checklist**, altere as listas `GERAL` e `EQUIP` no `index.html`.
