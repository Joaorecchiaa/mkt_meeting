// ============================================================
// BOARD ACADEMY — MTD Presentation Generator
// index.js — all data processing logic (runs in browser)
// ============================================================

// ---------- CONSTANTS ----------
const PRODS = ['PFCC - BRASIL', 'PFCC - LATAM', 'PFCC – CHILE', 'LEAN', 'CES'];
const PRODS_3 = ['PFCC - BRASIL', 'LEAN', 'CES'];

const NOME = {
  'PFCC - BRASIL': 'PFCC Brasil',
  'PFCC - LATAM':  'PFCC LATAM',
  'PFCC – CHILE':  'PFCC Chile',
  'LEAN':          'LEAN',
  'CES':           'CES',
};

// Score V2 weights
function scoreRenda(renda) {
  if (!renda) return 0;
  const r = String(renda).toLowerCase().replace(/\s/g, '');
  if (r.includes('mais de 50') || r.includes('acima de 50') || r.includes('mais_de_50') || r.includes('+50')) return 3.5;
  if (r.includes('40') && r.includes('50')) return 2.8;
  if (r.includes('30') && r.includes('40')) return 3.15;
  if (r.includes('25') && r.includes('30')) return 2.45;
  if (r.includes('20') && r.includes('25')) return 2.1;
  if (r.includes('15') && (r.includes('20') || r.includes('até_20'))) return 1.75;
  if (r.includes('até_20') || r.includes('até 20')) return 1.75;
  if (r.includes('10') && r.includes('15')) return 1.40;
  if (r.includes('até 10') || r.includes('até_10') || r.includes('ate_10')) return 1.05;
  return 0;
}

function scoreCargo(cargo) {
  if (!cargo) return 0.9;
  const c = String(cargo).toLowerCase();
  if (c.includes('diretor') || c.includes('director')) return 3.0;
  if (c.includes('founder') || c.includes('fundador') || c.includes('proprietário') || c.includes('proprietario') || c.includes('sócio') || c.includes('socio') || c.includes('owner') || c.includes('empresário') || c.includes('empresario')) return 2.7;
  if (c.includes('ceo') || c.includes('chief') || c.includes('president')) return 2.4;
  if (c.includes('consultor') || c.includes('profissional liberal')) return 1.8;
  if (c.includes('vice') || c.includes('c-level') || c.includes('vp') || c.includes('cfo') || c.includes('coo') || c.includes('cto') || c.includes('cmo')) return 1.5;
  if (c.includes('conselheiro') || c.includes('advisor')) return 1.2;
  if (c.includes('manager') || c.includes('gerente') || c.includes('coordenador') || c.includes('head')) return 0.9;
  return 0.9;
}

function scoreFormacao(esc) {
  if (!esc) return 0;
  const e = String(esc).toLowerCase();
  if (e.includes('mba')) return 2.0;
  if (e.includes('pós') || e.includes('pos') || e.includes('executive')) return 1.8;
  if (e.includes('mestrado') || e.includes('master')) return 1.6;
  if (e.includes('doutor') || e.includes('phd')) return 1.4;
  if (e.includes('superior') || e.includes('graduaç') || e.includes('graduac') || e.includes('degree') || e.includes('bacharel')) return 1.2;
  if (e.includes('médio') || e.includes('medio') || e.includes('tecnólogo') || e.includes('tecnologo')) return 1.0;
  return 0;
}

function scoreIdade(idade) {
  if (!idade) return 0;
  const i = String(idade).toLowerCase().replace(/\s/g, '');
  if (i.includes('65') || i.includes('+65') || i.includes('mais de 65')) return 0.75;
  if (i.includes('61') || i.includes('62') || i.includes('63') || i.includes('64')) return 0.6;
  if (i.includes('56') || i.includes('57') || i.includes('58') || i.includes('59') || i.includes('60')) return 1.05;
  if (i.includes('51') || i.includes('52') || i.includes('53') || i.includes('54') || i.includes('55')) return 1.35;
  if (i.includes('46') || i.includes('47') || i.includes('48') || i.includes('49') || i.includes('50')) return 1.5;
  if (i.includes('41') || i.includes('42') || i.includes('43') || i.includes('44') || i.includes('45')) return 1.2;
  if (i.includes('36') || i.includes('37') || i.includes('38') || i.includes('39') || i.includes('40')) return 0.9;
  if (i.includes('35') || i.includes('até 35') || i.includes('menos') || i.includes('-35')) return 0.45;
  // Try parsing numbers from string like "De 41 a 45 años"
  const nums = i.match(/\d+/g);
  if (nums) {
    const n = parseInt(nums[0]);
    if (n > 65) return 0.75;
    if (n >= 61) return 0.6;
    if (n >= 56) return 1.05;
    if (n >= 51) return 1.35;
    if (n >= 46) return 1.5;
    if (n >= 41) return 1.2;
    if (n >= 36) return 0.9;
    return 0.45;
  }
  return 0;
}

