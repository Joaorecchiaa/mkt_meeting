// ============================================================
// BOARD ACADEMY — MTD Presentation Generator
// index.js — all data processing logic (runs in browser)
// ============================================================

const SCORE_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSvwO3Ag2f2cbkVgR1pJZp6fANQcbualGKlAG50fmOljuEGKZ1gJBbSAjRdO3SomXUEVQOWnTvlfHRd/pub?gid=422517996&single=true&output=csv';

// ---------- CONSTANTS ----------
const PRODS   = ['PFCC - BRASIL', 'PFCC - LATAM', 'PFCC – CHILE', 'LEAN', 'CES'];
const PRODS_3 = ['PFCC - BRASIL', 'LEAN', 'CES'];

const NOME = {
  'PFCC - BRASIL': 'PFCC Brasil',
  'PFCC - LATAM':  'PFCC LATAM',
  'PFCC – CHILE':  'PFCC Chile',
  'LEAN':          'LEAN',
  'CES':           'CES',
};

const SCORE_ORDER = ['De 9 a 10','De 8 a 8,9','De 7 a 7,9','De 6 a 6,9','De 5 a 5,9','De 4 a 4,9','De 3 a 3,9'];

const SLA = {
  'De 9 a 10': 16, 'De 8 a 8,9': 24, 'De 7 a 7,9': 30,
  'De 6 a 6,9': 17, 'De 5 a 5,9': 9, 'De 4 a 4,9': 3, 'De 3 a 3,9': 0,
};

const CARGO_ORDER = [
  'CEO / Presidente','Empresário / Sócio-Fundador','Diretor',
  'Chairman / Board Member / Conselheiro / Advisor','VP / C-Level',
  'Superintendente','Partner / Sócio - serviços profissionais','HEAD',
  'Profissional Liberal','Gerente / Manager / Country Manager / General Manager','Outro'
];

// ============================================================
// SCORE ENGINE — loaded from Google Sheets CSV
// ============================================================
let scoreRules = null; // loaded async

async function loadScoreRules() {
  if (scoreRules) return scoreRules;
  try {
    const res = await fetch(SCORE_CSV_URL);
    const text = await res.text();
    scoreRules = parseScoreCSV(text);
  } catch(e) {
    console.warn('Could not load score CSV, using fallback:', e);
    scoreRules = getFallbackRules();
  }
  return scoreRules;
}

function parseScoreCSV(text) {
  const lines = text.split('\n').slice(1); // skip header
  const rules = { renda: [], cargo: [], escolaridade: [], idade: [] };

  for (const line of lines) {
    const cols = line.split(',');
    if (cols.length < 3) continue;
    const tipo  = (cols[0] || '').trim().toLowerCase();
    const contem = (cols[1] || '').trim();
    const pontuacao = parseFloat((cols[2] || '').trim().replace(',', '.'));

    if (!tipo || !contem || isNaN(pontuacao)) continue;

    const tipo_norm = tipo === 'cargo' ? 'cargo'
      : tipo === 'renda' ? 'renda'
      : tipo === 'escolaridade' ? 'escolaridade'
      : tipo === 'idade' ? 'idade' : null;

    if (tipo_norm && rules[tipo_norm] !== undefined) {
      rules[tipo_norm].push({ contem: contem.toLowerCase(), pontuacao });
    }
  }
  return rules;
}

