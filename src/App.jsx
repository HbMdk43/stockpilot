import { useEffect, useMemo, useState } from 'react';
import { supabase } from './lib/supabase';

const baseArticles = [
  { id: 1, reference: 'MAG-001', designation: 'Toner HP 19A', category: 'Consommables informatiques', location: 'Magasin informatique', stock: 8, seuil: 4, unit: 'unité', tracking_type: 'consommable' },
  { id: 2, reference: 'MAG-002', designation: 'Carton de câble RJ45', category: 'Câbles & accessoires', location: 'Magasin informatique', stock: 12, seuil: 6, unit: 'carton', tracking_type: 'consommable' },
  { id: 3, reference: 'AST-010', designation: 'Ordinateur portable Dell', category: 'Équipements informatiques', location: 'Direction générale', stock: 1, seuil: 0, unit: 'unité', tracking_type: 'actif' },
  { id: 4, reference: 'MAG-003', designation: 'Onduleur APC', category: 'Équipements informatiques', location: 'Salle serveur', stock: 2, seuil: 0, unit: 'unité', tracking_type: 'actif' },
  { id: 5, reference: 'MAG-004', designation: 'Adaptateur USB-C', category: 'Câbles & accessoires', location: 'Comptabilité', stock: 14, seuil: 7, unit: 'unité', tracking_type: 'consommable' },
];

const formatCurrency = (v) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(v);

export default function App() {
  const [articles, setArticles] = useState(baseArticles);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [location, setLocation] = useState('all');
  const [activeView, setActiveView] = useState('dashboard');
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
    const load = async () => {
      setLoading(true);
      try {
        if (supabase) {
          const { data, error } = await supabase.from('articles').select('*');
          if (!error && data && data.length) {
            const mapped = data.map((item) => ({
              id: item.id,
              reference: item.reference,
              designation: item.designation,
              category: item.category || 'Consommables informatiques',
              location: item.location || 'Magasin informatique',
              stock: Number(item.stock ?? 0),
              seuil: Number(item.seuil ?? 0),
              unit: item.unit || 'unité',
              tracking_type: item.tracking_type || 'consommable',
            }));
            setArticles(mapped);
          }
        }
      } catch (e) {
        console.warn('Supabase unavailable, using demo data', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const categories = useMemo(() => ['all', ...new Set(articles.map((a) => a.category))], [articles]);
  const locations = useMemo(() => ['all', ...new Set(articles.map((a) => a.location))], [articles]);

  const filteredArticles = articles.filter((article) => {
    const text = `${article.reference} ${article.designation}`.toLowerCase();
    const queryOk = query === '' || text.includes(query.toLowerCase());
    const catOk = category === 'all' || article.category === category;
    const locOk = location === 'all' || article.location === location;
    return queryOk && catOk && locOk;
  });

  const totalStock = articles.reduce((sum, article) => sum + article.stock, 0);
  const totalValue = articles.reduce((sum, article) => sum + article.stock * 12000, 0);
  const alerts = articles.filter((article) => article.stock <= article.seuil).length;

  const saveArticle = async () => {
    const payload = {
      reference: form.reference,
      designation: form.designation,
      category: form.category,
      location: form.location,
      stock: Number(form.stock),
      seuil: Number(form.seuil),
      unit: form.unit,
      tracking_type: form.tracking_type,
    };

    if (!payload.reference || !payload.designation) {
      setStatusMessage('Référence et désignation obligatoires.');
      return;
    }

    if (supabase) {
      const { error } = await supabase.from('articles').insert([payload]);
      if (!error) {
        setArticles((prev) => [
          ...prev,
          { id: Date.now(), ...payload },
        ]);
        setStatusMessage('Article enregistré dans Supabase.');
      } else {
        setStatusMessage('Erreur Supabase : ' + error.message);
      }
    } else {
      setArticles((prev) => [
        ...prev,
        { id: Date.now(), ...payload },
      ]);
      setStatusMessage('Article ajouté au mode démonstration (Supabase non connecté).');
    }

    setForm({ reference: '', designation: '', category: 'Consommables informatiques', location: 'Magasin informatique', stock: 0, seuil: 1, unit: 'unité', tracking_type: 'consommable' });
    setShowNewForm(false);
  };

  const addMovement = async (articleId, delta) => {
    const article = articles.find((item) => item.id === articleId);
    if (!article) return;

    const updated = { ...article, stock: Math.max(0, article.stock + delta) };

    if (supabase) {
      const { error } = await supabase.from('articles').update({ stock: updated.stock }).eq('reference', article.reference);
      if (error) {
        setStatusMessage('Mouvement non enregistré dans Supabase : ' + error.message);
        return;
      }
    }

    setArticles((prev) => prev.map((item) => item.id === articleId ? updated : item));
    setStatusMessage(`Mouvement appliqué : ${article.designation} (${delta > 0 ? '+' : ''}${delta}).`);
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">S</div>
          <div>
            <strong>StockPilot</strong>
            <small>Parc • Stocks • Inventaires</small>
          </div>
        </div>

        <nav className="nav">
          {['dashboard', 'articles', 'inventory', 'reports'].map((view) => (
            <button
              key={view}
              className={activeView === view ? 'nav-btn active' : 'nav-btn'}
              onClick={() => setActiveView(view)}
            >
              {view === 'dashboard' && 'Tableau de bord'}
              {view === 'articles' && 'Articles'}
              {view === 'inventory' && 'Inventaires'}
              {view === 'reports' && 'Rapports'}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="search-box">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un article…" />
          </div>
          <div className="top-actions">
            <button className="btn secondary" onClick={() => setShowNewForm((prev) => !prev)}>
              {showNewForm ? 'Fermer' : '+ Nouvel article'}
            </button>
            <button className="btn primary" onClick={() => setStatusMessage('Connexion Supabase active.')}>
              Connecté Supabase
            </button>
          </div>
        </header>

        {statusMessage && <div className="toast">{statusMessage}</div>}

        {activeView === 'dashboard' && (
          <section className="page">
            <div className="page-head">
              <div>
                <h1>Tableau de bord</h1>
                <small>Vue globale du stock et du parc informatique</small>
              </div>
            </div>

            <div className="stats-grid">
              <StatCard label="Valeur stock" value={formatCurrency(totalValue)} note="Estimation" />
              <StatCard label="Références" value={articles.length.toString()} note="Articles suivis" />
              <StatCard label="Qté totale" value={totalStock.toString()} note="Unités physiques" />
              <StatCard label="Alertes" value={alerts.toString()} note="Seuil atteint" />
            </div>

            <div className="panel">
              <h3>Articles à surveiller</h3>
              <div className="list">
                {articles.filter((a) => a.stock <= a.seuil).slice(0, 5).map((article) => (
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
                  <button className="btn primary" onClick={saveArticle}>Enregistrer</button>
                </div>
              </div>
            )}

            <div className="toolbar-row">
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="all">Toutes catégories</option>
                {categories.filter((v) => v !== 'all').map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
              <select value={location} onChange={(e) => setLocation(e.target.value)}>
                <option value="all">Tous emplacements</option>
                {locations.filter((v) => v !== 'all').map((v) => (
                  <option key={v} value={v}>{v}</option>
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
                        <button onClick={() => addMovement(article.id, 1)}>+1</button>
                        <button onClick={() => addMovement(article.id, -1)}>-1</button>
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
                <small>Suivi des campagnes de comptage</small>
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
              </div>
            </div>
          </section>
        )}

        {loading && <div className="loader">Chargement…</div>}
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