function calcScore(row) {
  return scoreRenda(row['Renda']) + scoreCargo(row['Cargo']) + scoreFormacao(row['Escolaridade']) + scoreIdade(row['Idade']);
}

function scoreLabel(score) {
  if (score >= 9) return 'De 9 a 10';
  if (score >= 8) return 'De 8 a 8,9';
  if (score >= 7) return 'De 7 a 7,9';
  if (score >= 6) return 'De 6 a 6,9';
  if (score >= 5) return 'De 5 a 5,9';
  if (score >= 4) return 'De 4 a 4,9';
  if (score >= 3) return 'De 3 a 3,9';
  return null; // excluded
}

const SCORE_ORDER = ['De 9 a 10','De 8 a 8,9','De 7 a 7,9','De 6 a 6,9','De 5 a 5,9','De 4 a 4,9','De 3 a 3,9'];

const SLA = {
  'De 9 a 10': 16, 'De 8 a 8,9': 24, 'De 7 a 7,9': 30,
  'De 6 a 6,9': 17, 'De 5 a 5,9': 9, 'De 4 a 4,9': 3, 'De 3 a 3,9': 0,
};

// Cluster by DDD
function getCluster(tel) {
  if (!tel) return 'Outros';
  const t = String(tel).replace(/[+\-().\s]/g, '');
  let ddd = null;
  if (t.startsWith('55') && t.length >= 13) {
    ddd = parseInt(t.substring(2, 4));
  } else if (t.length >= 11) {
    ddd = parseInt(t.substring(0, 2));
  }
  if (!ddd) return 'Outros';
  if (ddd >= 11 && ddd <= 19) return '1 CLUSTER SP';
  if ([21,22,24].includes(ddd) || (ddd >= 31 && ddd <= 38)) return '2 CLUSTER MG_RJ';
  if ((ddd >= 41 && ddd <= 46) || (ddd >= 47 && ddd <= 49) ||
      [51,53,54,55].includes(ddd) || ddd === 61 || [85,88].includes(ddd)) return '3 CLUSTER CE_DF_PR_RS_SC';
  return 'Outros';
}

// Cargo padronizado (PFCC Brasil only)
function cargoPadrao(cargo) {
  if (!cargo) return null;
  const c = String(cargo).toLowerCase();
  if (c.includes('ceo') || c.includes('presidente') || c.includes('president')) return 'CEO / Presidente';
  if (c.includes('empresário') || c.includes('empresario') || c.includes('sócio') || c.includes('socio') || c.includes('fundador') || c.includes('founder')) return 'Empresário / Sócio-Fundador';
  if (c.includes('diretor') || c.includes('director')) return 'Diretor';
  if (c.includes('chairman') || c.includes('board member') || c.includes('conselheiro') || c.includes('advisor')) return 'Chairman / Board Member / Conselheiro / Advisor';
  if (c.includes('vp') || c.includes('vice') || c.includes('c-level') || c.includes('cfo') || c.includes('coo') || c.includes('cto') || c.includes('cmo')) return 'VP / C-Level';
  if (c.includes('superintendente')) return 'Superintendente';
  if (c.includes('partner') || c.includes('sócio') || c.includes('socio')) return 'Partner / Sócio - serviços profissionais';
  if (c.includes('head')) return 'HEAD';
  if (c.includes('profissional liberal') || c.includes('médico') || c.includes('medico') || c.includes('advogado') || c.includes('arquiteto')) return 'Profissional Liberal';
  if (c.includes('gerente') || c.includes('manager') || c.includes('country manager') || c.includes('general manager')) return 'Gerente / Manager / Country Manager / General Manager';
  return 'Outro';
}

const CARGO_ORDER = [
  'CEO / Presidente','Empresário / Sócio-Fundador','Diretor',
  'Chairman / Board Member / Conselheiro / Advisor','VP / C-Level',
  'Superintendente','Partner / Sócio - serviços profissionais','HEAD',
  'Profissional Liberal','Gerente / Manager / Country Manager / General Manager','Outro'
];

