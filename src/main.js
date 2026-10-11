import './style.css';

const steps = [
  { number: '01', label: 'Profil', title: 'Parlons de toi', intro: 'Les recruteurs doivent comprendre qui tu es en quelques secondes.' },
  { number: '02', label: 'Parcours', title: 'Ce que tu as construit', intro: 'Même un projet académique peut devenir une preuve concrète de ta valeur.' },
  { number: '03', label: 'Compétences', title: 'Ce que tu sais faire', intro: 'Mets en avant les compétences qui serviront vraiment au poste visé.' },
  { number: '04', label: 'Offre', title: 'Le stage que tu vises', intro: 'Colle l’annonce LinkedIn, Tanitjobs ou autre. On la décortique ensemble.' },
];

const state = {
  currentStep: 0,
  form: {
    firstName: '', lastName: '', title: 'Étudiant(e) en informatique', email: '', phone: '', city: '', linkedin: '', summary: '',
    school: '', degree: '', graduation: '', experience: '', projects: '', skills: '', languages: 'Français — courant\nAnglais — professionnel',
    offer: '', targetRole: '', company: '', availability: '',
  },
};

const saved = localStorage.getItem('cv-studio-draft');
if (saved) Object.assign(state.form, JSON.parse(saved));

const app = document.querySelector('#app');

function escapeHtml(value = '') {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[character]));
}