function getFallbackRules() {
  // Fallback hardcoded from the shared sheet
  return {
    renda: [
      { contem: 'mais_de_50_mil', pontuacao: 3.5 },
      { contem: 'mais de 50 mil', pontuacao: 3.5 },
      { contem: 'mais de r$50.000', pontuacao: 3.5 },
      { contem: 'mais de r$ 50.000', pontuacao: 3.5 },
      { contem: 'más de 200,000 mxn', pontuacao: 3.5 },
      { contem: 'más que 200.000 mxn', pontuacao: 3.5 },
      { contem: 'más que 350k mxn', pontuacao: 3.5 },
      { contem: 'más de 200,000 mxn', pontuacao: 3.5 },
      { contem: 'de r$40.000 a r$50.000', pontuacao: 2.8 },
      { contem: 'de 40 mil e 50 mil', pontuacao: 2.8 },
      { contem: 'de 40 mil a 50 mil', pontuacao: 2.8 },
      { contem: 'entre 40 e 50 mil', pontuacao: 2.8 },
      { contem: 'entre 40 a 50 mil', pontuacao: 2.8 },
      { contem: 'entre_40_e_50_mil', pontuacao: 2.8 },
      { contem: 'de r$30.000 a r$40.000', pontuacao: 3.2 },
      { contem: 'de 30 mil e 40 mil', pontuacao: 3.2 },
      { contem: 'de 30 mil a 40 mil', pontuacao: 3.2 },
      { contem: 'entre 30 e 40 mil', pontuacao: 3.2 },
      { contem: 'entre 30 a 40 mil', pontuacao: 3.2 },
      { contem: 'entre_30_e_40_mil', pontuacao: 3.2 },
      { contem: 'de r$25.000 a r$30.000', pontuacao: 2.5 },
      { contem: 'de 25 mil a 30 mil', pontuacao: 2.5 },
      { contem: 'entre 25 e 30 mil', pontuacao: 2.5 },
      { contem: 'entre_25_e_30_mil', pontuacao: 2.5 },
      { contem: 'de r$20.000 a r$25.000', pontuacao: 2.1 },
      { contem: 'entre 20 e 25 mil', pontuacao: 2.1 },
      { contem: 'entre_20_e_25_mil', pontuacao: 2.1 },
      { contem: 'de r$15.000 a r$20.000', pontuacao: 1.8 },
      { contem: 'entre 15 e 20 mil', pontuacao: 1.8 },
      { contem: 'até 20 mil', pontuacao: 1.8 },
      { contem: 'até_20_mil_', pontuacao: 1.8 },
      { contem: 'de r$15.000 a r$20.000', pontuacao: 1.8 },
      { contem: 'entre_15_e_20_mil', pontuacao: 1.8 },
      { contem: 'de r$10.000 a r$15.000', pontuacao: 1.4 },
      { contem: 'entre 10 e 15 mil', pontuacao: 1.4 },
      { contem: 'entre 10 a 15 mil', pontuacao: 1.4 },
      { contem: 'entre_10_e_15_mil', pontuacao: 1.4 },
      { contem: 'até 10 mil', pontuacao: 1.1 },
      { contem: 'ate 10 mil', pontuacao: 1.1 },
      { contem: 'até r$10.000', pontuacao: 1.1 },
      { contem: 'ate r$10.000', pontuacao: 1.1 },
      { contem: 'até r$ 10 mil', pontuacao: 1.1 },
      { contem: 'até r$ 10.000', pontuacao: 1.1 },
      { contem: 'até 10 mil', pontuacao: 1.1 },
      { contem: 'até r$10.000', pontuacao: 1.1 },
      { contem: 'até_10_mil', pontuacao: 1.1 },
    ],
    cargo: [
      { contem: 'diretor', pontuacao: 3.0 },
      { contem: 'director', pontuacao: 3.0 },
      { contem: 'founder', pontuacao: 2.7 },
      { contem: 'fundador', pontuacao: 2.7 },
      { contem: 'propr', pontuacao: 2.7 },
      { contem: 'socio', pontuacao: 2.7 },
      { contem: 'sócio', pontuacao: 2.7 },
      { contem: 'partner', pontuacao: 2.7 },
      { contem: 'owner', pontuacao: 2.7 },
      { contem: 'empresario', pontuacao: 2.7 },
      { contem: 'empresário', pontuacao: 2.7 },
      { contem: 'ceo', pontuacao: 2.4 },
      { contem: 'president', pontuacao: 2.4 },
      { contem: 'chief', pontuacao: 2.4 },
      { contem: 'consultor', pontuacao: 1.8 },
      { contem: 'consultant', pontuacao: 1.8 },
      { contem: 'profissional liberal', pontuacao: 1.8 },
      { contem: 'vice', pontuacao: 1.5 },
      { contem: 'c-level', pontuacao: 1.5 },
      { contem: 'vp', pontuacao: 1.5 },
      { contem: 'cfo', pontuacao: 1.5 },
      { contem: 'coo', pontuacao: 1.5 },
      { contem: 'cto', pontuacao: 1.5 },
      { contem: 'cmo', pontuacao: 1.5 },
      { contem: 'conselh', pontuacao: 1.2 },
      { contem: 'advisor', pontuacao: 1.2 },
      { contem: 'manager', pontuacao: 0.9 },
      { contem: 'gerente', pontuacao: 0.9 },
      { contem: 'coordenador', pontuacao: 0.9 },
      { contem: 'head', pontuacao: 0.9 },
    ],
    escolaridade: [
      { contem: 'mba', pontuacao: 2.0 },
      { contem: 'pós', pontuacao: 1.8 },
      { contem: 'pos', pontuacao: 1.8 },
      { contem: 'executive program', pontuacao: 1.8 },
      { contem: 'cybersecurity', pontuacao: 1.8 },
      { contem: 'comparative tax', pontuacao: 1.8 },
      { contem: 'architectural imagination', pontuacao: 1.8 },
      { contem: 'mestrado', pontuacao: 1.6 },
      { contem: 'maestr', pontuacao: 1.6 },
      { contem: 'master', pontuacao: 1.6 },
      { contem: 'doutor', pontuacao: 1.4 },
      { contem: 'doctor', pontuacao: 1.4 },
      { contem: 'ph.', pontuacao: 1.4 },
      { contem: 'phd', pontuacao: 1.4 },
      { contem: 'superior', pontuacao: 1.2 },
      { contem: 'graduação', pontuacao: 1.2 },
      { contem: 'graduacao', pontuacao: 1.2 },
      { contem: 'gradruação', pontuacao: 1.2 },
      { contem: 'degree', pontuacao: 1.2 },
      { contem: 'engenheiro', pontuacao: 1.2 },
      { contem: 'arquitet', pontuacao: 1.2 },
      { contem: 'direito', pontuacao: 1.2 },
      { contem: 'psic', pontuacao: 1.2 },
      { contem: 'jornalismo', pontuacao: 1.2 },
      { contem: 'publicidade', pontuacao: 1.2 },
      { contem: 'comunicação', pontuacao: 1.2 },
      { contem: 'comunicacion', pontuacao: 1.2 },
      { contem: 'busi', pontuacao: 1.2 },
      { contem: 'ciências', pontuacao: 1.2 },
      { contem: 'econom', pontuacao: 1.2 },
      { contem: 'logística', pontuacao: 1.2 },
      { contem: 'gestão', pontuacao: 1.2 },
      { contem: 'medicina', pontuacao: 1.2 },
      { contem: 'bach', pontuacao: 1.2 },
      { contem: 'veterin', pontuacao: 1.2 },
      { contem: 'ensino médio', pontuacao: 1.0 },
      { contem: 'technical degree', pontuacao: 1.0 },
      { contem: 'tecnólogo', pontuacao: 1.0 },
      { contem: 'tecnologa', pontuacao: 1.0 },
      { contem: 'técnologa', pontuacao: 1.0 },
    ],
    idade: [
      { contem: 'até 35', pontuacao: 0.5 },
      { contem: 'até_35_anos', pontuacao: 0.5 },
      { contem: 'hasta 35 años', pontuacao: 0.5 },
      { contem: '36', pontuacao: 0.9, also: '40' },
      { contem: '41', pontuacao: 1.2, also: '45' },
      { contem: '46', pontuacao: 1.5, also: '50' },
      { contem: '51', pontuacao: 1.4, also: '55' },
      { contem: '56', pontuacao: 1.1, also: '60' },
      { contem: '61', pontuacao: 0.6, also: '65' },
      { contem: '61', pontuacao: 0.6, also: '64' },
      { contem: 'mais de 65', pontuacao: 0.8 },
      { contem: 'mais_de_65_anos', pontuacao: 0.8 },
    ],
  };
}

