import { useEffect, useMemo, useState } from 'react';
import { supabase } from './lib/supabase';

const sampleArticles = [
  { id: 1, reference: 'MAG-001', designation: 'Toner HP 19A', category: 'Consommables informatiques', location: 'Magasin informatique', stock: 8, seuil: 4, unit: 'unité', tracking_type: 'consommable' },
  { id: 2, reference: 'MAG-002', designation: 'Carton de câble RJ45', category: 'Câbles & accessoires', location: 'Magasin informatique', stock: 12, seuil: 6, unit: 'carton', tracking_type: 'consommable' },
  { id: 3, reference: 'AST-010', designation: 'Ordinateur portable Dell', category: 'Équipements informatiques', location: 'Direction générale', stock: 1, seuil: 0, unit: 'unité', tracking_type: 'actif' },
  { id: 4, reference: 'MAG-003', designation: 'Onduleur APC', category: 'Équipements informatiques', location: 'Salle serveur', stock: 2, seuil: 0, unit: 'unité', tracking_type: 'actif' },
  { id: 5, reference: 'MAG-004', designation: 'Adaptateur USB-C', category: 'Câbles & accessoires', location: 'Comptabilité', stock: 14, seuil: 7, unit: 'unité', tracking_type: 'consommable' },
  { id: 6, reference: 'MAG-005', designation: 'Clavier sans fil', category: 'Équipements informatiques', location: 'Magasin informatique', stock: 6, seuil: 2, unit: 'unité', tracking_type: 'actif' },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0,
  }).format(value);

