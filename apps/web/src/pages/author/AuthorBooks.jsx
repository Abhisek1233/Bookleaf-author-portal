import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import { Currency } from '../../components/common/Currency.jsx';
import { EmptyState, Skeleton } from '../../components/common/EmptyState.jsx';
import { Button } from '../../components/common/Button.jsx';
import {
  BookOpen,
  Search,
  Filter,
  X,
  ExternalLink,
  Layers,
  Calendar,
  DollarSign,
  Printer,
  LayoutGrid,
  List,
  CheckCircle2,
  Clock,
  HelpCircle,
  TrendingUp,
  Store,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const PRODUCTION_STAGES = [
  { id: 1, name: 'Manuscript Received', desc: 'Author submitted draft file' },
  { id: 2, name: 'Editing', desc: 'Proofing & structure check' },
  { id: 3, name: 'Cover Design', desc: 'Typography & jacket artwork' },
  { id: 4, name: 'Typesetting', desc: 'Interior layout & pagination' },
  { id: 5, name: 'Proofreading', desc: 'Final author proof approval' },
  { id: 6, name: 'ISBN Assignment', desc: 'Imprint barcode registration' },
  { id: 7, name: 'Printing', desc: 'Fulfillment run at Delhi facility' },
  { id: 8, name: 'Distribution Setup', desc: 'Amazon/Flipkart catalog feed' },
  { id: 9, name: 'Published & Live', desc: 'Available for live reader orders' }
];

export function AuthorBooks() {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedBook, setSelectedBook] = useState(null);

  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.getAuthorBooks(params);
      setBooks(res.data || []);
    } catch (err) {
      console.error('Failed to load books:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBooks();
  };

  const getStageIndex = (bookStatus) => {
    if (!bookStatus) return 1;
    if (bookStatus.includes('Published')) return 9;
    if (bookStatus.includes('Distribution')) return 8;
    if (bookStatus.includes('Printing')) return 7;
    if (bookStatus.includes('ISBN')) return 6;
    if (bookStatus.includes('Proofreading')) return 5;
    if (bookStatus.includes('Typesetting')) return 4;
    if (bookStatus.includes('Cover Design')) return 3;
    if (bookStatus.includes('Editing')) return 2;
    return 1;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Author Library
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight">
            My Published Books
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor print partner fulfillment, retail platforms, and 80/20 net profit royalty disbursements.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <div className="bg-white border border-slate-200 rounded-xl p-1 flex items-center shadow-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Data Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, ISBN, or genre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-slate-50/50"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
          >
            <option value="">All Publication Statuses</option>
            <option value="Published & Live">Published & Live</option>
            <option value="In Production - Cover Design">In Production - Cover Design</option>
            <option value="In Production - Typesetting">In Production - Typesetting</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      ) : books.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No titles found"
          description="Try broadening your search term or clearing publication status filters."
          actionLabel="Clear Filters"
          onAction={() => { setSearch(''); setStatusFilter(''); fetchBooks(); }}
        />
      ) : viewMode === 'grid' ? (
        /* Modern Card Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {books.map((b) => {
            const isLive = b.status.includes('Published');
            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Book Card Top Banner */}
                <div className="p-5 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 shadow-2xs">
                      {b.id}
                    </span>
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                      isLive
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {b.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-slate-900 tracking-tight line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {b.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">{b.genre}</p>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span className="font-mono text-[11px]">ISBN: {b.isbn}</span>
                    <span className="font-bold text-slate-900">
                      {b.mrp ? <Currency value={b.mrp} /> : <span className="text-slate-400 font-normal">Pre-Launch</span>}
                    </span>
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Copies Sold</span>
                      <span className="font-bold font-mono text-sm text-slate-900 mt-0.5 block">{b.total_copies_sold.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Earned</span>
                      <span className="font-bold text-xs text-indigo-700 mt-0.5 block"><Currency value={b.total_royalty_earned} /></span>
                    </div>
                    <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Pending</span>
                      <span className="font-bold text-xs text-amber-700 mt-0.5 block"><Currency value={b.royalty_pending} /></span>
                    </div>
                  </div>

                  {/* Platforms */}
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Live Retail Outlets
                    </span>
                    {b.available_on && b.available_on.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {b.available_on.map((p) => (
                          <span key={p} className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                            {p}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Pre-launch distribution in progress.</span>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedBook(b)}
                    >
                      Production & Royalties
                    </Button>
                    <Link to="/author/tickets/new">
                      <Button variant="ghost" size="sm" title="Raise Query for this Book">
                        <HelpCircle className="w-4 h-4 text-slate-500" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Data Table View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Title & Genre</th>
                  <th className="px-5 py-3.5">ISBN</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">MRP</th>
                  <th className="px-5 py-3.5 text-right">Copies Sold</th>
                  <th className="px-5 py-3.5 text-right">Earned</th>
                  <th className="px-5 py-3.5 text-right">Pending</th>
                  <th className="px-5 py-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {books.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 text-sm">{b.title}</div>
                      <div className="text-[11px] text-slate-500">{b.genre}</div>
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-600">{b.isbn}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                        b.status.includes('Published')
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-medium"><Currency value={b.mrp} /></td>
                    <td className="px-5 py-4 text-right font-mono font-medium">{b.total_copies_sold.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4 text-right font-bold text-indigo-700"><Currency value={b.total_royalty_earned} /></td>
                    <td className="px-5 py-4 text-right font-bold text-amber-700"><Currency value={b.royalty_pending} /></td>
                    <td className="px-5 py-4 text-center">
                      <Button size="sm" variant="secondary" onClick={() => setSelectedBook(b)}>
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Book Inspection Modal (Fixed Header/Footer, Sleek Padding, No Ugly Scrollbar Line) */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Pinned Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-white shrink-0">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-wider">
                  Catalog Entry • {selectedBook.id}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5 tracking-tight">
                  {selectedBook.title}
                </h2>
                <p className="text-xs text-slate-500">{selectedBook.genre}</p>
              </div>
              <button
                onClick={() => setSelectedBook(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Modal Body (Sleek Inner Padding, Clean Scrollbar) */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* 9-Stage Publishing Milestone Tracker (Crisp Layout, No Text Truncation) */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    Publishing Milestone Progression
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                    Active: {selectedBook.status}
                  </span>
                </div>

                {/* Milestone Stepper */}
                <div className="space-y-2">
                  {PRODUCTION_STAGES.map((st) => {
                    const currentIdx = getStageIndex(selectedBook.status);
                    const isCompleted = st.id <= currentIdx;
                    const isCurrent = st.id === currentIdx;

                    return (
                      <div
                        key={st.id}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                          isCurrent
                            ? 'bg-indigo-50 border-indigo-200'
                            : isCompleted
                            ? 'bg-white border-slate-200'
                            : 'bg-transparent border-transparent opacity-50'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            isCompleted
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : st.id}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className={`text-xs block ${isCurrent ? 'font-bold text-indigo-950' : 'font-medium text-slate-800'}`}>
                            {st.name}
                          </span>
                          <span className="text-[11px] text-slate-500 block truncate">{st.desc}</span>
                        </div>
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200 shrink-0">
                            Current Stage
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 80/20 Net Royalty Breakdown Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-indigo-600" />
                  BookLeaf 80/20 Royalty Profit Policy
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Net Profit = MRP minus In-House Printing Cost, Channel Platform Fees (Amazon/Flipkart), and Courier Shipping. Author receives <strong>80% of net profit</strong> per book.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Retail MRP</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block"><Currency value={selectedBook.mrp} /></span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Author Share / Copy</span>
                    <span className="font-bold text-indigo-700 text-sm mt-0.5 block"><Currency value={selectedBook.author_royalty_per_copy} /></span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Copies Sold</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">{selectedBook.total_copies_sold.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Pending Payout</span>
                    <span className="font-bold text-amber-700 text-sm mt-0.5 block"><Currency value={selectedBook.royalty_pending} /></span>
                  </div>
                </div>
              </div>

              {/* Retail Distribution & Print Partner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800 block mb-2">Print & Fulfillment Partner</span>
                  <p className="text-slate-600 font-medium">{selectedBook.print_partner || 'In-House Delhi Facility'}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Standard print turnaround: 5–7 business days.</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800 block mb-2">Retail Platforms</span>
                  {selectedBook.available_on && selectedBook.available_on.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedBook.available_on.map((p) => (
                        <span key={p} className="px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200 text-[11px] font-medium">
                          {p}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">Listing propagation pending.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Pinned Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <Link to="/author/tickets/new">
                <Button variant="primary" size="sm" icon={HelpCircle}>
                  Ask Support About This Book
                </Button>
              </Link>
              <Button variant="secondary" size="sm" onClick={() => setSelectedBook(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
