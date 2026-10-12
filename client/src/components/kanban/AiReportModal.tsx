'use client';

import React from 'react';
import { jsonrepair } from 'jsonrepair';
import {
  ArrowLeft,
  Sparkles,
  Printer,
  CheckCircle2,
  Briefcase,
  Users,
  Activity,
  TrendingUp,
  AlertTriangle,
  FileText,
  Lightbulb,
} from 'lucide-react';
import { Task, Member } from './types';

interface AiReportModalProps {
  show: boolean;
  onClose: () => void;
  loading: boolean;
  content: string;
  tasks: Task[];
  members: Member[];
}

export default function AiReportModal({
  show,
  onClose,
  loading,
  content,
  tasks,
  members,
}: AiReportModalProps) {
  return (
    <div
      id="ai-report-side-panel"
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 h-screen w-full bg-background z-50 flex flex-col transition-transform duration-300 ease-in-out ${
        show ? 'translate-x-0' : 'translate-x-full pointer-events-none'
      }`}
    >
      {/* Style tag for print rules */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            header, main, footer, .no-print {
              display: none !important;
            }
            body, html {
              background: #ffffff !important;
              color: #000000 !important;
              height: auto !important;
              min-height: 0 !important;
              overflow: visible !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            .min-h-screen {
              background: #ffffff !important;
              height: auto !important;
              min-height: 0 !important;
              padding: 0 !important;
              overflow: visible !important;
            }
            #ai-report-side-panel {
              position: relative !important;
              display: block !important;
              width: 100% !important;
              height: auto !important;
              background: #ffffff !important;
              color: #000000 !important;
              padding: 0 !important;
              border: none !important;
              box-shadow: none !important;
              transform: none !important;
              transition: none !important;
            }
            #ai-report-print-area {
              width: 100% !important;
              max-width: none !important;
              padding: 20px !important;
              margin: 0 !important;
              background: #ffffff !important;
              color: #000000 !important;
              overflow: visible !important;
            }
            #ai-report-print-area text,
            #ai-report-print-area span,
            #ai-report-print-area h1,
            #ai-report-print-area h2,
            #ai-report-print-area h3,
            #ai-report-print-area h4,
            #ai-report-print-area h5,
            #ai-report-print-area p,
            #ai-report-print-area li,
            #ai-report-print-area strong {
              color: #000000 !important;
              fill: #000000 !important;
            }
            #ai-report-print-area svg {
              display: block !important;
              margin: 15px auto !important;
              background: #ffffff !important;
              border: none !important;
            }
            #ai-report-print-area line,
            #ai-report-print-area polyline,
            #ai-report-print-area polygon,
            #ai-report-print-area path,
            #ai-report-print-area circle {
              stroke: #000000 !important;
            }
            #ai-report-print-area polygon {
              fill: rgba(139, 92, 246, 0.1) !important;
            }
            #ai-report-print-area .glass {
              background: #ffffff !important;
              border: 1px solid #d4d4d8 !important;
              color: #000000 !important;
              box-shadow: none !important;
            }
          }
        `,
        }}
      />

      {/* Full Page Header */}
      <div className="border-b border-border bg-header/90 backdrop-blur-md no-print">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="ui-btn-secondary flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại Dự án
          </button>

          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <h3 className="font-bold text-heading text-sm sm:text-base font-display">
              Báo cáo & Dashboard tiến độ AI
            </h3>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            disabled={loading}
            className="ui-btn-primary flex items-center gap-1.5 px-4 py-2 text-xs font-semibold"
          >
            <Printer className="h-4 w-4" />
            In PDF
          </button>
        </div>
      </div>

      {/* Full Page Body container */}
      <div className="flex-1 overflow-y-auto bg-background">
        <div id="ai-report-print-area" className="max-w-4xl mx-auto w-full p-6 md:py-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 no-print">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500" />
              <span className="text-xs text-zinc-500">
                AI đang lập báo cáo và dựng biểu đồ...
              </span>
            </div>
          ) : (
            <>
              {/* Print Only Header (Visible during PDF Export) */}
              <div className="hidden print:flex items-center justify-between pb-6 mb-6 border-b border-zinc-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center font-black text-white text-lg">
                    H
                  </div>
                  <div>
                    <h2 className="text-lg font-black tracking-wider text-black">HOMIX v2.0</h2>
                    <p className="text-[10px] text-zinc-600 font-semibold">
                      Hệ thống Quản lý Dự án & Tiến độ Thông minh
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <h1 className="text-base font-black text-black uppercase">
                    BÁO CÁO NGHIỆM THU DỰ ÁN
                  </h1>
                  <p className="text-[10px] text-zinc-600">
                    Ngày lập: {new Date().toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>

              {/* Hero Cover Header */}
              <div className="mb-10 p-8 rounded-2xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800/60 shadow-xl relative overflow-hidden no-print">
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px] pointer-events-none" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                  <div>
                    <span className="text-[10px] font-bold text-violet-400 tracking-widest uppercase">
                      Báo cáo tiến độ phân tích bởi AI
                    </span>
                    <h1 className="text-2xl font-black text-zinc-100 tracking-tight mt-1 font-display uppercase">
                      BÁO CÁO NGHIỆM THU DỰ ÁN
                    </h1>
                    <p className="text-xs text-zinc-400 mt-1">
                      Chủ nhiệm: Ngô Hòa My • Ngày lập: {new Date().toLocaleDateString('vi-VN')} • Hệ thống Homix v2.0
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full shrink-0">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-400">Dự án Hoạt động</span>
                  </div>
                </div>

                {/* 4 Cards Stats grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase">
                        Tỷ lệ hoàn thành
                      </span>
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    </div>
                    {(() => {
                      const total = tasks.length;
                      const done = tasks.filter((t) => t.status === 'DONE').length;
                      const rate = total > 0 ? Math.round((done / total) * 100) : 0;
                      return (
                        <>
                          <div className="text-lg font-bold text-zinc-100 mt-1.5">{rate}%</div>
                          <div className="w-full bg-zinc-850 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div
                              className="bg-emerald-400 h-full rounded-full"
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase">
                        Tổng số công việc
                      </span>
                      <Briefcase className="h-4 w-4 text-violet-400" />
                    </div>
                    <div className="text-lg font-bold text-zinc-100 mt-1.5">{tasks.length}</div>
                    <div className="text-[9px] text-zinc-500 mt-2">
                      Done: {tasks.filter((t) => t.status === 'DONE').length} • Todo:{' '}
                      {tasks.filter((t) => t.status === 'TODO').length}
                    </div>
                  </div>

                  <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase">
                        Thành viên tham gia
                      </span>
                      <Users className="h-4 w-4 text-blue-400" />
                    </div>
                    <div className="text-lg font-bold text-zinc-100 mt-1.5">{members.length}</div>
                    <div className="text-[9px] text-zinc-500 mt-2">Nhân sự tham gia dự án</div>
                  </div>

                  <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase">
                        Mức độ hoạt động
                      </span>
                      <Activity className="h-4 w-4 text-amber-400" />
                    </div>
                    <div className="text-lg font-bold text-zinc-100 mt-1.5">Ổn định</div>
                    <div className="text-[9px] text-zinc-500 mt-2">Phân tích logs 24h qua</div>
                  </div>
                </div>
              </div>

              <AiReportRenderer content={content} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// AI REPORT PARSER & CHARTS RENDERER COMPONENTS (NATIVE SVG & CSS)
// ============================================================================

interface ChartConfig {
  title: string;
  chartType: 'doughnut' | 'pie' | 'line' | 'horizontalBar' | 'stackedBar' | 'radar' | 'bar';
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
  }>;
  insight: string;
}

interface ReportSection {
  title: string;
  content: string;
  chart: ChartConfig | null;
}

function parseAiReport(content: string): { sections: ReportSection[]; rawText: string } {
  let cleaned = content.trim();

  if (cleaned.startsWith('```')) {
    const firstLineBreak = cleaned.indexOf('\n');
    const lastBackticks = cleaned.lastIndexOf('```');
    if (firstLineBreak !== -1 && lastBackticks > firstLineBreak) {
      cleaned = cleaned.substring(firstLineBreak + 1, lastBackticks).trim();
    }
  }
  if (cleaned.startsWith('json')) {
    cleaned = cleaned.substring(4).trim();
  }

  const jsonStart = cleaned.indexOf('[');
  const jsonEnd = cleaned.lastIndexOf(']');

  let rawJson = '';
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    rawJson = cleaned.substring(jsonStart, jsonEnd + 1);
  } else {
    const objStart = cleaned.indexOf('{');
    const objEnd = cleaned.lastIndexOf('}');
    if (objStart !== -1 && objEnd !== -1 && objEnd > objStart) {
      rawJson = cleaned.substring(objStart, objEnd + 1);
    }
  }

  if (rawJson) {
    let parsedObj: unknown = null;
    try {
      parsedObj = JSON.parse(rawJson);
    } catch {
      try {
        const repaired = jsonrepair(rawJson);
        parsedObj = JSON.parse(repaired);
      } catch (e2) {
        console.error('jsonrepair also failed:', e2);
      }
    }

    if (parsedObj && typeof parsedObj === 'object') {
      let rawSections: Array<Record<string, unknown>> = [];
      if (Array.isArray(parsedObj)) {
        rawSections = parsedObj as Array<Record<string, unknown>>;
      } else if (Array.isArray((parsedObj as Record<string, unknown>).sections)) {
        rawSections = (parsedObj as Record<string, unknown>).sections as Array<Record<string, unknown>>;
      } else {
        rawSections = Object.values(parsedObj) as Array<Record<string, unknown>>;
      }

      const sections: ReportSection[] = rawSections.map((sec) => ({
        title: String(sec.title || sec['Tiêu đề'] || sec.name || 'Mục phân tích'),
        content: String(sec.content || sec['Nội dung'] || sec.description || ''),
        chart: (sec.chart || sec['biểu đồ'] || sec.chartConfig || null) as ChartConfig | null,
      }));

      if (sections.length > 0) {
        return { sections, rawText: '' };
      }
    }
  }

  return { sections: [], rawText: content };
}

const getSectionIcon = (title: string) => {
  const lower = title.toLowerCase();
  if (
    lower.includes('tiến độ') ||
    lower.includes('tổng quan') ||
    lower.includes('hoàn thành') ||
    lower.includes('completion') ||
    lower.includes('timeline') ||
    lower.includes('burndown') ||
    lower.includes('status')
  ) {
    return <TrendingUp className="h-4.5 w-4.5 text-violet-400 shrink-0" />;
  }
  if (
    lower.includes('thành viên') ||
    lower.includes('nhân sự') ||
    lower.includes('member') ||
    lower.includes('team') ||
    lower.includes('productivity') ||
    lower.includes('phân bổ') ||
    lower.includes('workload')
  ) {
    return <Users className="h-4.5 w-4.5 text-blue-400 shrink-0" />;
  }
  if (
    lower.includes('hoạt động') ||
    lower.includes('logs') ||
    lower.includes('nhật ký') ||
    lower.includes('24h') ||
    lower.includes('distribution') ||
    lower.includes('day')
  ) {
    return <Activity className="h-4.5 w-4.5 text-amber-400 shrink-0" />;
  }
  if (
    lower.includes('rủi ro') ||
    lower.includes('đề xuất') ||
    lower.includes('cải tiến') ||
    lower.includes('risk') ||
    lower.includes('bug') ||
    lower.includes('severity')
  ) {
    return <AlertTriangle className="h-4.5 w-4.5 text-rose-400 shrink-0" />;
  }
  return <FileText className="h-4.5 w-4.5 text-zinc-400 shrink-0" />;
};

const AiReportRenderer = ({ content }: { content: string }) => {
  const { sections, rawText } = parseAiReport(content);

  if (rawText) {
    return (
      <div className="prose prose-invert max-w-none text-zinc-300">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-violet-400 mb-4 border-b border-zinc-800 pb-2">
          BÁO CÁO TỔNG QUAN
        </h4>
        <div className="text-zinc-300 font-sans">{renderCleanMarkdown(rawText)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {sections.map((section, idx) => {
        const hasChart = !!section.chart && section.chart.chartType;
        return (
          <div key={idx} className="border-b border-zinc-900 pb-8 last:border-0 last:pb-0">
            <h4 className="text-sm font-bold text-zinc-100 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-zinc-900 pb-3">
              {getSectionIcon(section.title)}
              {section.title}
            </h4>

            <div className="text-sm text-zinc-300 leading-relaxed font-sans max-w-none">
              {renderCleanMarkdown(section.content)}
            </div>

            {hasChart && section.chart && (
              <div className="w-full max-w-2xl mx-auto glass p-6 rounded-xl border border-zinc-800 bg-zinc-950/20 flex flex-col justify-between gap-4 shadow-lg shadow-black/40 mt-6 mb-2">
                <div>
                  <h5 className="text-xs font-bold text-zinc-200 uppercase tracking-wide mb-4 flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                    <TrendingUp className="h-4.5 w-4.5 text-violet-400" />
                    {section.chart.title}
                  </h5>
                  <div className="flex items-center justify-center min-h-[220px] py-2 w-full">
                    {section.chart.chartType === 'doughnut' ||
                    section.chart.chartType === 'pie' ? (
                      <DoughnutChart config={section.chart} />
                    ) : section.chart.chartType === 'line' ? (
                      <LineChart config={section.chart} />
                    ) : section.chart.chartType === 'bar' ? (
                      <BarChart config={section.chart} />
                    ) : section.chart.chartType === 'horizontalBar' ? (
                      <HorizontalBarChart config={section.chart} />
                    ) : section.chart.chartType === 'stackedBar' ? (
                      <StackedBarChart config={section.chart} />
                    ) : section.chart.chartType === 'radar' ? (
                      <RadarChart config={section.chart} />
                    ) : (
                      <div className="text-xs text-zinc-500">Biểu đồ không được hỗ trợ</div>
                    )}
                  </div>
                </div>
                {section.chart.insight && (
                  <div className="text-xs text-zinc-400 bg-zinc-950/60 p-3 rounded-lg border border-zinc-900/60 flex items-start gap-2 leading-normal">
                    <Lightbulb className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-zinc-300">Nhận xét:</span>{' '}
                      {section.chart.insight}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const colors = [
  'var(--chart-1, #8b5cf6)',
  'var(--chart-2, #3b82f6)',
  'var(--chart-3, #10b981)',
  'var(--chart-4, #f59e0b)',
  'var(--chart-5, #ef4444)',
  'var(--chart-6, #ec4899)',
  'var(--chart-7, #6366f1)',
  'var(--chart-8, #14b8a6)',
];

const toNumberArray = (arr: unknown[]): number[] =>
  arr.map((v) => (typeof v === 'number' ? v : parseFloat(String(v)) || 0));

const getChartData = (config: ChartConfig): number[] => {
  if (!config) return [];
  const raw = config as unknown as Record<string, unknown>;
  if (
    Array.isArray(config.datasets) &&
    config.datasets[0] &&
    Array.isArray(config.datasets[0].data)
  ) {
    return toNumberArray(config.datasets[0].data);
  }
  if (
    Array.isArray(config.datasets) &&
    (typeof config.datasets[0] === 'number' || typeof config.datasets[0] === 'string')
  ) {
    return toNumberArray(config.datasets as unknown[]);
  }
  if (Array.isArray(raw.data)) {
    return toNumberArray(raw.data);
  }
  if (Array.isArray(raw.dataset)) {
    const d = raw.dataset as unknown[];
    const first = d[0] as Record<string, unknown> | undefined;
    if (first && Array.isArray(first.data)) return toNumberArray(first.data);
    if (typeof d[0] === 'number' || typeof d[0] === 'string') return toNumberArray(d);
  }
  return [];
};

const getChartLabels = (config: ChartConfig): string[] => {
  if (!config) return [];
  const raw = config as unknown as Record<string, unknown>;
  if (Array.isArray(config.labels) && config.labels.length > 0) {
    return config.labels.map((l) => String(l));
  }
  if (Array.isArray(raw.label) && raw.label.length > 0) {
    return raw.label.map((l) => String(l));
  }
  return [];
};

const DoughnutChart = ({ config }: { config: ChartConfig }) => {
  const data = getChartData(config);
  const labels = getChartLabels(config);
  const total = data.reduce((a, b) => a + b, 0);

  const gradientParts = data.map((val, idx) => {
    const prevSum = data.slice(0, idx).reduce((a, b) => a + b, 0);
    const start = total > 0 ? (prevSum / total) * 100 : 0;
    const end = total > 0 ? ((prevSum + val) / total) * 100 : 0;
    return `${colors[idx % colors.length]} ${start}% ${end}%`;
  });

  const backgroundStyle = {
    background: gradientParts.length > 0 ? `conic-gradient(${gradientParts.join(', ')})` : '#3f3f46',
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div
        className="flex items-center justify-center relative w-36 h-36 rounded-full shadow-lg shadow-black/40"
        style={backgroundStyle}
      >
        {config.chartType === 'doughnut' && (
          <div className="absolute w-24 h-24 bg-zinc-950 rounded-full flex flex-col items-center justify-center">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
              Tổng
            </span>
            <span className="text-sm font-bold text-white">{total}</span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 text-[10px] w-full border-t border-zinc-900 pt-3">
        {labels.map((label, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-zinc-400">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: colors[idx % colors.length] }}
            />
            <span className="truncate">
              {label}: <strong className="text-zinc-200">{data[idx] ?? 0}</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const LineChart = ({ config }: { config: ChartConfig }) => {
  const data = getChartData(config);
  const labels = getChartLabels(config);
  if (data.length === 0) return <div className="text-xs text-zinc-600">Không có dữ liệu</div>;

  const maxVal = Math.max(...data, 1);
  const width = 500;
  const height = 200;
  const paddingLeft = 35;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const points = data.map((val, idx) => {
    const x = paddingLeft + (idx * chartWidth) / (data.length - 1 || 1);
    const y = paddingTop + chartHeight - (val * chartHeight) / maxVal;
    return { x, y, val, label: labels[idx] || `Point ${idx + 1}` };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPoints = [
    `${paddingLeft},${paddingTop + chartHeight}`,
    ...points.map((p) => `${p.x},${p.y}`),
    `${paddingLeft + chartWidth},${paddingTop + chartHeight}`,
  ].join(' ');

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56">
        <defs>
          <linearGradient
            id={`areaGrad-${config.title.replace(/\s+/g, '')}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {Array.from({ length: 4 }).map((_, idx) => {
          const y = paddingTop + (idx * chartHeight) / 3;
          const val = Math.round(maxVal - (idx * maxVal) / 3);
          return (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#1f2937"
                strokeDasharray="3 3"
              />
              <text x={paddingLeft - 8} y={y + 4} fill="#71717a" fontSize="10" textAnchor="end">
                {val}
              </text>
            </g>
          );
        })}

        <polygon
          points={areaPoints}
          fill={`url(#areaGrad-${config.title.replace(/\s+/g, '')})`}
        />

        <polyline
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={polylinePoints}
        />

        {points.map((p, idx) => (
          <g key={idx} className="group cursor-pointer">
            <circle cx={p.x} cy={p.y} r="4" fill="#a78bfa" stroke="#09090b" strokeWidth="1.5" />
            <text
              x={p.x}
              y={p.y - 8}
              fill="#a78bfa"
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
              className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            >
              {p.val}
            </text>
            <title>{`${p.label}: ${p.val}`}</title>
          </g>
        ))}

        {points.map((p, idx) => (
          <text key={idx} x={p.x} y={height - 8} fill="#71717a" fontSize="9" textAnchor="middle">
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  );
};

const BarChart = ({ config }: { config: ChartConfig }) => {
  const data = getChartData(config);
  const labels = getChartLabels(config);
  const maxVal = Math.max(...data, 1);

  return (
    <div className="w-full flex items-end justify-between h-56 pt-6 px-2 border-b border-zinc-800/80">
      {data.map((val, idx) => {
        const heightPct = (val / maxVal) * 100;
        return (
          <div key={idx} className="flex flex-col items-center flex-1 group gap-2 h-full justify-end">
            <span className="text-[9px] text-zinc-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              {val}
            </span>
            <div
              style={{ height: `${Math.max(heightPct, 5)}%` }}
              className="w-6 bg-gradient-to-t from-violet-600 to-indigo-500 rounded-t-sm group-hover:from-violet-500 group-hover:to-indigo-400 transition-all shadow-md shadow-violet-500/10 cursor-pointer"
            />
            <span className="text-[9px] text-zinc-500 truncate max-w-[50px] mt-1 h-3 text-center">
              {labels[idx] || `Mục ${idx + 1}`}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const HorizontalBarChart = ({ config }: { config: ChartConfig }) => {
  const data = getChartData(config);
  const labels = getChartLabels(config);
  const maxVal = Math.max(...data, 1);

  return (
    <div className="w-full space-y-2.5">
      {data.map((val, idx) => {
        const widthPct = (val / maxVal) * 100;
        return (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-[10px] text-zinc-400">
              <span className="truncate max-w-[70%] font-medium">
                {labels[idx] || `Mục ${idx + 1}`}
              </span>
              <span className="font-semibold text-zinc-300">{val}</span>
            </div>
            <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800/50">
              <div
                style={{ width: `${widthPct}%` }}
                className="bg-gradient-to-r from-violet-600 to-indigo-500 h-full rounded-full transition-all"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const StackedBarChart = ({ config }: { config: ChartConfig }) => {
  const data = getChartData(config);
  const labels = getChartLabels(config);
  const total = data.reduce((a, b) => a + b, 0);
  const colorsList = [
    'var(--chart-5, #ef4444)',
    'var(--chart-4, #f59e0b)',
    'var(--chart-2, #3b82f6)',
    'var(--chart-3, #10b981)',
    'var(--chart-1, #8b5cf6)',
    'var(--chart-7, #6366f1)',
  ];

  return (
    <div className="w-full space-y-4">
      <div className="w-full bg-zinc-900 h-3 rounded-full overflow-hidden flex border border-zinc-800">
        {data.map((val, idx) => {
          const widthPct = total > 0 ? (val / total) * 100 : 0;
          if (widthPct === 0) return null;
          return (
            <div
              key={idx}
              style={{
                width: `${widthPct}%`,
                backgroundColor: colorsList[idx % colorsList.length],
              }}
              className="h-full first:rounded-l-full last:rounded-r-full transition-all cursor-pointer"
            >
              <title>{`${labels[idx] || 'Mục'}: ${val}`}</title>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2 text-[10px] w-full border-t border-zinc-900 pt-3">
        {labels.map((label, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-zinc-400">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: colorsList[idx % colorsList.length] }}
            />
            <span className="truncate">
              {label}: <strong className="text-zinc-200">{data[idx] ?? 0}</strong> (
              {total > 0 ? Math.round(((data[idx] ?? 0) / total) * 100) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const RadarChart = ({ config }: { config: ChartConfig }) => {
  const data = getChartData(config);
  const labels = getChartLabels(config);
  if (data.length === 0) return <div className="text-xs text-zinc-600">Không có dữ liệu</div>;

  const maxVal = Math.max(...data, 1);
  const cx = 100;
  const cy = 80;
  const r = 50;
  const numPoints = data.length;

  const gridPoints = Array.from({ length: numPoints }).map((_, idx) => {
    const angle = (idx * 2 * Math.PI) / numPoints - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return { x, y, label: labels[idx] || `P${idx + 1}` };
  });

  const gridPolygon = gridPoints.map((p) => `${p.x},${p.y}`).join(' ');

  const gridPolygonMid = Array.from({ length: numPoints })
    .map((_, idx) => {
      const angle = (idx * 2 * Math.PI) / numPoints - Math.PI / 2;
      const x = cx + r * 0.5 * Math.cos(angle);
      const y = cy + r * 0.5 * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(' ');

  const valuePoints = data
    .map((val, idx) => {
      const angle = (idx * 2 * Math.PI) / numPoints - Math.PI / 2;
      const valR = (val / maxVal) * r;
      const x = cx + valR * Math.cos(angle);
      const y = cy + valR * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="flex flex-col items-center w-full">
      <svg viewBox="0 0 200 160" className="w-full h-56">
        <polygon points={gridPolygon} fill="none" stroke="#1f2937" strokeWidth="1" />
        <polygon points={gridPolygonMid} fill="none" stroke="#1f2937" strokeWidth="1" />

        {gridPoints.map((p, idx) => (
          <line key={idx} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#1f2937" strokeWidth="1" />
        ))}

        <polygon
          points={valuePoints}
          fill="rgba(139, 92, 246, 0.25)"
          stroke="#8b5cf6"
          strokeWidth="1.5"
        />

        {data.map((val, idx) => {
          const angle = (idx * 2 * Math.PI) / numPoints - Math.PI / 2;
          const valR = (val / maxVal) * r;
          const x = cx + valR * Math.cos(angle);
          const y = cy + valR * Math.sin(angle);
          return <circle key={idx} cx={x} cy={y} r="2.5" fill="#a78bfa" />;
        })}

        {gridPoints.map((p, idx) => {
          const angle = (idx * 2 * Math.PI) / numPoints - Math.PI / 2;
          const lx = cx + (r + 15) * Math.cos(angle);
          const ly = cy + (r + 6) * Math.sin(angle) + 2;
          return (
            <text key={idx} x={lx} y={ly} fill="#71717a" fontSize="7" textAnchor="middle">
              {p.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

const parseBoldText = (text: string) => {
  const parts = text.split('**');
  return parts.map((part, idx) => {
    if (idx % 2 === 1) {
      return (
        <strong key={idx} className="font-semibold text-white">
          {part}
        </strong>
      );
    }
    return part;
  });
};

const renderCleanMarkdown = (text: string) => {
  if (!text) return null;

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];

  const flushList = (key: string | number) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${key}`} className="list-disc pl-5 mb-4 space-y-1.5 text-zinc-300">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('# ')) {
      flushList(idx);
      const cleanText = parseBoldText(trimmed.substring(2).replace(/[#*`~_]/g, '').trim());
      elements.push(
        <h1 key={idx} className="text-xl font-bold text-white mt-6 mb-3">
          {cleanText}
        </h1>
      );
    } else if (trimmed.startsWith('## ')) {
      flushList(idx);
      const cleanText = parseBoldText(trimmed.substring(3).replace(/[#*`~_]/g, '').trim());
      elements.push(
        <h2 key={idx} className="text-base font-bold text-violet-400 mt-5 mb-3">
          {cleanText}
        </h2>
      );
    } else if (trimmed.startsWith('### ')) {
      flushList(idx);
      const cleanText = parseBoldText(trimmed.substring(4).replace(/[#*`~_]/g, '').trim());
      elements.push(
        <h3 key={idx} className="text-sm font-bold text-zinc-200 mt-4 mb-2">
          {cleanText}
        </h3>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const cleanText = parseBoldText(trimmed.substring(2).replace(/[-*`~_]/g, '').trim());
      listItems.push(
        <li key={`li-${idx}`} className="text-sm leading-relaxed">
          {cleanText}
        </li>
      );
    } else if (trimmed.length > 0) {
      flushList(idx);
      if (trimmed.startsWith('===') || trimmed.startsWith('---')) {
        elements.push(<hr key={idx} className="border-zinc-800 my-4" />);
      } else {
        const cleanText = parseBoldText(trimmed.replace(/[#*`~_]/g, '').trim());
        elements.push(
          <p key={idx} className="text-sm text-zinc-300 mb-3 leading-relaxed">
            {cleanText}
          </p>
        );
      }
    } else {
      flushList(idx);
    }
  });

  flushList('final');
  return <div className="space-y-1">{elements}</div>;
};