export default function App() {
  const [articles, setArticles] = useState(sampleArticles);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [showNewForm, setShowNewForm] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [form, setForm] = useState({
    reference: '',
    designation: '',
    category: 'Consommables informatiques',
    location: 'Magasin informatique',
    stock: 0,
    seuil: 1,
    unit: 'unité',
    tracking_type: 'consommable',
  });

  useEffect(() => {
    const loadArticles = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/articles');
        if (res.ok) {
          const payload = await res.json();
          if (Array.isArray(payload) && payload.length > 0) {
            setArticles(payload);
          }
        } else if (supabase) {
          const { data, error } = await supabase.from('articles').select('*');
          if (!error && Array.isArray(data) && data.length > 0) {
            setArticles(data.map((item) => ({
              id: item.id,
              reference: item.reference,
              designation: item.designation,
              category: item.category || 'Consommables informatiques',
              location: item.location || 'Magasin informatique',
              stock: Number(item.stock ?? 0),
              seuil: Number(item.seuil ?? 0),
              unit: item.unit || 'unité',
              tracking_type: item.tracking_type || 'consommable',
            })));
          }
        }
      } catch (e) {
        console.warn('Données de démonstration utilisées.', e);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, []);

  const categories = useMemo(
    () => ['all', ...new Set(articles.map((article) => article.category))],
    [articles]
  );

  const locations = useMemo(
    () => ['all', ...new Set(articles.map((article) => article.location))],
    [articles]
  );

  const filteredArticles = articles.filter((article) => {
    const matchesText =
      query.trim() === '' ||
      `${article.reference} ${article.designation}`.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || article.category === categoryFilter;
    const matchesLocation = locationFilter === 'all' || article.location === locationFilter;
    return matchesText && matchesCategory && matchesLocation;
  });

  const totalStock = articles.reduce((sum, article) => sum + article.stock, 0);
  const totalValue = articles.reduce((sum, article) => sum + article.stock * 12000, 0);
  const alerts = articles.filter((article) => article.stock <= article.seuil).length;

  const addArticle = async () => {
    const item = {
      reference: form.reference.trim(),
      designation: form.designation.trim(),
      category: form.category,
      location: form.location,
      stock: Number(form.stock) || 0,
      seuil: Number(form.seuil) || 0,
      unit: form.unit,
      tracking_type: form.tracking_type,
    };

    if (!item.reference || !item.designation) {
      setStatusMessage('Référence et designation obligatoires.');
      return;
    }

    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error || 'Erreur API');
      }

      setArticles((prev) => [...prev, { id: Date.now(), ...item }]);
      setStatusMessage('Article enregistré avec succès.');
      setForm({
        reference: '',
        designation: '',
        category: 'Consommables informatiques',
        location: 'Magasin informatique',
        stock: 0,
        seuil: 1,
        unit: 'unité',
        tracking_type: 'consommable',
      });
      setShowNewForm(false);
    } catch (error) {
      setStatusMessage('Erreur API : ' + error.message);
    }
  };

  const updateStock = async (articleId, delta) => {
    const article = articles.find((item) => item.id === articleId);
    if (!article) return;

    const nextStock = Math.max(0, article.stock + delta);

    try {
      const res = await fetch('/api/articles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: article.reference, stock: nextStock }),
      });

      if (!res.ok) {
        throw new Error('Mouvement non enregistré');
      }

      setArticles((prev) =>
        prev.map((item) => (item.id === articleId ? { ...item, stock: nextStock } : item))
      );
      setStatusMessage(`Mouvement appliqué : ${article.designation} (${delta > 0 ? '+' : ''}${delta}).`);
    } catch (error) {
      setStatusMessage('Impossible de mettre à jour le stock : ' + error.message);
    }
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">S</div>
          <div className="brand-copy">
            <strong>StockPilot</strong>
            <small>Magasin • Parc • Inventaire</small>
          </div>
        </div>

        <nav className="nav">
          {[
            { key: 'dashboard', label: 'Tableau de bord' },
            { key: 'articles', label: 'Articles & stock' },
            { key: 'inventory', label: 'Inventaires' },
            { key: 'alerts', label: 'Alertes' },
            { key: 'reports', label: 'Rapports' },
          ].map((nav) => (
            <button
              key={nav.key}
              className={activeView === nav.key ? 'nav-btn active' : 'nav-btn'}
              onClick={() => setActiveView(nav.key)}
            >
              {nav.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="search-box">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un article, référence…"
            />
          </div>
          <div className="top-actions">
            <button className="btn secondary" onClick={() => setShowNewForm((prev) => !prev)}>
              {showNewForm ? 'Fermer' : '+ Nouvel article'}
            </button>
            <button className="btn primary" onClick={() => setStatusMessage('Connexion Supabase prête pour le test.')}>Supabase OK</button>
          </div>
        </header>

        {statusMessage && <div className="toast">{statusMessage}</div>}

        {activeView === 'dashboard' && (
          <section className="page">
            <div className="page-head">
              <div>
                <h1>Tableau de bord</h1>
                <small>Vue d’ensemble des stocks, alertes et parc informatique</small>
              </div>
            </div>

            <div className="stats-grid">
              <StatCard label="Valeur stock" value={formatCurrency(totalValue)} note="Estimation" />
              <StatCard label="Articles" value={String(articles.length)} note="Références suivies" />
              <StatCard label="Qté totale" value={String(totalStock)} note="Unités physiques" />
              <StatCard label="Alertes" value={String(alerts)} note="Seuil atteint" />
            </div>

            <div className="panel">
              <h3>Articles nécessitant une action</h3>
              <div className="list">
                {articles.filter((article) => article.stock <= article.seuil).slice(0, 6).map((article) => (
                  <div key={article.id} className="mini-row">
                    <div>
                      <strong>{article.designation}</strong>
                      <small>{article.reference} • {article.location}</small>
                    </div>
                    <span className={`badge ${article.stock === 0 ? 'critical' : 'warning'}`}>
                      {article.stock} {article.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeView === 'articles' && (
          <section className="page">
            <div className="page-head">
              <div>
                <h1>Articles & stock</h1>
                <small>{filteredArticles.length} article(s) affiché(s)</small>
              </div>
            </div>

            {showNewForm && (
              <div className="panel form-panel">
                <h3>Créer un article</h3>
                <div className="form-grid">
                  <input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="Référence" />
                  <input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="Désignation" />
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option>Consommables informatiques</option>
                    <option>Équipements informatiques</option>
                    <option>Câbles & accessoires</option>
                  </select>
                  <select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}>
                    <option>Magasin informatique</option>
                    <option>Comptabilité</option>
                    <option>Direction générale</option>
                    <option>Salle serveur</option>
                  </select>
                  <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} placeholder="Stock" />
                  <input type="number" value={form.seuil} onChange={(e) => setForm({ ...form, seuil: Number(e.target.value) })} placeholder="Seuil" />
                  <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                    <option>unité</option>
                    <option>carton</option>
                    <option>lot</option>
                  </select>
                  <select value={form.tracking_type} onChange={(e) => setForm({ ...form, tracking_type: e.target.value })}>
                    <option value="consommable">Consommable</option>
                    <option value="actif">Actif fixe</option>
                  </select>
                </div>
                <div className="actions-row">
                  <button className="btn primary" onClick={addArticle}>Enregistrer</button>
                </div>
              </div>
            )}

            <div className="toolbar-row">
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="all">Toutes catégories</option>
                {categories.filter((c) => c !== 'all').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
                <option value="all">Tous emplacements</option>
                {locations.filter((l) => l !== 'all').map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div className="panel">
              <table>
                <thead>
                  <tr>
                    <th>Réf.</th>
                    <th>Désignation</th>
                    <th>Catégorie</th>
                    <th>Emplacement</th>
                    <th>Stock</th>
                    <th>Seuil</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredArticles.map((article) => (
                    <tr key={article.id}>
                      <td>{article.reference}</td>
                      <td>{article.designation}</td>
                      <td>{article.category}</td>
                      <td>{article.location}</td>
                      <td>{article.stock} {article.unit}</td>
                      <td>{article.seuil} {article.unit}</td>
                      <td className="action-cell">
                        <button onClick={() => updateStock(article.id, 1)}>+1</button>
                        <button onClick={() => updateStock(article.id, -1)}>-1</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeView === 'inventory' && (
          <section className="page">
            <div className="page-head">
              <div>
                <h1>Inventaires</h1>
                <small>Campagnes de comptage et écarts</small>
              </div>
            </div>
            <div className="panel">
              <ul className="simple-list">
                <li>Campagne mensuelle magasin informatique — 78% avancé</li>
                <li>Inventaire du parc bureau — 62% avancé</li>
                <li>Audit des serveurs — 90% avancé</li>
              </ul>
            </div>
          </section>
        )}

        {activeView === 'alerts' && (
          <section className="page">
            <div className="page-head">
              <div>
                <h1>Alertes</h1>
                <small>Suivi des articles au seuil ou en rupture</small>
              </div>
            </div>
            <div className="panel">
              {articles.filter((a) => a.stock <= a.seuil).length === 0 ? (
                <p>Aucune alerte active.</p>
              ) : (
                <div className="list">
                  {articles.filter((a) => a.stock <= a.seuil).map((article) => (
                    <div key={article.id} className="mini-row">
                      <div>
                        <strong>{article.designation}</strong>
                        <small>{article.reference} • {article.location}</small>
                      </div>
                      <span className="badge warning">{article.stock} / {article.seuil}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {activeView === 'reports' && (
          <section className="page">
            <div className="page-head">
              <div>
                <h1>Rapports</h1>
                <small>État du stock et synthèse</small>
              </div>
            </div>
            <div className="panel">
              <div className="report-box">
                <strong>État du stock</strong>
                <p>Valeur totale : {formatCurrency(totalValue)}</p>
                <p>Articles suivis : {articles.length}</p>
                <p>Alertes : {alerts}</p>
                <p>Quantité totale : {totalStock}</p>
              </div>
            </div>
          </section>
        )}

        {loading && <div className="loader">Chargement des données…</div>}
      </main>
    </div>
  );
}

function StatCard({ label, value, note }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}