// ---- Date helpers ----
function parseDate(val) {
  if (!val) return null;
  if (val instanceof Date) return val;
  // Try DD/MM/YYYY HH:MM:SS
  const m = String(val).match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (m) return new Date(`${m[3]}-${m[2]}-${m[1]}`);
  // Try YYYY-MM-DD
  const d = new Date(val);
  if (!isNaN(d)) return d;
  return null;
}

function toDateOnly(d) {
  if (!d) return null;
  const dt = parseDate(d);
  if (!dt) return null;
  return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
}

// ---- XLSX cell value helpers ----
function cellVal(cell) {
  if (!cell) return null;
  if (cell.t === 'd') return cell.v; // date
  if (cell.t === 'n') return cell.v; // number
  if (cell.t === 's') return cell.v; // string
  if (cell.t === 'b') return cell.v; // bool
  return cell.v ?? null;
}

// ---- Read sheet as array of objects ----
function sheetToRows(sheet) {
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
  const headers = [];
  for (let c = range.s.c; c <= range.e.c; c++) {
    const cell = sheet[XLSX.utils.encode_cell({r: range.s.r, c})];
    headers.push(cell ? String(cell.v) : `col_${c}`);
  }
  const rows = [];
  for (let r = range.s.r + 1; r <= range.e.r; r++) {
    const row = {};
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = sheet[XLSX.utils.encode_cell({r, c})];
      row[headers[c - range.s.c]] = cell ? cellVal(cell) : null;
    }
    rows.push(row);
  }
  return rows;
}