function applyRules(rules, value) {
  if (!value || String(value).trim() === '') return null; // sem info
  const v = String(value).toLowerCase().trim();
  for (const rule of rules) {
    if (rule.also) {
      if (v.includes(rule.contem) && v.includes(rule.also)) return rule.pontuacao;
    } else {
      if (v.includes(rule.contem)) return rule.pontuacao;
    }
  }
  return null;
}

function calcScore(row, rules) {
  const r = applyRules(rules.renda, row['Renda']) ?? 1.1;
  const c = applyRules(rules.cargo, row['Cargo']) ?? 0.9;
  const e = applyRules(rules.escolaridade, row['Escolaridade']) ?? 1.0;
  const i = applyRules(rules.idade, row['Idade']) ?? 0.5;
  return r + c + e + i;
}

function scoreLabel(score) {
  if (score >= 9) return 'De 9 a 10';
  if (score >= 8) return 'De 8 a 8,9';
  if (score >= 7) return 'De 7 a 7,9';
  if (score >= 6) return 'De 6 a 6,9';
  if (score >= 5) return 'De 5 a 5,9';
  if (score >= 4) return 'De 4 a 4,9';
  if (score >= 3) return 'De 3 a 3,9';
  return null;
}

// ============================================================
// CLUSTER by DDD
// ============================================================
function getCluster(tel) {
  if (!tel) return 'Outros';
  const t = String(tel).replace(/[+\-().\s]/g, '');
  let ddd = null;
  if (t.startsWith('55') && t.length >= 12) {
    ddd = parseInt(t.substring(2, 4));
  } else if (t.length >= 10) {
    ddd = parseInt(t.substring(0, 2));
  }
  if (!ddd || isNaN(ddd)) return 'Outros';
  if (ddd >= 11 && ddd <= 19) return '1 CLUSTER SP';
  if ([21,22,24].includes(ddd) || (ddd >= 31 && ddd <= 38)) return '2 CLUSTER MG_RJ';
  if ((ddd >= 41 && ddd <= 46) || (ddd >= 47 && ddd <= 49) ||
      [51,53,54,55].includes(ddd) || ddd === 61 ||
      [85,88].includes(ddd)) return '3 CLUSTER CE_DF_PR_RS_SC';
  return 'Outros';
}

