"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  FileText,
  FileSpreadsheet,
  Download,
  Search,
  Printer,
  RotateCcw,
  Users,
  GraduationCap,
  DollarSign,
  Award,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  FileCheck2,
} from "lucide-react";
import { api } from "~/trpc/react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  REPORT_DEFINITIONS,
  ALL_REPORTS_LIST,
  type ReportCategory,
  type ExportFormat,
} from "~/lib/report-types";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";

interface Props {
  role?: "admin" | "principal" | "head" | "clerk";
  defaultReportId?: string;
}

function ReportsHubContent({ role: _role = "admin", defaultReportId }: Props) {
  const searchParams = useSearchParams();
  const urlReport = searchParams.get("report");
  const urlCategory = searchParams.get("category") as ReportCategory | null;

  const [activeCategory, setActiveCategory] = useState<ReportCategory | "all">("all");
  const [selectedReportId, setSelectedReportId] = useState<string>(
    urlReport && REPORT_DEFINITIONS[urlReport]
      ? urlReport
      : (defaultReportId ?? "enrolled-students"),
  );
  const [searchCatalogQuery, setSearchCatalogQuery] = useState("");

  // Sync with searchParams if query parameters change dynamically
  useEffect(() => {
    if (urlReport && REPORT_DEFINITIONS[urlReport]) {
      setSelectedReportId(urlReport);
      const def = REPORT_DEFINITIONS[urlReport];
      if (def) setActiveCategory(def.category);
    } else if (urlCategory && ["students", "admissions", "academics", "finance"].includes(urlCategory)) {
      setActiveCategory(urlCategory);
    }
  }, [urlReport, urlCategory]);

  // Filters State
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedGender, setSelectedGender] = useState<"ALL" | "MALE" | "FEMALE">("ALL");
  const [selectedMonth, setSelectedMonth] = useState<number | "">("");
  const [selectedYear, setSelectedYear] = useState<number | "">("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [filterSearch, setFilterSearch] = useState<string>("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Export State
  const [isExporting, setIsExporting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);

  // Active Definition
  const currentDef = REPORT_DEFINITIONS[selectedReportId] ?? REPORT_DEFINITIONS["enrolled-students"]!;

  // Load Filter Options
  const { data: filterOptions } = api.report.getFilterOptions.useQuery();

  // Set default active session when filter options load
  useEffect(() => {
    if (filterOptions?.sessions && !selectedSessionId) {
      const active = filterOptions.sessions.find((s) => s.isActive);
      if (active) setSelectedSessionId(active.sessionId);
      else if (filterOptions.sessions[0]) setSelectedSessionId(filterOptions.sessions[0].sessionId);
    }
  }, [filterOptions, selectedSessionId]);

  // Load Report Data
  const {
    data: reportResult,
    isLoading: reportLoading,
    isFetching: reportFetching,
    refetch: refetchReport,
  } = api.report.getReportData.useQuery(
    {
      reportType: selectedReportId,
      sessionId: selectedSessionId || undefined,
      classId: selectedClassId || undefined,
      section: selectedSection || undefined,
      gender: selectedGender !== "ALL" ? selectedGender : undefined,
      month: typeof selectedMonth === "number" ? selectedMonth : undefined,
      year: typeof selectedYear === "number" ? selectedYear : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      city: selectedCity || undefined,
      examId: selectedExamId || undefined,
      search: filterSearch || undefined,
      page: currentPage,
      pageSize,
    },
    {
      placeholderData: (prev) => prev,
    },
  );

  const exportMutation = api.report.exportReport.useMutation();

  // Reset pagination when filters change
  const handleFilterChange = <T,>(setter: (val: T) => void, val: T) => {
    setter(val);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    const active = filterOptions?.sessions?.find((s) => s.isActive);
    setSelectedSessionId(active ? active.sessionId : "");
    setSelectedClassId("");
    setSelectedSection("");
    setSelectedGender("ALL");
    setSelectedMonth("");
    setSelectedYear("");
    setStartDate("");
    setEndDate("");
    setSelectedCity("");
    setSelectedExamId("");
    setFilterSearch("");
    setCurrentPage(1);
    toast.info("Report filters reset to default");
  };

  // Export handler
  const handleExport = async (format: ExportFormat) => {
    try {
      setIsExporting(true);
      setExportingFormat(format);
      const res = await exportMutation.mutateAsync({
        reportType: selectedReportId,
        format,
        sessionId: selectedSessionId || undefined,
        classId: selectedClassId || undefined,
        section: selectedSection || undefined,
        gender: selectedGender !== "ALL" ? selectedGender : undefined,
        month: typeof selectedMonth === "number" ? selectedMonth : undefined,
        year: typeof selectedYear === "number" ? selectedYear : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        city: selectedCity || undefined,
        examId: selectedExamId || undefined,
        search: filterSearch || undefined,
      });

      // Binary decode & trigger download
      const binaryString = atob(res.base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: res.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`${currentDef.title} downloaded as ${format.toUpperCase()}`, {
        description: `Exported ${res.totalRows} records successfully`,
      });
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Export generation failed. Please try again.");
    } finally {
      setIsExporting(false);
      setExportingFormat(null);
    }
  };

  // Filtered Catalog
  const filteredCatalog = useMemo(() => {
    return ALL_REPORTS_LIST.filter((rep) => {
      const matchCat = activeCategory === "all" || rep.category === activeCategory;
      const matchSearch =
        !searchCatalogQuery ||
        rep.title.toLowerCase().includes(searchCatalogQuery.toLowerCase()) ||
        rep.description.toLowerCase().includes(searchCatalogQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchCatalogQuery]);

  // Category counts
  const categoryCounts = useMemo(() => {
    return {
      all: ALL_REPORTS_LIST.length,
      students: ALL_REPORTS_LIST.filter((r) => r.category === "students").length,
      admissions: ALL_REPORTS_LIST.filter((r) => r.category === "admissions").length,
      academics: ALL_REPORTS_LIST.filter((r) => r.category === "academics").length,
      finance: ALL_REPORTS_LIST.filter((r) => r.category === "finance").length,
    };
  }, []);

  return (
    <div className="w-full space-y-6">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-900/40 via-teal-950/30 to-slate-900/60 p-6 sm:p-8 backdrop-blur-2xl shadow-xl">
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30">
                <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                M.S. Naz High School ERP
              </Badge>
              <Badge variant="outline" className="text-slate-300 border-white/10">
                Regulatory & Academic Vault
              </Badge>
              <span className="text-xs font-semibold text-emerald-400/80">32 Comprehensive Reports</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Reports & Regulatory Center
            </h1>
            <p className="max-w-3xl text-sm text-slate-300/80 leading-relaxed">
              Official school registers, student enrollment lists, admission form tracking, examination rankings, and
              revenue balance sheets. Download instantly in{" "}
              <span className="text-emerald-400 font-semibold">PDF</span>,{" "}
              <span className="text-teal-400 font-semibold">Excel (XLSX)</span>,{" "}
              <span className="text-blue-400 font-semibold">CSV</span>, and{" "}
              <span className="text-purple-400 font-semibold">Word (DOCX)</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchReport()}
              disabled={reportFetching}
              className="border-emerald-500/30 bg-emerald-950/40 text-emerald-200 hover:bg-emerald-900/50 hover:text-white"
            >
              <RotateCcw className={`mr-2 h-3.5 w-3.5 ${reportFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
            >
              <Printer className="mr-2 h-3.5 w-3.5" />
              Print
            </Button>
          </div>
        </div>

        {/* Ambient Decorative Accents */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />
      </div>

      {/* 2. Catalog Selector Bar (Tabs & Quick Search) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl border border-slate-200/80 bg-white/70 dark:border-border dark:bg-card/70 backdrop-blur-md shadow-sm">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeCategory === "all"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            All Reports ({categoryCounts.all})
          </button>
          <button
            onClick={() => setActiveCategory("students")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeCategory === "students"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            Students ({categoryCounts.students})
          </button>
          <button
            onClick={() => setActiveCategory("admissions")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeCategory === "admissions"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5" />
            Admissions & Forms ({categoryCounts.admissions})
          </button>
          <button
            onClick={() => setActiveCategory("academics")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeCategory === "academics"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            Academics ({categoryCounts.academics})
          </button>
          <button
            onClick={() => setActiveCategory("finance")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeCategory === "finance"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <DollarSign className="h-3.5 w-3.5" />
            Fee & Revenue ({categoryCounts.finance})
          </button>
        </div>

        {/* Quick Report Finder Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search report titles..."
            value={searchCatalogQuery}
            onChange={(e) => setSearchCatalogQuery(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl bg-white/70 dark:bg-card/70 border-slate-200 dark:border-border"
          />
        </div>
      </div>

      {/* 3. Horizontal Report Selector Carousel / Quick Pick */}
      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <div className="flex gap-2 min-w-max">
          {filteredCatalog.map((rep) => {
            const isSelected = rep.id === selectedReportId;
            return (
              <button
                key={rep.id}
                onClick={() => {
                  setSelectedReportId(rep.id);
                  setCurrentPage(1);
                }}
                className={`flex flex-col text-left p-3 rounded-2xl border transition-all duration-200 max-w-[220px] ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100 shadow-md ring-1 ring-emerald-500/30"
                    : "border-slate-200/80 bg-white/60 hover:bg-slate-50 text-slate-700 dark:border-border dark:bg-card/60 dark:text-slate-300 dark:hover:bg-card"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                    {rep.category}
                  </span>
                  {isSelected && <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />}
                </div>
                <span className="text-xs font-bold line-clamp-1 leading-snug">{rep.title}</span>
                <span className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{rep.shortTitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Active Report Workspace */}
      <div className="rounded-3xl border border-slate-200/90 bg-white/80 dark:border-border dark:bg-card/90 shadow-xl backdrop-blur-xl overflow-hidden">
        {/* 4.1 Report Control Bar: Title & 4-Format Export Action Buttons */}
        <div className="border-b border-slate-200 dark:border-border bg-slate-50/70 dark:bg-black/30 p-5 sm:p-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-[10px] font-bold">
                {currentDef.category.toUpperCase()}
              </Badge>
              <h2 className="text-xl font-black text-slate-900 dark:text-foreground">
                {currentDef.title}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
              {currentDef.description}
            </p>
          </div>

          {/* Download Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* PDF Button */}
            <Button
              onClick={() => handleExport("pdf")}
              disabled={isExporting}
              size="sm"
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20"
            >
              <FileText className="mr-1.5 h-3.5 w-3.5" />
              {isExporting && exportingFormat === "pdf" ? "Exporting..." : "PDF"}
            </Button>

            {/* XLSX Button */}
            <Button
              onClick={() => handleExport("xlsx")}
              disabled={isExporting}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
            >
              <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" />
              {isExporting && exportingFormat === "xlsx" ? "Exporting..." : "Excel (XLSX)"}
            </Button>

            {/* CSV Button */}
            <Button
              onClick={() => handleExport("csv")}
              disabled={isExporting}
              size="sm"
              className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-md shadow-cyan-600/20"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              {isExporting && exportingFormat === "csv" ? "Exporting..." : "CSV"}
            </Button>

            {/* DOCX Button */}
            <Button
              onClick={() => handleExport("docx")}
              disabled={isExporting}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
            >
              <FileCheck2 className="mr-1.5 h-3.5 w-3.5" />
              {isExporting && exportingFormat === "docx" ? "Exporting..." : "Word (DOCX)"}
            </Button>
          </div>
        </div>

        {/* 4.2 Dynamic Filters Bar */}
        <div className="p-4 sm:p-6 bg-slate-50/40 dark:bg-card/40 border-b border-slate-200 dark:border-border">
          <div className="flex flex-wrap items-center gap-3">
            {/* Session Selector */}
            {currentDef.filters.session && (
              <div className="flex flex-col gap-1 min-w-[150px]">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Academic Session
                </label>
                <select
                  value={selectedSessionId}
                  onChange={(e) => handleFilterChange(setSelectedSessionId, e.target.value)}
                  className="h-9 px-3 text-xs rounded-xl border border-slate-200 bg-white dark:border-border dark:bg-card/90 font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
                >
                  <option value="">All Sessions</option>
                  {filterOptions?.sessions?.map((s) => (
                    <option key={s.sessionId} value={s.sessionId}>
                      {s.sessionName} {s.isActive ? " (Active)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Class / Grade Selector */}
            {currentDef.filters.class && (
              <div className="flex flex-col gap-1 min-w-[140px]">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Class / Grade
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => handleFilterChange(setSelectedClassId, e.target.value)}
                  className="h-9 px-3 text-xs rounded-xl border border-slate-200 bg-white dark:border-border dark:bg-card/90 font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
                >
                  <option value="">All Classes</option>
                  {filterOptions?.classes?.map((c) => (
                    <option key={c.classId} value={c.classId}>
                      {c.grade} ({c.section})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Section Selector */}
            {currentDef.filters.section && (
              <div className="flex flex-col gap-1 min-w-[120px]">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Section
                </label>
                <select
                  value={selectedSection}
                  onChange={(e) => handleFilterChange(setSelectedSection, e.target.value)}
                  className="h-9 px-3 text-xs rounded-xl border border-slate-200 bg-white dark:border-border dark:bg-card/90 font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
                >
                  <option value="">All Sections</option>
                  {filterOptions?.sections?.map((sec) => (
                    <option key={sec} value={sec}>
                      Section {sec}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Gender Selector */}
            {currentDef.filters.gender && (
              <div className="flex flex-col gap-1 min-w-[110px]">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Gender
                </label>
                <select
                  value={selectedGender}
                  onChange={(e) => handleFilterChange(setSelectedGender, e.target.value as "ALL" | "MALE" | "FEMALE")}
                  className="h-9 px-3 text-xs rounded-xl border border-slate-200 bg-white dark:border-border dark:bg-card/90 font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
                >
                  <option value="ALL">All Genders</option>
                  <option value="MALE">Boys Only</option>
                  <option value="FEMALE">Girls Only</option>
                </select>
              </div>
            )}

            {/* City Selector */}
            {currentDef.filters.city && (
              <div className="flex flex-col gap-1 min-w-[130px]">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  City / Town
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => handleFilterChange(setSelectedCity, e.target.value)}
                  className="h-9 px-3 text-xs rounded-xl border border-slate-200 bg-white dark:border-border dark:bg-card/90 font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
                >
                  <option value="">All Catchments</option>
                  {filterOptions?.cities?.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Exam Selector */}
            {currentDef.filters.exam && (
              <div className="flex flex-col gap-1 min-w-[160px]">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Exam Term
                </label>
                <select
                  value={selectedExamId}
                  onChange={(e) => handleFilterChange(setSelectedExamId, e.target.value)}
                  className="h-9 px-3 text-xs rounded-xl border border-slate-200 bg-white dark:border-border dark:bg-card/90 font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
                >
                  <option value="">All Terms / Latest</option>
                  {filterOptions?.exams?.map((ex) => (
                    <option key={ex.examId} value={ex.examId}>
                      {ex.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Month Selector */}
            {currentDef.filters.month && (
              <div className="flex flex-col gap-1 min-w-[120px]">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) =>
                    handleFilterChange(
                      setSelectedMonth,
                      e.target.value ? Number(e.target.value) : "",
                    )
                  }
                  className="h-9 px-3 text-xs rounded-xl border border-slate-200 bg-white dark:border-border dark:bg-card/90 font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
                >
                  <option value="">All Months</option>
                  <option value={1}>January</option>
                  <option value={2}>February</option>
                  <option value={3}>March</option>
                  <option value={4}>April</option>
                  <option value={5}>May</option>
                  <option value={6}>June</option>
                  <option value={7}>July</option>
                  <option value={8}>August</option>
                  <option value={9}>September</option>
                  <option value={10}>October</option>
                  <option value={11}>November</option>
                  <option value={12}>December</option>
                </select>
              </div>
            )}

            {/* Year Selector */}
            {currentDef.filters.year && (
              <div className="flex flex-col gap-1 min-w-[110px]">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) =>
                    handleFilterChange(
                      setSelectedYear,
                      e.target.value ? Number(e.target.value) : "",
                    )
                  }
                  className="h-9 px-3 text-xs rounded-xl border border-slate-200 bg-white dark:border-border dark:bg-card/90 font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
                >
                  <option value="">All Years</option>
                  {[2023, 2024, 2025, 2026, 2027].map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date Range Filters */}
            {currentDef.filters.dateRange && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => handleFilterChange(setStartDate, e.target.value)}
                    className="h-9 px-3 text-xs rounded-xl border border-slate-200 bg-white dark:border-border dark:bg-card/90 font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => handleFilterChange(setEndDate, e.target.value)}
                    className="h-9 px-3 text-xs rounded-xl border border-slate-200 bg-white dark:border-border dark:bg-card/90 font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </>
            )}

            {/* Search within Report */}
            <div className="flex flex-col gap-1 min-w-[180px] ml-auto">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Filter Records
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Keyword search..."
                  value={filterSearch}
                  onChange={(e) => handleFilterChange(setFilterSearch, e.target.value)}
                  className="pl-8 h-9 text-xs rounded-xl bg-white dark:bg-card/90 border-slate-200 dark:border-border"
                />
              </div>
            </div>

            {/* Reset Filters */}
            <div className="flex flex-col justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-9 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* 4.3 KPI Metrics Summary Cards */}
        {reportResult?.summaryMetrics && reportResult.summaryMetrics.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 sm:p-6 bg-slate-50/20 dark:bg-black/10 border-b border-slate-200 dark:border-border">
            {reportResult.summaryMetrics.map((metric, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl border border-slate-200/80 bg-white/70 dark:border-border dark:bg-card/70 backdrop-blur-md shadow-sm"
              >
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {metric.label}
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-emerald-400 mt-0.5">
                  {metric.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4.4 Data Table Preview */}
        <div className="overflow-x-auto">
          {reportLoading ? (
            <div className="p-16 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <RotateCcw className="h-8 w-8 animate-spin text-emerald-600" />
              <p className="text-sm font-semibold">Generating report records from database...</p>
            </div>
          ) : !reportResult?.rows || reportResult.rows.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center gap-3 text-center">
              <div className="p-4 rounded-full bg-amber-500/10 text-amber-500">
                <AlertCircle className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-foreground">
                No matching records found
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                No data matched the active filters for {currentDef.title}. Try loosening your session, class, or date parameters.
              </p>
              <Button size="sm" variant="outline" onClick={handleResetFilters} className="mt-2 text-xs">
                Reset All Filters
              </Button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-border bg-slate-100/70 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300">
                  {currentDef.columns.map((col) => (
                    <th
                      key={col.key}
                      className={`p-3 font-bold uppercase tracking-wider text-[10px] ${
                        col.align === "right"
                          ? "text-right"
                          : col.align === "center"
                            ? "text-center"
                            : "text-left"
                      }`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {reportResult.rows.map((row, rowIdx) => {
                  const isEven = rowIdx % 2 === 0;
                  return (
                    <tr
                      key={rowIdx}
                      className={`transition-colors hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 ${
                        isEven ? "bg-white dark:bg-card" : "bg-slate-50/40 dark:bg-card/40"
                      }`}
                    >
                      {currentDef.columns.map((col) => {
                        const val = row[col.key];

                        // Badge Formatter
                        if (col.format === "badge") {
                          const str =
                            val !== null && val !== undefined
                              ? typeof val === "string" || typeof val === "number"
                                ? String(val)
                                : JSON.stringify(val)
                              : "-";
                          const isSuccess =
                            str === "Assigned" ||
                            str === "Passed" ||
                            str === "Complete" ||
                            str === "Verified" ||
                            str === "Paid" ||
                            str === "Enrolled" ||
                            str === "Delivered" ||
                            str === "Active";
                          const isWarning =
                            str === "Pending" ||
                            str === "Awaited" ||
                            str === "Incomplete" ||
                            str === "Standard Notice" ||
                            str === "Under Review";

                          return (
                            <td key={col.key} className="p-3">
                              <Badge
                                variant="outline"
                                className={`text-[10px] font-bold ${
                                  isSuccess
                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                                    : isWarning
                                      ? "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400"
                                      : "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400"
                                }`}
                              >
                                {str}
                              </Badge>
                            </td>
                          );
                        }

                        // Currency Formatter
                        if (col.format === "currency") {
                          const num =
                            typeof val === "number"
                              ? val
                              : typeof val === "string"
                                ? parseFloat(val)
                                : NaN;
                          return (
                            <td key={col.key} className="p-3 font-semibold text-right text-slate-800 dark:text-slate-200">
                              {isNaN(num) ? "-" : `Rs. ${num.toLocaleString()}`}
                            </td>
                          );
                        }

                        // Percent Formatter
                        if (col.format === "percent") {
                          const num =
                            typeof val === "number"
                              ? val
                              : typeof val === "string"
                                ? parseFloat(val)
                                : NaN;
                          return (
                            <td key={col.key} className="p-3 font-semibold text-right text-emerald-600 dark:text-emerald-400">
                              {isNaN(num) ? "-" : `${num.toFixed(1)}%`}
                            </td>
                          );
                        }

                        let displayVal = "-";
                        if (val !== null && val !== undefined) {
                          if (typeof val === "string") {
                            displayVal = val;
                          } else if (typeof val === "number" || typeof val === "boolean") {
                            displayVal = String(val);
                          } else if (val instanceof Date) {
                            displayVal = val.toLocaleDateString("en-PK");
                          } else {
                            displayVal = JSON.stringify(val);
                          }
                        }

                        return (
                          <td
                            key={col.key}
                            className={`p-3 text-slate-700 dark:text-slate-300 ${
                              col.align === "right"
                                ? "text-right"
                                : col.align === "center"
                                  ? "text-center"
                                  : "text-left"
                            }`}
                          >
                            {displayVal}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* 4.5 Pagination Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-border bg-slate-50/50 dark:bg-card flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>
              Showing {reportResult?.rows?.length ?? 0} of {reportResult?.allRowsCount ?? 0} records
            </span>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-7 px-2 text-xs rounded-lg border border-slate-200 bg-white dark:border-border dark:bg-card font-medium outline-none"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || reportLoading}
              className="h-8 text-xs font-bold"
            >
              <ChevronLeft className="mr-1 h-3.5 w-3.5" />
              Previous
            </Button>
            <span className="text-xs font-bold px-2 text-slate-600 dark:text-slate-300">
              Page {currentPage} of {reportResult?.totalPages ?? 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage >= (reportResult?.totalPages ?? 1) || reportLoading}
              className="h-8 text-xs font-bold"
            >
              Next
              <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReportsHub(props: Props) {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <div className="flex items-center gap-3 text-slate-500">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            <span className="text-sm font-medium">Loading reports workspace...</span>
          </div>
        </div>
      }
    >
      <ReportsHubContent {...props} />
    </React.Suspense>
  );
}