function words(text) {
  const stopWords = new Set(['avec', 'pour', 'dans', 'vous', 'nous', 'une', 'des', 'les', 'sur', 'stage', 'poste', 'profil', 'mission', 'votre', 'notre', 'être', 'aux', 'qui', 'que', 'par', 'and', 'the', 'with', 'from', 'your']);
  return [...new Set((text.toLowerCase().match(/[a-zà-ÿ][a-zà-ÿ+#.-]{2,}/gi) || []).filter((word) => word.length > 2 && !stopWords.has(word)))];
}

function relevantOfferWords(text) {
  const knownTerms = ['javascript', 'typescript', 'react', 'vue', 'angular', 'node.js', 'node', 'python', 'java', 'php', 'sql', 'nosql', 'mongodb', 'git', 'docker', 'kubernetes', 'linux', 'figma', 'html', 'css', 'api', 'rest', 'agile', 'scrum', 'anglais', 'français', 'communication', 'autonomie', 'équipe', 'testing', 'tests', 'cloud', 'azure', 'aws'];
  const allWords = words(text);
  const known = allWords.filter((word) => knownTerms.includes(word));
  return [...new Set(known.length ? known : allWords.filter((word) => word.length > 4))].slice(0, 16);
}

function render() {
  const step = steps[state.currentStep];
  app.innerHTML = `
    <div class="shell">
      <header class="topbar">
        <a class="brand" href="#" aria-label="CV Studio, accueil"><span class="brand-mark">cv<span>/</span></span><span>studio</span></a>
        <div class="topbar-meta"><span class="save-dot"></span> Brouillon sauvegardé automatiquement <span class="topbar-divider"></span><span>FR</span></div>
      </header>
      <main class="workspace">
        <aside class="sidebar">
          <div class="side-intro"><span class="eyebrow">Ton atelier de candidature</span><h1>Un CV qui te ressemble.<br><em>Et qui passe le filtre.</em></h1><p>On transforme ton parcours en une candidature claire, crédible et adaptée à ton stage PFE.</p></div>
          <nav class="step-nav" aria-label="Étapes du CV">${steps.map((item, index) => `<button class="step-link ${index === state.currentStep ? 'active' : ''} ${index < state.currentStep ? 'done' : ''}" data-step="${index}"><span class="step-number">${index < state.currentStep ? '✓' : item.number}</span><span>${item.label}</span><span class="step-arrow">→</span></button>`).join('')}</nav>
          <div class="side-note"><span class="note-icon">✦</span><p><strong>Conseil du jour</strong><br>Un bon CV ne raconte pas tout. Il donne envie de poser la prochaine question.</p></div>
          <div class="sidebar-foot">CV Studio <span>•</span> édition 2026</div>
        </aside>
        <section class="form-area">
          <div class="mobile-progress"><span>Étape ${state.currentStep + 1} sur ${steps.length}</span><div><i style="width:${((state.currentStep + 1) / steps.length) * 100}%"></i></div></div>
          <div class="form-heading"><div><span class="eyebrow">Étape ${step.number} / 04</span><h2>${step.title}</h2><p>${step.intro}</p></div><div class="live-tag"><span></span> Aperçu en direct</div></div>
          <form id="cv-form">${renderStep(state.currentStep)}<div class="form-actions"><button type="button" class="button ghost" id="back" ${state.currentStep === 0 ? 'disabled' : ''}>← Retour</button><button class="button primary" type="submit">${state.currentStep === steps.length - 1 ? 'Voir mon analyse' : 'Continuer'} <span>→</span></button></div></form>
        </section>
        <aside class="preview-area"><div class="preview-head"><div><span class="eyebrow">Document en construction</span><h3>Aperçu du CV</h3></div><span class="page-count">A4 · 01</span></div><div class="cv-paper">${renderCv()}</div><div class="preview-foot"><span class="pulse"></span> Les changements apparaissent ici en direct</div></aside>
      </main>
    </div>`;
  bind();
}

function input(label, key, placeholder, type = 'text', wide = false) {
  return `<label class="field ${wide ? 'wide' : ''}"><span>${label}</span><input type="${type}" data-key="${key}" value="${escapeHtml(state.form[key])}" placeholder="${placeholder}"></label>`;
}

function textarea(label, key, placeholder, wide = false) {
  return `<label class="field ${wide ? 'wide' : ''}"><span>${label}</span><textarea data-key="${key}" placeholder="${placeholder}">${escapeHtml(state.form[key])}</textarea></label>`;
}

function renderStep(index) {
  if (index === 0) return `<div class="section-label">Identité & contact <span>Obligatoire</span></div><div class="fields-grid">${input('Prénom', 'firstName', 'Ex. Yassine')}${input('Nom', 'lastName', 'Ex. Ben Ali')}${input('Titre recherché', 'title', 'Ex. Développeur web junior', 'text', true)}${input('Adresse e-mail', 'email', 'prenom@email.com', 'email')}${input('Téléphone', 'phone', '+216 20 000 000')}${input('Ville / pays', 'city', 'Ex. Tunis, Tunisie')}${input('LinkedIn ou portfolio', 'linkedin', 'linkedin.com/in/tonnom', 'text', true)}${textarea('Ton résumé en quelques mots', 'summary', 'Quel domaine t’attire ? Qu’est-ce qui te distingue ? (3 à 4 lignes)', true)}</div>`;
  if (index === 1) return `<div class="section-label">Parcours <span>Commence par le plus récent</span></div><div class="fields-grid">${input('Établissement', 'school', 'Ex. ESPRIT')}${input('Formation / diplôme', 'degree', 'Ex. Cycle ingénieur informatique')}${input('Date prévue du diplôme', 'graduation', 'Ex. Juin 2026')}${input('Disponibilité pour le stage', 'availability', 'Ex. Février — Juin 2026')}${textarea('Expériences', 'experience', 'Entreprise — rôle — dates\n• Ce que tu as réalisé et le résultat obtenu\n\nPas encore d’expérience ? Décris un projet associatif, freelance ou personnel.', true)}${textarea('Projets dont tu es fier·e', 'projects', 'Nom du projet — technologie\n• Problème résolu, ta contribution, résultat', true)}</div>`;
  if (index === 2) return `<div class="section-label">Compétences & signaux forts <span>Sois précis·e</span></div><div class="fields-grid">${textarea('Compétences techniques', 'skills', 'Ex. JavaScript, React, Python, SQL, Git\nSépare les compétences par des virgules.', true)}${textarea('Langues', 'languages', 'Ex. Français — courant\nAnglais — professionnel', true)}<div class="tip-box wide"><span>✦</span><div><strong>Le détail qui fait la différence</strong><p>Un outil seul ne suffit pas. Ajoute ce que tu as construit avec lui : « API REST développée avec Node.js » est plus parlant que « Node.js ».</p></div></div></div>`;
  return `<div class="section-label">L’annonce cible <span>Dernière étape</span></div><div class="fields-grid">${input('Intitulé du poste', 'targetRole', 'Ex. Stage PFE — Développeur Full Stack')}${input('Entreprise', 'company', 'Ex. Startup ou groupe')}${textarea('Colle ici l’annonce complète', 'offer', 'Copie le texte de l’annonce depuis LinkedIn, Tanitjobs ou le site de l’entreprise.\n\nNous repérerons les compétences demandées et les comparerons à ton profil.', true)}<div class="paste-hint wide"><span>⌘</span><p>Plus l’annonce est complète, plus l’analyse sera juste. Les éléments comme les missions, technologies et langues sont particulièrement utiles.</p></div></div>`;
}

function renderCv() {
  const f = state.form;
  const name = `${f.firstName || 'Prénom'} ${f.lastName || 'Nom'}`;
  const skillList = words(f.skills).slice(0, 9);
  const projectText = f.projects.split('\n').filter(Boolean).slice(0, 3).join(' ') || 'Tes projets et réalisations apparaîtront ici.';
  return `<div class="cv-header"><div><h4>${escapeHtml(name)}</h4><p>${escapeHtml(f.title || 'Titre professionnel')}</p></div><div class="cv-contact">${escapeHtml(f.email || 'email@exemple.com')}<br>${escapeHtml(f.phone || '+216 00 000 000')}<br>${escapeHtml(f.city || 'Tunis, Tunisie')}</div></div><div class="cv-rule"></div><section><h5>Profil</h5><p>${escapeHtml(f.summary || 'Un résumé professionnel clair et ciblé donnera ici envie d’en savoir plus sur ton parcours.')}</p></section><section><h5>Formation</h5><p><strong>${escapeHtml(f.degree || 'Formation / diplôme')}</strong><br>${escapeHtml(f.school || 'Établissement')} · ${escapeHtml(f.graduation || 'Année')}</p></section><section><h5>Expérience & projets</h5><p>${escapeHtml(f.experience || projectText)}</p></section><section><h5>Compétences</h5><div class="cv-skills">${(skillList.length ? skillList : ['Tes compétences']).map((skill) => `<span>${escapeHtml(skill)}</span>`).join('')}</div></section>`;
}

function bind() {
  document.querySelectorAll('[data-key]').forEach((field) => field.addEventListener('input', (event) => { state.form[event.target.dataset.key] = event.target.value; localStorage.setItem('cv-studio-draft', JSON.stringify(state.form)); render(); }));
  document.querySelectorAll('[data-step]').forEach((button) => button.addEventListener('click', () => { state.currentStep = Number(button.dataset.step); render(); }));
  document.querySelector('#back')?.addEventListener('click', () => { state.currentStep -= 1; render(); });
  document.querySelector('#cv-form')?.addEventListener('submit', (event) => { event.preventDefault(); if (state.currentStep < steps.length - 1) { state.currentStep += 1; render(); } else renderAnalysis(); });
}

function renderAnalysis() {
  const profile = words(`${state.form.skills} ${state.form.projects} ${state.form.experience}`);
  const offerWords = relevantOfferWords(state.form.offer);
  const matched = offerWords.filter((word) => profile.includes(word)).slice(0, 8);
  const missing = offerWords.filter((word) => !profile.includes(word)).slice(0, 6);
  const score = offerWords.length ? Math.round((matched.length / offerWords.length) * 100) : 0;
  app.innerHTML = `<div class="analysis-page"><header class="topbar"><a class="brand" href="#" onclick="location.reload()"><span class="brand-mark">cv<span>/</span></span><span>studio</span></a><button class="button ghost" id="edit-profile">← Modifier mon profil</button></header><main class="analysis-content"><div class="analysis-title"><span class="eyebrow">Diagnostic terminé</span><h1>Ton profil face à <em>${escapeHtml(state.form.targetRole || 'cette opportunité')}</em></h1><p>Voici une première lecture de compatibilité basée sur les compétences et qualités détectées dans l’annonce.</p></div><div class="analysis-grid"><div class="score-card"><span class="eyebrow">Score de correspondance</span><div class="score-ring"><strong>${score}<small>%</small></strong></div><h3>${score >= 70 ? 'Une base prometteuse' : score >= 40 ? 'Quelques ajustements nécessaires' : 'Profil à renforcer'}</h3><p>${offerWords.length ? `Nous avons comparé ${offerWords.length} critères utiles de l’annonce avec ton profil.` : 'Ajoute une annonce complète pour obtenir un score fiable.'}</p></div><div class="match-card"><div class="card-title"><span class="icon-box">✓</span><div><span class="eyebrow">Points forts repérés</span><h3>Ce qui colle à l’annonce</h3></div></div><div class="chips">${(matched.length ? matched : ['Ajoute tes compétences', 'Décris tes projets']).map((item) => `<span class="chip good">${escapeHtml(item)} <b>✓</b></span>`).join('')}</div><div class="card-title missing-title"><span class="icon-box warn">!</span><div><span class="eyebrow">À vérifier ou compléter</span><h3>Ce que le recruteur pourrait chercher</h3></div></div><div class="chips">${(missing.length ? missing : ['Aucun critère détecté']).map((item) => `<span class="chip missing">${escapeHtml(item)}</span>`).join('')}</div></div></div><div class="next-step"><div><span class="eyebrow">Ton document est prêt</span><h3>Génère une version à envoyer.</h3><p>Le fichier HTML est lisible par les ATS et peut être imprimé en PDF depuis ton navigateur.</p></div><div class="analysis-actions"><button class="button ghost" id="print-cv">Imprimer / PDF</button><button class="button primary" id="download-cv">Télécharger le CV <span>↓</span></button></div></div></main></div>`;
  document.querySelector('#edit-profile').addEventListener('click', () => { state.currentStep = 0; render(); });
  document.querySelector('#download-cv').addEventListener('click', downloadCv);
  document.querySelector('#print-cv').addEventListener('click', printCv);
}

function cvDocument() {
  const f = state.form;
  const skillList = words(f.skills).slice(0, 14);
  const section = (title, content) => content ? `<section><h2>${title}</h2>${content}</section>` : '';
  const bullets = (text) => text.split('\n').filter(Boolean).map((line) => `<p>${escapeHtml(line.replace(/^[•-]\s*/, ''))}</p>`).join('');
  return `<!doctype html><html lang="fr"><head><meta charset="UTF-8"><title>CV - ${escapeHtml(f.firstName)} ${escapeHtml(f.lastName)}</title><style>body{font-family:Arial,sans-serif;color:#26352d;max-width:780px;margin:48px auto;padding:0 28px;line-height:1.5}header{display:flex;justify-content:space-between;border-bottom:3px solid #1f6b52;padding-bottom:20px}h1{color:#1f6b52;margin:0 0 5px;font-size:30px}header p{margin:0;color:#65756b}address{text-align:right;font-style:normal;font-size:13px;color:#65756b;line-height:1.6}h2{font-size:13px;text-transform:uppercase;letter-spacing:.1em;color:#1f6b52;border-bottom:1px solid #d9e4dc;padding-bottom:6px;margin:25px 0 9px}p{font-size:14px;margin:4px 0}.skills{display:flex;flex-wrap:wrap;gap:7px}.skills span{background:#e5f3e9;color:#1f6b52;padding:5px 9px;font-size:12px}@media print{body{margin:20mm auto}}</style></head><body><header><div><h1>${escapeHtml(`${f.firstName || 'Prénom'} ${f.lastName || 'Nom'}`)}</h1><p>${escapeHtml(f.title || 'Étudiant(e) en informatique')}</p></div><address>${escapeHtml(f.email)}<br>${escapeHtml(f.phone)}<br>${escapeHtml(f.city)}<br>${escapeHtml(f.linkedin)}</address></header>${section('Profil', `<p>${escapeHtml(f.summary)}</p>`)}${section('Formation', `<p><strong>${escapeHtml(f.degree)}</strong><br>${escapeHtml(f.school)} · ${escapeHtml(f.graduation)}</p>`)}${section('Expérience', bullets(f.experience))}${section('Projets', bullets(f.projects))}${section('Compétences', `<div class="skills">${skillList.map((skill) => `<span>${escapeHtml(skill)}</span>`).join('')}</div>`)}${section('Langues', bullets(f.languages))}</body></html>`;
}

function downloadCv() {
  const blob = new Blob([cvDocument()], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `CV-${state.form.firstName || 'candidat'}-${state.form.lastName || ''}.html`;
  link.click();
  URL.revokeObjectURL(url);
}

function printCv() {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  printWindow.document.write(cvDocument());
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

render();