// ============================================================
// CARGO PADRONIZADO
// ============================================================
function cargoPadrao(cargo) {
  if (!cargo) return 'Outro';
  const c = String(cargo).toLowerCase();
  if (c.includes('ceo') || c.includes('presidente') || c.includes('president')) return 'CEO / Presidente';
  if (c.includes('empresário') || c.includes('empresario') || c.includes('fundador') || c.includes('founder') || c.includes('propr') || c.includes('owner')) return 'Empresário / Sócio-Fundador';
  if (c.includes('diretor') || c.includes('director')) return 'Diretor';
  if (c.includes('chairman') || c.includes('board member') || c.includes('conselh') || c.includes('advisor')) return 'Chairman / Board Member / Conselheiro / Advisor';
  if (c.includes('vice') || c.includes('c-level') || c.includes('vp') || c.includes('cfo') || c.includes('coo') || c.includes('cto') || c.includes('cmo') || c.includes('chief')) return 'VP / C-Level';
  if (c.includes('superinten')) return 'Superintendente';
  if (c.includes('partner') || c.includes('sócio') || c.includes('socio')) return 'Partner / Sócio - serviços profissionais';
  if (c.includes('head')) return 'HEAD';
  if (c.includes('profissional liberal') || c.includes('consultor') || c.includes('consultant')) return 'Profissional Liberal';
  if (c.includes('gerente') || c.includes('manager') || c.includes('coordenador')) return 'Gerente / Manager / Country Manager / General Manager';
  return 'Outro';
}

// ============================================================
// DATE HELPERS
// ============================================================
function parseDate(val) {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val) ? null : val;
  const s = String(val).trim();
  // DD/MM/YYYY HH:MM:SS
  const m1 = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (m1) return new Date(`${m1[3]}-${m1[2]}-${m1[1]}`);
  // YYYY-MM-DD
  const d = new Date(s);
  return isNaN(d) ? null : d;
}

function dateOnly(val) {
  const d = parseDate(val);
  if (!d) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// ============================================================
// XLSX HELPERS
// ============================================================
function cellVal(cell) {
  if (!cell) return null;
  return cell.v ?? null;
}

function sheetToRows(sheet) {
  if (!sheet || !sheet['!ref']) return [];
  const range = XLSX.utils.decode_range(sheet['!ref']);
  const headers = [];
  for (let c = range.s.c; c <= range.e.c; c++) {
    const cell = sheet[XLSX.utils.encode_cell({ r: range.s.r, c })];
    headers.push(cell ? String(cell.v) : `col_${c}`);
  }
  const rows = [];
  for (let r = range.s.r + 1; r <= range.e.r; r++) {
    const row = {};
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = sheet[XLSX.utils.encode_cell({ r, c })];
      row[headers[c - range.s.c]] = cell ? cellVal(cell) : null;
    }
    rows.push(row);
  }
  return rows;
}