// ---- Format helpers ----
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

  // ---- Read workbook ----
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array', cellDates: true });

  // ---- Load sheets ----
  const pipe  = sheetToRows(wb.Sheets['Base-PIPE']);
  const dep   = sheetToRows(wb.Sheets['DEPARA']);
  const meta  = sheetToRows(wb.Sheets['Base_META']);
  const goog  = sheetToRows(wb.Sheets['Base_google']);
  const link  = sheetToRows(wb.Sheets['Base_linkedin_Valor']);

  // ---- Build DEPARA lookup (campaign name -> {Produto, Plataforma, País, TIPO}) ----
  const deparaMap = {};
  for (const row of dep) {
    const key = row['Nome do grupo de campanhas'];
    if (key) {
      deparaMap[String(key).trim()] = {
        produto:    row['Produto'],
        plataforma: row['Plataforma'],
        pais:       row['País'],
        tipo:       row['TIPO'],
      };
    }
  }

  // ---- Enrich pipe rows with DEPARA info ----
  // Pipe has: Produto, Plataforma already computed by VLOOKUP
  // But we read the raw file - formulas show as formula strings
  // So we need to re-derive from utm_campaign -> DEPARA
  for (const row of pipe) {
    const utmCamp = row['utm_campaign'];
    if (utmCamp) {
      const dep = deparaMap[String(utmCamp).trim()];
      if (dep) {
        if (!row['Produto'] || String(row['Produto']).startsWith('=')) row['Produto'] = dep.produto;
        if (!row['Plataforma'] || String(row['Plataforma']).startsWith('=')) row['Plataforma'] = dep.plataforma;
        if (!row['País'] || String(row['País']).startsWith('=')) row['País'] = dep.pais;
      }
    }
    // Parse dates
    row._dataCriacao   = toDateOnly(row['Criado em']);
    row._dataAplicacao = toDateOnly(row['Última aplicação']);
    // Score
    row._score = calcScore(row);
    row._scoreLabel = scoreLabel(row._score);
    // Cluster
    row._cluster = getCluster(row['Telefone']);
  }

  // ---- Filter for MTD period ----
  function inPeriod(row) {
    const d = row._dataAplicacao;
    if (!d) return false;
    return d.getFullYear() === anoNum &&
           d.getMonth() + 1 === mesNum &&
           d.getDate() >= 1 &&
           d.getDate() <= diaAtual;
  }

  function isNovo(row) {
    const da = row._dataAplicacao;
    const dc = row._dataCriacao;
    if (!da || !dc) return false;
    return da <= dc;
  }

  const filtered = pipe.filter(row =>
    PRODS.includes(row['Produto']) &&
    row['Plataforma'] !== 'ORGANICO' &&
    row['utm_campaign'] &&
    String(row['utm_campaign']).trim() !== '' &&
    String(row['utm_campaign']) !== 'nan' &&
    inPeriod(row)
  );

  // ---- Semanas ----
  function semana(row) {
    const d = row._dataAplicacao?.getDate();
    if (!d) return null;
    if (d <= 9) return 'S1';
    if (d <= 16) return 'S2';
    if (d <= 23) return 'S3';
    return 'S4';
  }

  // ---- META MTD ----
  const diario  = Math.floor(metaMensal / diasMes);
  const mtdEsp  = diario * diaAtual;
  const volTotal = filtered.length;
  const novosTotal = filtered.filter(isNovo).length;
  const reapsTotal = volTotal - novosTotal;
  const pctMeta  = metaMensal ? (volTotal / metaMensal) * 100 : 0;
  const pctMTD   = mtdEsp ? (volTotal / mtdEsp) * 100 : 0;
  const deficit  = mtdEsp - volTotal;

  // ---- Investment aggregation ----
  function investByProduto(rows, dateCol, valorCol, ano, mes, dia) {
    const result = {};
    for (const r of rows) {
      const d = toDateOnly(r[dateCol]);
      if (!d) continue;
      if (d.getFullYear() !== ano || d.getMonth() + 1 !== mes || d.getDate() > dia) continue;
      const prod = r['Produto'];
      if (!prod) continue;
      if (!result[prod]) result[prod] = 0;
      result[prod] += (r[valorCol] || 0);
    }
    return result;
  }

  function investByPlatProd(rows, dateCol, valorCol, plat, ano, mes, dia) {
    const result = {};
    for (const r of rows) {
      const d = toDateOnly(r[dateCol]);
      if (!d) continue;
      if (d.getFullYear() !== ano || d.getMonth() + 1 !== mes || d.getDate() > dia) continue;
      const prod = r['Produto'];
      if (!PRODS.includes(prod)) continue;
      if (!result[prod]) result[prod] = 0;
      result[prod] += (r[valorCol] || 0);
    }
    return result;
  }

  const metaInvest  = investByPlatProd(meta, 'Dia', 'Valor usado (BRL)', 'META', anoNum, mesNum, diaAtual);
  const googInvest  = investByPlatProd(goog, 'Dia', 'Custo', 'GOOGLE', anoNum, mesNum, diaAtual);
  const linkInvest  = investByPlatProd(link, 'Data de início (em UTC)', 'Total investido', 'LINKEDIN', anoNum, mesNum, diaAtual);

  function totalInvest(prod) {
    return (metaInvest[prod] || 0) + (googInvest[prod] || 0) + (linkInvest[prod] || 0);
  }

  function totalInvestAll() {
    let t = 0;
    for (const p of PRODS) t += totalInvest(p);
    return t;
  }

  // ---- Ganhos ----
  function ganhosByProd(prod, plat) {
    return pipe.filter(r =>
      r['Produto'] === prod &&
      r['Status'] === 'Ganho' &&
      inPeriod(r) &&
      (!plat || r['Plataforma'] === plat)
    ).map(r => ({
      id:    r['ID'],
      funil: r['Funil'],
      prog:  r['Nome Produto'] || r['Produto'],
      valor: r['Valor do negócio'] || 0,
    }));
  }

  function ganhosSumByProd(prod, plat) {
    return ganhosByProd(prod, plat).reduce((s, g) => s + g.valor, 0);
  }

  function ganhosTotalByProd(prod) {
    return ganhosSumByProd(prod, null);
  }

  // ---- Score semanal (PRODS_3) ----
  const filteredP3 = filtered.filter(r => PRODS_3.includes(r['Produto']) && r._scoreLabel);

  function scoreSemanalTable() {
    const weeks = ['S1','S2','S3'];
    const table = {};
    for (const label of SCORE_ORDER) {
      table[label] = { S1: 0, S2: 0, S3: 0, total: 0 };
    }
    for (const r of filteredP3) {
      const s = semana(r);
      const l = r._scoreLabel;
      if (!s || !l || !table[l]) continue;
      if (['S1','S2','S3'].includes(s)) table[l][s]++;
      table[l].total++;
    }
    return table;
  }

  // ---- Score by cluster ----
  function scoreClusterTable() {
    const clusters = ['1 CLUSTER SP','2 CLUSTER MG_RJ','3 CLUSTER CE_DF_PR_RS_SC','Outros'];
    const table = {};
    for (const label of SCORE_ORDER) {
      table[label] = {};
      for (const c of clusters) table[label][c] = 0;
      table[label].total = 0;
    }
    for (const r of filteredP3) {
      const l = r._scoreLabel;
      if (!l) continue;
      const cl = r._cluster;
      if (table[l] && table[l][cl] !== undefined) table[l][cl]++;
      table[l].total++;
    }
    return table;
  }

  // ---- Score × Cargo (PFCC Brasil) ----
  const filteredPFCC = filtered.filter(r => r['Produto'] === 'PFCC - BRASIL' && r._scoreLabel);

  function scoreCargoTable() {
    const weeks = ['S1','S2','S3'];
    const table = {};
    for (const cargo of CARGO_ORDER) {
      table[cargo] = { S1: 0, S2: 0, S3: 0, total: 0 };
    }
    for (const r of filteredPFCC) {
      const cargo = cargoPadrao(r['Cargo']);
      if (!cargo) continue;
      const s = semana(r);
      if (!table[cargo]) continue;
      if (['S1','S2','S3'].includes(s)) table[cargo][s]++;
      table[cargo].total++;
    }
    return table;
  }

  // ---- By Produto + Plataforma ----
  function leadsByProdPlat(prod, plat) {
    const rows = filtered.filter(r => r['Produto'] === prod && r['Plataforma'] === plat);
    const novos = rows.filter(isNovo).length;
    return { vol: rows.length, novos, reaps: rows.length - novos };
  }

  function leadsByProd(prod) {
    const rows = filtered.filter(r => r['Produto'] === prod);
    const novos = rows.filter(isNovo).length;
    return { vol: rows.length, novos, reaps: rows.length - novos };
  }

  // ---- Overview por produto ----
  const overviewRows = PRODS.map(prod => {
    const { vol, novos, reaps } = leadsByProd(prod);
    const invest = totalInvest(prod);
    const ganhos = ganhosTotalByProd(prod);
    const cpl    = vol > 0 ? invest / vol : 0;
    const roas   = invest > 0 ? ganhos / invest : 0;
    return { prod, nome: NOME[prod], vol, novos, reaps, invest, ganhos, cpl, roas };
  });

  const totaisOverview = {
    vol:    overviewRows.reduce((s, r) => s + r.vol, 0),
    novos:  overviewRows.reduce((s, r) => s + r.novos, 0),
    reaps:  overviewRows.reduce((s, r) => s + r.reaps, 0),
    invest: overviewRows.reduce((s, r) => s + r.invest, 0),
    ganhos: overviewRows.reduce((s, r) => s + r.ganhos, 0),
  };
  totaisOverview.cpl  = totaisOverview.vol > 0 ? totaisOverview.invest / totaisOverview.vol : 0;
  totaisOverview.roas = totaisOverview.invest > 0 ? totaisOverview.ganhos / totaisOverview.invest : 0;

  // ---- Orgânico ----
  const organico = pipe.filter(r =>
    r['Plataforma'] === 'ORGANICO' && inPeriod(r)
  );

  const orgNaoWorkshop = organico.filter(r => {
    const c = String(r['utm_campaign'] || '').toUpperCase();
    return !c.includes('WORKSHOP');
  });

  const orgWorkshop = organico.filter(r => {
    const c = String(r['utm_campaign'] || '').toUpperCase();
    return c.includes('WORKSHOP');
  });

  // Group orgânico não-workshop by utm_medium
  const orgByMedium = {};
  for (const r of orgNaoWorkshop) {
    const med = r['utm_medium'] || 'Outros';
    if (!orgByMedium[med]) orgByMedium[med] = { vol: 0, novos: 0, ganhos: 0, ganhoVal: 0 };
    orgByMedium[med].vol++;
    if (isNovo(r)) orgByMedium[med].novos++;
    if (r['Status'] === 'Ganho') { orgByMedium[med].ganhos++; orgByMedium[med].ganhoVal += (r['Valor do negócio'] || 0); }
  }

  // Group workshop by utm_campaign
  const orgByWorkshop = {};
  for (const r of orgWorkshop) {
    const camp = r['utm_campaign'] || 'Outros';
    if (!orgByWorkshop[camp]) orgByWorkshop[camp] = { vol: 0, novos: 0, ganhos: 0, ganhoVal: 0 };
    orgByWorkshop[camp].vol++;
    if (isNovo(r)) orgByWorkshop[camp].novos++;
    if (r['Status'] === 'Ganho') { orgByWorkshop[camp].ganhos++; orgByWorkshop[camp].ganhoVal += (r['Valor do negócio'] || 0); }
  }

  // ============================================================
  // Return all computed data
  // ============================================================
  return {
    params: { mesLabel, metaMensal, diasMes, diaAtual, mesNum, anoNum },
    mtd: {
      volTotal, novosTotal, reapsTotal,
      metaMensal, diasMes, diaAtual,
      diario, mtdEsp,
      pctMeta, pctMTD, deficit,
      investTotal: totalInvestAll(),
      ganhoTotal:  overviewRows.reduce((s, r) => s + r.ganhos, 0),
    },
    overview: overviewRows,
    totais: totaisOverview,
    scoreSemanal:  scoreSemanalTable(),
    scoreCluster:  scoreClusterTable(),
    scoreCargo:    scoreCargoTable(),
    organico: { naoWorkshop: orgByMedium, workshop: orgByWorkshop },
    // per-product + per-platform for slides s3, s5, s6
    pfccBrasil: {
      meta:     { ...leadsByProdPlat('PFCC - BRASIL','META'),     invest: metaInvest['PFCC - BRASIL'] || 0, ganhos: ganhosSumByProd('PFCC - BRASIL','META'),     ganhoRows: ganhosByProd('PFCC - BRASIL','META') },
      linkedin: { ...leadsByProdPlat('PFCC - BRASIL','LINKEDIN'), invest: linkInvest['PFCC - BRASIL'] || 0, ganhos: ganhosSumByProd('PFCC - BRASIL','LINKEDIN'), ganhoRows: ganhosByProd('PFCC - BRASIL','LINKEDIN') },
      google:   { ...leadsByProdPlat('PFCC - BRASIL','GOOGLE'),   invest: googInvest['PFCC - BRASIL'] || 0, ganhos: ganhosSumByProd('PFCC - BRASIL','GOOGLE'),   ganhoRows: ganhosByProd('PFCC - BRASIL','GOOGLE') },
    },
    lean: {
      meta:     { ...leadsByProdPlat('LEAN','META'),     invest: metaInvest['LEAN'] || 0, ganhos: ganhosSumByProd('LEAN','META'),     ganhoRows: ganhosByProd('LEAN','META') },
      linkedin: { ...leadsByProdPlat('LEAN','LINKEDIN'), invest: linkInvest['LEAN'] || 0, ganhos: ganhosSumByProd('LEAN','LINKEDIN'), ganhoRows: ganhosByProd('LEAN','LINKEDIN') },
      google:   { ...leadsByProdPlat('LEAN','GOOGLE'),   invest: googInvest['LEAN'] || 0, ganhos: ganhosSumByProd('LEAN','GOOGLE'),   ganhoRows: ganhosByProd('LEAN','GOOGLE') },
    },
    ces: {
      meta:     { ...leadsByProdPlat('CES','META'),     invest: metaInvest['CES'] || 0, ganhos: ganhosSumByProd('CES','META'),     ganhoRows: ganhosByProd('CES','META') },
      linkedin: { ...leadsByProdPlat('CES','LINKEDIN'), invest: linkInvest['CES'] || 0, ganhos: ganhosSumByProd('CES','LINKEDIN'), ganhoRows: ganhosByProd('CES','LINKEDIN') },
      google:   { ...leadsByProdPlat('CES','GOOGLE'),   invest: googInvest['CES'] || 0, ganhos: ganhosSumByProd('CES','GOOGLE'),   ganhoRows: ganhosByProd('CES','GOOGLE') },
    },
    internacional: {
      latam: (() => {
        const r = leadsByProd('PFCC - LATAM');
        return { ...r, invest: totalInvest('PFCC - LATAM'), ganhos: ganhosTotalByProd('PFCC - LATAM') };
      })(),
      chile: (() => {
        const r = leadsByProd('PFCC – CHILE');
        return { ...r, invest: totalInvest('PFCC – CHILE'), ganhos: ganhosTotalByProd('PFCC – CHILE') };
      })(),
    },
  };
};

// ---- Expose helpers for use in HTML ----
window.fmtN   = fmtN;
window.fmtBRL = fmtBRL;
window.fmtPct = fmtPct;
window.SCORE_ORDER = SCORE_ORDER;
window.SLA    = SLA;
window.NOME   = NOME;
window.PRODS  = PRODS;
window.CARGO_ORDER = CARGO_ORDER;
