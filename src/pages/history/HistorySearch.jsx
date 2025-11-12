import { useState } from 'react';
import { Search, Calendar, X } from 'lucide-react';

/**
 * Componente de búsqueda para filtrar el historial
 * Permite buscar por palabras clave y filtrar por fechas
 */
export default function HistorySearch({ onSearch, onDateFilter }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleDateFilter = () => {
    onDateFilter({ startDate, endDate });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    onSearch('');
    onDateFilter({ startDate: '', endDate: '' });
  };

  return (
    <div className="card rounded-2xl shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-orange-500 mb-4 flex items-center gap-2">
        <Search size={20} />
        Buscar en el historial
      </h2>

      <form onSubmit={handleSearch} className="space-y-4">
        {/* Búsqueda por palabra clave */}
        <div>
          <label className="block text-sm font-medium mb-2">Buscar por palabra clave</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar en conversaciones..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Buscar
            </button>
          </div>
        </div>

        {/* Filtro por fecha */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-1">
              <Calendar size={16} />
              Fecha inicio
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-1">
              <Calendar size={16} />
              Fecha fin
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleDateFilter}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Aplicar fechas
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            <X size={16} />
            Limpiar filtros
          </button>
        </div>
      </form>
    </div>
  );
}