// ============================================================
// FORMAT HELPERS
// ============================================================
function fmtN(n, dec = 0) {
  if (n == null || isNaN(n)) return '—';
  return n.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
function fmtBRL(n) {
  if (n == null || isNaN(n)) return '—';
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtPct(n) {
  if (n == null || isNaN(n)) return '—';
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';
}

// ============================================================
// MAIN PROCESSING FUNCTION
// ============================================================
window.processExcel = async function(file, params) {
  const { mesLabel, metaMensal, diasMes, diaAtual, mesNum, anoNum } = params;

  // Load score rules from Google Sheets
  const rules = await loadScoreRules();

  // Read workbook — cellFormula:false força leitura dos valores cached (não fórmulas)
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array', cellDates: true, cellFormula: false });

  // Load sheets
  const pipe = sheetToRows(wb.Sheets['Base-PIPE']);
  const dep  = sheetToRows(wb.Sheets['DEPARA']);
  const meta = sheetToRows(wb.Sheets['Base_META']);
  const goog = sheetToRows(wb.Sheets['Base_google']);
  const link = sheetToRows(wb.Sheets['Base_linkedin_Valor']);

  // ---- Build DEPARA lookup (deve vir antes dos camp sets) ----
  // DEPARA tem chaves concatenadas ex: "[TORANJA] [LEAN] [MENSAGENS]LKDNAds[...]"
  // A chave real é a parte ANTES de LKDNAds / FBAds / MetaAds / FBads / googlesearch etc.
  const AD_SUFFIXES = /LKDNAds|FBAds|MetaAds|FBads|googlesearch|google_pmax|LKDNads|Org/i;

  function cleanDepaKey(raw) {
    const s = String(raw).trim();
    const match = s.search(AD_SUFFIXES);
    return match > 0 ? s.substring(0, match).trim() : s;
  }

  const deparaByName = {};
  const deparaById   = {};
  for (const row of dep) {
    const key = row['Nome do grupo de campanhas'];
    if (!key) continue;
    const keyStr  = String(key).trim();
    const keyClean = cleanDepaKey(keyStr);
    const info = {
      produto:    row['Produto'],
      plataforma: row['Plataforma'],
      pais:       row['País'],
      tipo:       row['TIPO'],
    };
    // Index by full key AND clean key
    deparaByName[keyStr]   = info;
    deparaByName[keyClean] = info;
    // Index by digits-only for Google
    const digits = keyClean.replace(/[^0-9]/g, '');
    if (digits) deparaById[digits] = info;
  }

  function resolveInvestProd(campanha) {
    if (!campanha) return null;
    const key = String(campanha).trim();
    const dep = deparaByName[key] || deparaByName[cleanDepaKey(key)];
    return dep ? dep.produto : null;
  }

  function isBoardReview(campanha) {
    if (!campanha) return false;
    const prod = resolveInvestProd(String(campanha).trim());
    return prod ? String(prod).toLowerCase().includes('board review') : false;
  }

  // ---- Build Consolidada Redes (auxiliar — só META, LINKEDIN, GOOGLE) ----
  // Campanhas com investimento NO PERÍODO — filtro por Dia
  // Join com leads: por campanha apenas (sem cruzar Dia)
  // BOARD REVIEW excluído
  const REDES_VALIDAS = ['META', 'LINKEDIN', 'GOOGLE'];

  function inInvestPeriod(dateVal) {
    const d = dateOnly(dateVal);
    if (!d) return false;
    return d.getFullYear() === anoNum && d.getMonth() + 1 === mesNum && d.getDate() <= diaAtual;
  }

  // Campanhas META com custo no período
  const metaCampSet = new Set(
    meta.filter(r => inInvestPeriod(r['Dia']))
        .map(r => String(r['Nome da campanha'] || '').trim())
        .filter(c => c && !isBoardReview(c))
  );
  // Campanhas LINKEDIN com custo no período
  const linkCampSet = new Set(
    link.filter(r => inInvestPeriod(r['Data de início (em UTC)']))
        .map(r => String(r['Nome do grupo de campanhas'] || '').trim())
        .filter(c => c && !isBoardReview(c))
  );
  // IDs Google com custo no período
  const googIdSet = new Set(
    goog.filter(r => inInvestPeriod(r['Dia']))
        .map(r => {
          const id = r['ID'];
          if (!id) return null;
          return String(id).replace(/\.0$/, '').trim();
        }).filter(Boolean)
  );

  function extractCampId(utm) {
    if (!utm) return null;
    const digits = String(utm).replace(/[^0-9]/g, '');
    return digits || null;
  }

  // Join por campanha apenas (sem Dia) — igual ao PBI USERELATIONSHIP
  function hasInvestment(row) {
    const plat = row['Plataforma'];
    if (!REDES_VALIDAS.includes(plat)) return false;
    const utm = String(row['utm_campaign'] || '').trim();
    if (plat === 'META')     return metaCampSet.has(utm);
    if (plat === 'LINKEDIN') return linkCampSet.has(utm);
    if (plat === 'GOOGLE') {
      const id = extractCampId(utm);
      return id ? googIdSet.has(id) : false;
    }
    return false;
  }

  // ---- Enrich pipe rows ----
  // Colunas fórmula no xlsx precisam ser recalculadas:
  // utm_campaign [35] = IF(Plataforma=GOOGLE, ID_numérico, utm_campaign_nao)
  // Produto [28]      = VLOOKUP(utm_campaign, DEPARA, 2)
  // Plataforma [31]   = VLOOKUP(utm_campaign, DEPARA, 5)
  // Data de Criação [27] = DATE(YEAR(Criado em), MONTH(Criado em), DAY(Criado em))
  // ETIQUETA [32]     = VLOOKUP(Pontuação, score table) — usamos scoreLabel()

  function lookupDepara(utmCampNao, idRaw) {
    // Try campaign name first (META/LINKEDIN) — tenta chave exata e chave limpa
    if (utmCampNao) {
      const raw   = String(utmCampNao).trim();
      const clean = cleanDepaKey(raw);
      const d = deparaByName[raw] || deparaByName[clean];
      if (d) return { dep: d, utm: raw };
    }
    // Try numeric ID (GOOGLE)
    if (idRaw != null) {
      const idStr = String(idRaw).replace(/\.0$/, '').trim();
      const d = deparaByName[idStr] || deparaById[idStr];
      if (d) return { dep: d, utm: idStr };
    }
    return null;
  }

  for (const row of pipe) {
    const utmNao = row['utm_campaign_nao'];
    const idRaw  = row['ID'];
    const criado = row['Criado em'];

    // Com cellFormula:false, células fórmula retornam o valor em cache
    // Se o cache estiver vazio (null), usamos DEPARA como fallback
    const prodRaw = row['Produto'];
    const platRaw = row['Plataforma'];
    const utmRaw  = row['utm_campaign'];

    const needsDepara = !prodRaw || String(prodRaw).startsWith('=') ||
                        !platRaw || String(platRaw).startsWith('=') ||
                        !utmRaw  || String(utmRaw).startsWith('=');

    if (needsDepara) {
      const resolved = lookupDepara(utmNao, idRaw);
      if (resolved) {
        if (!prodRaw || String(prodRaw).startsWith('=')) row['Produto']    = resolved.dep.produto;
        if (!platRaw || String(platRaw).startsWith('=')) row['Plataforma'] = resolved.dep.plataforma;
        if (!utmRaw  || String(utmRaw).startsWith('='))  row['utm_campaign'] = resolved.utm;
        row['País'] = row['País'] || resolved.dep.pais;
      } else {
        if (!utmRaw || String(utmRaw).startsWith('=')) row['utm_campaign'] = utmNao || null;
      }
    }

    // Eixo temporal = Última aplicação_1 (igual ao PBI)
    row._dataCriacao   = dateOnly(criado);
    row._dataAplicacao = dateOnly(row['Última aplicação_1'] || row['Última aplicação']);

    // Score
    row._score      = calcScore(row, rules);
    row._scoreLabel = scoreLabel(row._score);

    // Cluster
    row._cluster = getCluster(row['Telefone']);
  }

  // ---- Period filter ----
  function inPeriod(row) {
    const d = row._dataAplicacao;
    if (!d) return false;
    return d.getFullYear() === anoNum &&
           d.getMonth() + 1 === mesNum &&
           d.getDate() >= 1 &&
           d.getDate() <= diaAtual;
  }

  // ---- Novo vs Reaplicação (PBI logic: Reaplicação = aplicacao > criacao) ----
  function isNovo(row) {
    const da = row._dataAplicacao;
    const dc = row._dataCriacao;
    if (!da || !dc) return true;
    return da <= dc; // novo = aplicou no mesmo dia ou antes de ser criado no pipe
  }

  function isReap(row) { return !isNovo(row); }

  // ---- Main filter ----
  // Produto nos 5, Plataforma em META/LINKEDIN/GOOGLE,
  // utm_campaign existe nas abas de investimento do período,
  // data Última aplicação_1 no período
  const filtered = pipe.filter(row =>
    PRODS.includes(row['Produto']) &&
    REDES_VALIDAS.includes(row['Plataforma']) &&
    row['utm_campaign'] &&
    String(row['utm_campaign']).trim() !== '' &&
    inPeriod(row) &&
    hasInvestment(row)
  );

  // ---- Semanas ----
  function semana(row) {
    const d = row._dataAplicacao?.getDate();
    if (!d) return null;
    if (d <= 9)  return 'S1';
    if (d <= 16) return 'S2';
    if (d <= 23) return 'S3';
    return 'S4';
  }

  // ---- MTD Meta ----
  const diario   = Math.floor(metaMensal / diasMes);
  const mtdEsp   = diario * diaAtual;
  const volTotal = filtered.length;
  const novosTotal = filtered.filter(isNovo).length;
  const reapsTotal = volTotal - novosTotal;
  const pctMeta  = metaMensal ? (volTotal / metaMensal) * 100 : 0;
  const pctMTD   = mtdEsp     ? (volTotal / mtdEsp)     * 100 : 0;
  const deficit  = mtdEsp - volTotal;

  // ---- Investment helpers ----
  // ATENÇÃO: coluna 'Produto' nas abas de investimento é fórmula VLOOKUP
  // SheetJS lê a fórmula como string — precisamos derivar via DEPARA

  // Coluna chave de cada aba de investimento -> DEPARA
  // META: 'Nome da campanha' -> DEPARA 'Nome do grupo de campanhas' -> Produto
  // GOOGLE: 'Campanha' -> DEPARA -> Produto  (mas DEPARA key é nome, Google usa ID)
  //         Usamos o campo 'Produto' da consolidada via DEPARA pelo nome da campanha
  // LINKEDIN: 'Nome do grupo de campanhas' -> DEPARA -> Produto

  // Produtos excluídos da Consolidada Redes
  const PRODS_EXCLUIR_INVEST = ['BOARD REVIEW', 'Board Review'];

  // Para Google: chave é nome da campanha 'Campanha', não ID
  function investByProd(rows, dateCol, valorCol, campCol) {
    const result = {};
    for (const r of rows) {
      const d = dateOnly(r[dateCol]);
      if (!d) continue;
      if (d.getFullYear() !== anoNum || d.getMonth() + 1 !== mesNum || d.getDate() > diaAtual) continue;

      // Resolve produto via DEPARA (ignora fórmulas da planilha)
      const camp = r[campCol];
      const prod = resolveInvestProd(camp);
      if (!prod) continue;
      const prodStr = String(prod).trim();

      // Exclui BOARD REVIEW e produtos fora de PRODS
      if (PRODS_EXCLUIR_INVEST.some(e => prodStr.toLowerCase() === e.toLowerCase())) continue;
      if (!PRODS.includes(prodStr)) continue;

      result[prodStr] = (result[prodStr] || 0) + (r[valorCol] || 0);
    }
    return result;
  }

  const metaInvest = investByProd(meta, 'Dia',                     'Valor usado (BRL)', 'Nome da campanha');
  const googInvest = investByProd(goog, 'Dia',                     'Custo',             'Campanha');
  const linkInvest = investByProd(link, 'Data de início (em UTC)', 'Total investido',   'Nome do grupo de campanhas');

  function totalInvestProd(prod) {
    return (metaInvest[prod] || 0) + (googInvest[prod] || 0) + (linkInvest[prod] || 0);
  }

  function investPlatProd(plat, prod) {
    if (plat === 'META')     return metaInvest[prod] || 0;
    if (plat === 'GOOGLE')   return googInvest[prod] || 0;
    if (plat === 'LINKEDIN') return linkInvest[prod] || 0;
    return 0;
  }

  // ---- Ganhos ----
  // Mesmo filtro dos leads: produto, plataforma, período, utm, hasInvestment
  function ganhoRows(prod, plat) {
    return pipe.filter(r =>
      r['Produto'] === prod &&
      r['Status'] === 'Ganho' &&
      REDES_VALIDAS.includes(r['Plataforma']) &&
      r['utm_campaign'] &&
      String(r['utm_campaign']).trim() !== '' &&
      inPeriod(r) &&
      hasInvestment(r) &&
      (!plat || r['Plataforma'] === plat)
    ).map(r => ({
      id:    r['ID'],
      funil: r['Funil'],
      prog:  r['Nome Produto'] || r['Produto'],
      valor: r['Valor do negócio'] || 0,
    }));
  }

  function ganhoSum(prod, plat) {
    return ganhoRows(prod, plat).reduce((s, g) => s + g.valor, 0);
  }

  // ---- Leads por produto + plataforma ----
  function leadsByProdPlat(prod, plat) {
    const rows = filtered.filter(r => r['Produto'] === prod && r['Plataforma'] === plat);
    return {
      vol:   rows.length,
      novos: rows.filter(isNovo).length,
      reaps: rows.filter(isReap).length,
    };
  }

  function leadsByProd(prod) {
    const rows = filtered.filter(r => r['Produto'] === prod);
    return {
      vol:   rows.length,
      novos: rows.filter(isNovo).length,
      reaps: rows.filter(isReap).length,
    };
  }

  // ---- Overview por produto ----
  const overviewRows = PRODS.map(prod => {
    const { vol, novos, reaps } = leadsByProd(prod);
    const invest = totalInvestProd(prod);
    const ganhos = ganhoSum(prod, null);
    const cpl    = vol > 0    ? invest / vol    : 0;
    const roas   = invest > 0 ? ganhos / invest : 0;
    return { prod, nome: NOME[prod], vol, novos, reaps, invest, ganhos, cpl, roas };
  });

  const totais = {
    vol:    overviewRows.reduce((s, r) => s + r.vol,    0),
    novos:  overviewRows.reduce((s, r) => s + r.novos,  0),
    reaps:  overviewRows.reduce((s, r) => s + r.reaps,  0),
    invest: overviewRows.reduce((s, r) => s + r.invest, 0),
    ganhos: overviewRows.reduce((s, r) => s + r.ganhos, 0),
  };
  totais.cpl  = totais.vol    > 0 ? totais.invest / totais.vol    : 0;
  totais.roas = totais.invest > 0 ? totais.ganhos / totais.invest : 0;

  // ---- Score semanal (PRODS_3) ----
  const filtP3 = filtered.filter(r => PRODS_3.includes(r['Produto']) && r._scoreLabel);

  function scoreSemanalTable() {
    const t = {};
    for (const l of SCORE_ORDER) t[l] = { S1:0, S2:0, S3:0, total:0 };
    for (const r of filtP3) {
      const s = semana(r); const l = r._scoreLabel;
      if (!s || !l || !t[l]) continue;
      if (['S1','S2','S3'].includes(s)) t[l][s]++;
      t[l].total++;
    }
    return t;
  }

  // ---- Score por cluster ----
  const CLUSTERS = ['1 CLUSTER SP','2 CLUSTER MG_RJ','3 CLUSTER CE_DF_PR_RS_SC','Outros'];

  function scoreClusterTable() {
    const t = {};
    for (const l of SCORE_ORDER) {
      t[l] = { total: 0 };
      for (const c of CLUSTERS) t[l][c] = 0;
    }
    for (const r of filtP3) {
      const l = r._scoreLabel; if (!l) continue;
      const cl = r._cluster || 'Outros';
      t[l][cl] = (t[l][cl] || 0) + 1;
      t[l].total++;
    }
    return t;
  }

  // ---- Score × Cargo (PFCC Brasil) ----
  const filtPFCC = filtered.filter(r => r['Produto'] === 'PFCC - BRASIL' && r._scoreLabel);

  function scoreCargoTable() {
    const t = {};
    for (const cargo of CARGO_ORDER) t[cargo] = { S1:0, S2:0, S3:0, total:0 };
    for (const r of filtPFCC) {
      const cargo = cargoPadrao(r['Cargo']);
      const s = semana(r);
      if (!t[cargo]) continue;
      if (['S1','S2','S3'].includes(s)) t[cargo][s]++;
      t[cargo].total++;
    }
    return t;
  }

  // ---- Orgânico ----
  const organico = pipe.filter(r => r['Plataforma'] === 'ORGANICO' && inPeriod(r));

  const orgNaoWs = organico.filter(r => !String(r['utm_campaign'] || '').toUpperCase().includes('WORKSHOP'));
  const orgWs    = organico.filter(r =>  String(r['utm_campaign'] || '').toUpperCase().includes('WORKSHOP'));

  function groupBy(rows, keyFn) {
    const map = {};
    for (const r of rows) {
      const k = keyFn(r) || 'Outros';
      if (!map[k]) map[k] = { vol:0, novos:0, ganhos:0, ganhoVal:0 };
      map[k].vol++;
      if (isNovo(r)) map[k].novos++;
      if (r['Status'] === 'Ganho') { map[k].ganhos++; map[k].ganhoVal += (r['Valor do negócio'] || 0); }
    }
    return map;
  }

  const orgByMedium   = groupBy(orgNaoWs, r => r['utm_medium']);
  const orgByWorkshop = groupBy(orgWs,    r => r['utm_campaign']);

  // ---- Platcard data builder ----
  function platData(prod, plat) {
    const leads = leadsByProdPlat(prod, plat);
    const invest = investPlatProd(plat, prod);
    const gr = ganhoRows(prod, plat);
    const ganhos = gr.reduce((s, g) => s + g.valor, 0);
    return { ...leads, invest, ganhos, ganhoRows: gr };
  }

  // ============================================================
  // Return all computed data
  // ============================================================
  return {
    params: { mesLabel, metaMensal, diasMes, diaAtual, mesNum, anoNum },
    mtd: {
      volTotal, novosTotal, reapsTotal,
      metaMensal, diasMes, diaAtual,
      diario, mtdEsp, pctMeta, pctMTD, deficit,
      investTotal: totais.invest,
      ganhoTotal:  totais.ganhos,
    },
    overview:     overviewRows,
    totais,
    scoreSemanal: scoreSemanalTable(),
    scoreCluster: scoreClusterTable(),
    scoreCargo:   scoreCargoTable(),
    organico:     { naoWorkshop: orgByMedium, workshop: orgByWorkshop },
    pfccBrasil: {
      meta:     platData('PFCC - BRASIL', 'META'),
      linkedin: platData('PFCC - BRASIL', 'LINKEDIN'),
      google:   platData('PFCC - BRASIL', 'GOOGLE'),
    },
    lean: {
      meta:     platData('LEAN', 'META'),
      linkedin: platData('LEAN', 'LINKEDIN'),
      google:   platData('LEAN', 'GOOGLE'),
    },
    ces: {
      meta:     platData('CES', 'META'),
      linkedin: platData('CES', 'LINKEDIN'),
      google:   platData('CES', 'GOOGLE'),
    },
    internacional: {
      latam: (() => { const l = leadsByProd('PFCC - LATAM'); return { ...l, invest: totalInvestProd('PFCC - LATAM'), ganhos: ganhoSum('PFCC - LATAM', null) }; })(),
      chile: (() => { const l = leadsByProd('PFCC – CHILE'); return { ...l, invest: totalInvestProd('PFCC – CHILE'), ganhos: ganhoSum('PFCC – CHILE', null) }; })(),
    },
  };
};

// Expose helpers globally
window.fmtN   = fmtN;
window.fmtBRL = fmtBRL;
window.fmtPct = fmtPct;
window.SCORE_ORDER  = SCORE_ORDER;
window.SLA          = SLA;
window.NOME         = NOME;
window.PRODS        = PRODS;
window.CARGO_ORDER  = CARGO_ORDER;
