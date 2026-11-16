/**
 * Backend do formulário "Controle de Vazamentos" — Google Apps Script.
 * Cole este arquivo em: Planilha Google > Extensões > Apps Script.
 * Depois: Implantar > Nova implantação > App da Web
 *   Executar como: Eu  |  Quem pode acessar: Qualquer pessoa
 */

// Opcional: uma senha simples. Se preencher, coloque o mesmo valor em CONFIG.CHAVE no index.html.
const CHAVE = "";

const ABA_INSP = "Inspecoes";
const ABA_ITENS = "Itens";
const CAB_INSP = ["ID", "Registrado em", "Data", "Turno", "Inspetor", "Local", "Equipamento", "TAG",
  "Horímetro", "Liberado", "Total NC", "Itens NC", "Observações", "JSON (não editar)"];
const CAB_ITENS = ["ID inspeção", "Data", "Turno", "Inspetor", "Local", "Equipamento", "TAG",
  "Código", "Item", "Resposta", "Descrição do problema", "Ação imediata"];

function aba_(nome, cab) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(nome);
  if (!sh) sh = ss.insertSheet(nome);
  if (sh.getLastRow() === 0) {
    sh.appendRow(cab);
    sh.getRange(1, 1, 1, cab.length).setFontWeight("bold").setBackground("#1f6b4f").setFontColor("#ffffff");
    sh.setFrozenRows(1);
    sh.getRange("A:Z").setNumberFormat("@"); // tudo como texto (preserva zeros em TAG, datas ISO etc.)
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function txt_(v, max) { return String(v == null ? "" : v).slice(0, max || 2000); }

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const body = JSON.parse(e.postData.contents);
    if (CHAVE && body.chave !== CHAVE) return json_({ ok: false, erro: "chave inválida" });
    const d = body.doc;
    if (!d || !d.id || !d.equipamento || !Array.isArray(d.itens)) return json_({ ok: false, erro: "dados inválidos" });

    lock.waitLock(15000);
    const shI = aba_(ABA_INSP, CAB_INSP);
    const shT = aba_(ABA_ITENS, CAB_ITENS);

    // evita duplicar se o aparelho reenviar a mesma inspeção
    if (shI.getRange("A:A").createTextFinder(txt_(d.id, 64)).matchEntireCell(true).findNext()) {
      return json_({ ok: true, duplicado: true });
    }

    const itens = d.itens.slice(0, 60).map(function (i) {
      return { codigo: txt_(i.codigo, 10), texto: txt_(i.texto, 300), resposta: txt_(i.resposta, 3),
               descricao: txt_(i.descricao), acao: txt_(i.acao) };
    });
    const doc = {
      id: txt_(d.id, 64), data: txt_(d.data, 10), turno: txt_(d.turno, 10), inspetor: txt_(d.inspetor, 120),
      local: txt_(d.local, 200), equipamento: txt_(d.equipamento, 20), equipamentoNome: txt_(d.equipamentoNome, 80),
      tag: txt_(d.tag, 60), horimetro: txt_(d.horimetro, 20), liberado: txt_(d.liberado, 3),
      observacoes: txt_(d.observacoes), totalNC: itens.filter(function (i) { return i.resposta === "NC"; }).length,
      itens: itens, criadoEm: txt_(d.criadoEm, 30) || new Date().toISOString()
    };
    const ncs = itens.filter(function (i) { return i.resposta === "NC"; })
      .map(function (i) { return i.codigo + " " + i.texto + (i.descricao ? " — " + i.descricao : ""); }).join(" | ");

    shI.appendRow([doc.id, doc.criadoEm, doc.data, doc.turno, doc.inspetor, doc.local, doc.equipamentoNome,
      doc.tag, doc.horimetro, doc.liberado, doc.totalNC, ncs, doc.observacoes, JSON.stringify(doc)]);
    const linhas = itens.map(function (i) {
      return [doc.id, doc.data, doc.turno, doc.inspetor, doc.local, doc.equipamentoNome, doc.tag,
        i.codigo, i.texto, i.resposta, i.descricao, i.acao];
    });
    if (linhas.length) shT.getRange(shT.getLastRow() + 1, 1, linhas.length, CAB_ITENS.length).setValues(linhas);
    return json_({ ok: true, id: doc.id });
  } catch (err) {
    return json_({ ok: false, erro: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (CHAVE && p.chave !== CHAVE) return json_({ ok: false, erro: "chave inválida" });
  const sh = aba_(ABA_INSP, CAB_INSP);
  const n = sh.getLastRow() - 1;
  if (n <= 0) return json_({ ok: true, rows: [] });
  const max = 2000; // últimas 2000 inspeções
  const ini = Math.max(2, sh.getLastRow() - max + 1);
  const col = CAB_INSP.length;
  const vals = sh.getRange(ini, col, sh.getLastRow() - ini + 1, 1).getValues();
  const rows = [];
  vals.forEach(function (v) { try { if (v[0]) rows.push(JSON.parse(v[0])); } catch (x) {} });
  return json_({ ok: true, rows: rows });
}
