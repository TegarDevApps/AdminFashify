// DashboardFilter.jsx - Enhanced filter component
import { useState, useEffect } from "react";
import { Calendar, ChevronDown, Check } from "lucide-react";
import PropTypes from "prop-types";

export const DashboardFilter = ({ onFilterChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState("all");
    const [customDateRange, setCustomDateRange] = useState({ start: "", end: "" });
    const [showDateRange, setShowDateRange] = useState(false);

    // Handle filter change and send data to parent component
    const handleFilterChange = (filterType) => {
        setSelectedFilter(filterType);
        setIsOpen(false);

        let startDate = null;
        let endDate = null;
        const today = new Date();
        
        // Calculate date ranges based on filter type
        switch (filterType) {
            case "today":
                startDate = new Date();
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date();
                endDate.setHours(23, 59, 59, 999);
                break;
            case "yesterday":
                startDate = new Date();
                startDate.setDate(today.getDate() - 1);
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date();
                endDate.setDate(today.getDate() - 1);
                endDate.setHours(23, 59, 59, 999);
                break;
            case "7days":
                startDate = new Date();
                startDate.setDate(today.getDate() - 7);
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date();
                endDate.setHours(23, 59, 59, 999);
                break;
            case "30days":
                startDate = new Date();
                startDate.setDate(today.getDate() - 30);
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date();
                endDate.setHours(23, 59, 59, 999);
                break;
            case "thisMonth":
                startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date();
                endDate.setHours(23, 59, 59, 999);
                break;
            case "lastMonth":
                startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(today.getFullYear(), today.getMonth(), 0);
                endDate.setHours(23, 59, 59, 999);
                break;
            case "custom":
                setShowDateRange(true);
                return; // Wait for custom date input
            case "all":
            default:
                // No date filtering, keep null values
                break;
        }

        onFilterChange({
            type: filterType,
            startDate,
            endDate
        });
    };

    // Handle custom date range change
    const handleCustomDateSubmit = () => {
        if (customDateRange.start && customDateRange.end) {
            const startDate = new Date(customDateRange.start);
            startDate.setHours(0, 0, 0, 0);
            
            const endDate = new Date(customDateRange.end);
            endDate.setHours(23, 59, 59, 999);

            onFilterChange({
                type: "custom",
                startDate,
                endDate
            });
            
            setShowDateRange(false);
        }
    };

    // Format date for display
    const formatFilterDisplay = () => {
        switch (selectedFilter) {
            case "today":
                return "Hari Ini";
            case "yesterday":
                return "Kemarin";
            case "7days":
                return "7 Hari Terakhir";
            case "30days":
                return "30 Hari Terakhir";
            case "thisMonth":
                return "Bulan Ini";
            case "lastMonth":
                return "Bulan Lalu";
            case "custom":
                if (customDateRange.start && customDateRange.end) {
                    return `${formatDateDisplay(customDateRange.start)} - ${formatDateDisplay(customDateRange.end)}`;
                }
                return "Rentang Kustom";
            case "all":
            default:
                return "Semua Waktu";
        }
    };

    // Format date for display
    const formatDateDisplay = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    useEffect(() => {
        // Set initial filter
        onFilterChange({
            type: "all",
            startDate: null,
            endDate: null
        });
    }, []);

    return (
        <div className="relative">
            {/* Main Filter Button */}
            <div className="card">
                <div className="flex justify-between items-center p-4">
                    <div className="flex items-center gap-x-2">
                        <Calendar size={20} className="text-blue-500" />
                        <span className="text-sm font-medium text-white">Filter Periode</span>
                    </div>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-x-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-md text-sm transition-colors dark:bg-slate-800 dark:hover:bg-slate-700"
                    >
                        {formatFilterDisplay()}
                        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="py-1">
                        {["all", "today", "yesterday", "7days", "30days", "thisMonth", "lastMonth", "custom"].map((filter) => (
                            <button
                                key={filter}
                                className={`flex items-center justify-between w-full px-4 py-2 text-sm text-white hover:bg-slate-100 dark:hover:bg-slate-700 ${
                                    selectedFilter === filter ? "text-blue-500" : "text-slate-700 dark:text-slate-200"
                                }`}
                                onClick={() => handleFilterChange(filter)}
                            >
                                {filter === "all" && "Semua Waktu"}
                                {filter === "today" && "Hari Ini"}
                                {filter === "yesterday" && "Kemarin"}
                                {filter === "7days" && "7 Hari Terakhir"}
                                {filter === "30days" && "30 Hari Terakhir"}
                                {filter === "thisMonth" && "Bulan Ini"}
                                {filter === "lastMonth" && "Bulan Lalu"}
                                {filter === "custom" && "Rentang Kustom"}
                                
                                {selectedFilter === filter && <Check size={16} />}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Custom Date Range Picker */}
            {showDateRange && (
                <div className="card mt-2">
                    <div className="p-4">
                        <h3 className="text-sm font-medium mb-3 text-white">Pilih Rentang Tanggal</h3>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex flex-col w-full">
                                <label className="text-xs text-slate-500 mb-1">Tanggal Mulai</label>
                                <input
                                    type="date"
                                    className="p-2 border border-slate-300 rounded-md text-white dark:bg-slate-800 dark:border-slate-700"
                                    value={customDateRange.start}
                                    onChange={(e) => setCustomDateRange({...customDateRange, start: e.target.value})}
                                />
                            </div>
                            <div className="flex flex-col w-full">
                                <label className="text-xs text-slate-500 mb-1">Tanggal Selesai</label>
                                <input
                                    type="date"
                                    className="p-2 border border-slate-300 rounded-md text-white dark:bg-slate-800 dark:border-slate-700"
                                    value={customDateRange.end}
                                    onChange={(e) => setCustomDateRange({...customDateRange, end: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-md text-sm transition-colors dark:bg-slate-800 dark:hover:bg-slate-700"
                                onClick={() => {
                                    setShowDateRange(false);
                                    setSelectedFilter("all");
                                }}
                            >
                                Batal
                            </button>
                            <button
                                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm transition-colors"
                                onClick={handleCustomDateSubmit}
                                disabled={!customDateRange.start || !customDateRange.end}
                            >
                                Terapkan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

DashboardFilter.propTypes = {
    onFilterChange: PropTypes.func.isRequired
};

export default DashboardFilter;