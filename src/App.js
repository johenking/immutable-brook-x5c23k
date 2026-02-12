import React, { useState, useEffect, useMemo, useRef } from "react"; // 👈 必须补上 useState
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  onSnapshot,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import {
  Play,
  Square,
  Plus,
  TrendingUp,
  Clock,
  DollarSign,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Zap,
  Undo2,
  Loader2,
  Database,
  X,
  HelpCircle,
  Calculator,
  ArrowRight,
  Heart,
  Smile,
  Fingerprint,
  Calendar as CalendarIcon,
  PenTool,
  Battery,
  Activity,
  LogOut,
  ChevronRight,
  LayoutDashboard,
  BrainCircuit,
  Lightbulb,
  History,
  MoreHorizontal,
  PlayCircle,
  Info,
  FolderOpen,
  Layers,
  Edit3,
  ChevronLeft,
  BarChart2,
  CheckSquare,
  Target,
  Dumbbell,
  BookOpen,
  Home,
  WifiOff,
  Download,
  ChevronDown,
  ShieldCheck,
  Briefcase, // 👈 确保这里有 Briefcase
} from "lucide-react";

// ==========================================
// 1. 样式加载器
// ==========================================
const StyleLoader = () => {
  useEffect(() => {
    if (!document.querySelector("#tailwind-cdn")) {
      const script = document.createElement("script");
      script.id = "tailwind-cdn";
      script.src = "https://cdn.tailwindcss.com";
      script.async = true;
      script.onload = () => {
        if (window.tailwind) {
          window.tailwind.config = {
            theme: {
              extend: {
                colors: {
                  slate: { 850: "#1e293b", 900: "#0f172a", 950: "#020617" },
                },
                animation: {
                  "fade-in": "fadeIn 0.4s ease-out",
                  "slide-up": "slideUp 0.4s ease-out",
                },
                keyframes: {
                  fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
                  slideUp: {
                    "0%": { transform: "translateY(20px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                  },
                },
              },
            },
          };
        }
      };
      document.head.appendChild(script);
    }
  }, []);

  return (
    <style>{`
      body { background-color: #020617; color: #f8fafc; font-family: sans-serif; margin: 0; }
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: #0f172a; }
      ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
    `}</style>
  );
};

// ==========================================
// 2. 系统配置
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyAKzlNOL-gzXiMKPrLx2bc0HsPV71fRtfs",
  authDomain: "mylifesysterm.firebaseapp.com",
  projectId: "mylifesysterm",
  storageBucket: "mylifesysterm.firebasestorage.app",
  messagingSenderId: "383311264036",
  appId: "1:383311264036:web:510b132be3b9ca0ce85bb1",
  measurementId: "G-CGVVCW84H3",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "life-system-production-v1";
const HOURLY_THRESHOLD = 100;

const SHADOW_PRICES = {
  investment: 100, // 🟣 潜能 (学习/健身/代码)
  work: 50, // 🔵 搬砖 (兼职/社团/杂务)
  maintenance: 20, // 🟢 维持 (通勤/家务/跑腿)
};

// ==========================================
// 3. 核心定义
// ==========================================
// 👇👇👇 替换原来的 RATING_CRITERIA 👇👇👇
const RATING_CRITERIA = {
  bioEnergy: {
    label: "生理能量",
    icon: <Battery size={18} />,
    color: "emerald",
    definition: "对抗熵增的底气。",
    levels: {
      1: "🔴 崩溃：生病/极度缺觉，系统停机。",
      2: "🟠 挣扎：身体沉重，靠意志力硬撑。",
      3: "🟡 维持：无病无痛，但精力平平。",
      4: "🟢 充实：运动表现佳，大脑清晰。",
      5: "💎 巅峰：精力无限，不知疲倦。",
    },
  },
  agency: {
    label: "自主权",
    icon: <Fingerprint size={18} />,
    color: "amber",
    definition: "我命由我不由天。",
    levels: {
      1: "🔴 奴役：全天被迫营业，像个提线木偶。",
      2: "🟠 妥协：大部分时间在做不想做的事。",
      3: "🟡 凡人：有选择，但被琐事缠身。",
      4: "🟢 掌控：核心决策由我做主。",
      5: "💎 主宰：每一分钟都是我自由意志的选择。",
    },
  },
  connection: {
    label: "深度链接",
    icon: <Heart size={18} />,
    color: "rose",
    definition: "爱的流动与回响。",
    levels: {
      1: "🔴 孤岛：冷战、冲突、完全封闭。",
      2: "🟠 疏离：虽在一起，但心不在焉。",
      3: "🟡 社交：正常的寒暄与事务性沟通。",
      4: "🟢 温暖：感到被理解、被支持。",
      5: "💎 共振：灵魂深处的同频，极致的爱。",
    },
  },
  flow: {
    label: "心流成长",
    icon: <Activity size={18} />,
    color: "blue",
    definition: "技能与挑战的完美平衡。",
    levels: {
      1: "🔴 枯竭：焦虑、拖延、毫无产出。",
      2: "🟠 阻滞：注意力涣散，效率极低。",
      3: "🟡 搬砖：按部就班完成任务。",
      4: "🟢 沉浸：专注解决难题，时间过得很快。",
      5: "💎 忘我：人剑合一，创造力爆发。",
    },
  },
  awe: {
    label: "惊叹时刻",
    icon: <Zap size={18} />,
    color: "purple",
    definition: "从生存模式切换到生活模式。",
    levels: {
      1: "🔴 麻木：像机器人一样重复。",
      2: "🟠 灰暗：对周围环境无感。",
      3: "🟡 小确幸：吃到美食，看到晚霞。",
      4: "🟢 触动：被艺术或智慧深深打动。",
      5: "💎 神性：感受到宏大叙事，人间值得。",
    },
  },
};

const STAT_DETAILS = {
  roi: {
    title: "真实时薪 (ROI)",
    subtitle: "你的时间到底值多少钱？",
    icon: <TrendingUp className="text-blue-400" size={24} />,
    formula: "总营收 ÷ 总投入小时数",
    logic:
      "这是衡量强者段位的核心指标。系统设定的斩杀线是 ¥200/h。低于这个数字的努力，本质上是在通过廉价出卖生命来逃避深度思考。",
    tips: "提高分子（提升技能溢价）或减少分母（使用 AI 杠杆）是唯二的破局之道。",
  },
  revenue: {
    title: "累计营收",
    subtitle: "落袋为安的真金白银",
    icon: <DollarSign className="text-emerald-400" size={24} />,
    formula: "∑ (已核算任务的实际收益)",
    logic:
      "市场不相信眼泪，也不相信‘预计价值’。只有真正到达你账户的钱，才是你在商业社会交换价值的证明。",
    tips: "逼自己去完成闭环，哪怕只赚 2 块钱。",
  },
  duration: {
    title: "总投入时长",
    subtitle: "你支付的生命成本",
    icon: <Clock className="text-blue-400" size={24} />,
    formula: "∑ (所有任务实际投入秒数) ÷ 3600",
    logic:
      "时间是不可再生资源。记录是为了让你对流逝保持痛感。知道自己花了多少命，才配谈回报。",
    tips: "拒绝虚假勤奋，关注有效产出。",
  },
  debt: {
    title: "时间负债",
    subtitle: "劣质勤奋的警钟",
    icon: <AlertCircle className="text-rose-400" size={24} />,
    formula: "Count (时薪 < ¥200 的已完成任务)",
    logic: "这些是人生资产负债表上的‘坏账’，阻碍阶级跨越的元凶。",
    tips: "复盘：该外包？该拒绝？还是该用技术手段降维打击？",
  },
  agency: {
    title: "自主权指数",
    subtitle: "为自己而活的程度",
    icon: <Fingerprint className="text-amber-400" size={24} />,
    formula: "每日主观评分 (1-10) 的平均值",
    logic:
      "文档核心观点：人这辈子真正为自己而活的时间极其有限。如果今天你做了想做的事，没有被迫营业，这就是高质量的生命。",
    tips: "如果长期低于 6 分，说明你正在沦为社会的燃料。",
  },
};

// ==========================================
// 4. 辅助组件
// ==========================================
const TrendChart = ({ data, dataKey, color, height = 50 }) => {
  if (!data || data.length < 2)
    return (
      <div className="h-[50px] flex items-center justify-center text-[10px] text-slate-600 font-mono border border-slate-800/50 rounded-lg">
        需累积2天数据
      </div>
    );
  const maxVal = 10;
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((Number(d[dataKey]) || 0) / maxVal) * 100;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <div className="w-full relative" style={{ height: `${height}px` }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible"
      >
        <path
          d={`M0,100 L${points.replace(/ /g, " L")} L100,100 Z`}
          fill={color}
          fillOpacity="0.1"
          stroke="none"
        />
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

// 👇👇👇 替换原来的 AuditItem 组件 (超大热区+丝滑GPU加速版) 👇👇👇
const AuditItem = ({ type, val, setVal, note, setNote }) => {
  const criteria = RATING_CRITERIA[type];

  const getLevelInfo = (v) => {
    const score = Number(v);
    if (score <= 2)
      return {
        text: criteria.levels[1],
        color:
          "text-rose-500 bg-rose-500/10 border-rose-500/20 shadow-rose-900/20",
      };
    if (score <= 4)
      return {
        text: criteria.levels[2],
        color:
          "text-orange-400 bg-orange-500/10 border-orange-500/20 shadow-orange-900/20",
      };
    if (score <= 6)
      return {
        text: criteria.levels[3],
        color:
          "text-amber-300 bg-amber-500/10 border-amber-500/20 shadow-amber-900/20",
      };
    if (score <= 8)
      return {
        text: criteria.levels[4],
        color:
          "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-900/20",
      };
    return {
      text: criteria.levels[5],
      color:
        "text-cyan-300 bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.2)] animate-pulse",
    };
  };

  const levelInfo = getLevelInfo(val);

  return (
    // 在最外层加一个 group 类，用于控制子元素在 active 状态下的样式
    <div className="bg-[#1e293b]/40 p-5 rounded-2xl border border-white/5 transition-all hover:border-white/10 group relative select-none">
      {/* 标题栏 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl bg-slate-800 shadow-inner ${
              criteria.color === "rose"
                ? "text-rose-400"
                : criteria.color === "amber"
                ? "text-amber-400"
                : criteria.color === "emerald"
                ? "text-emerald-400"
                : criteria.color === "blue"
                ? "text-blue-400"
                : "text-purple-400"
            }`}
          >
            {criteria.icon}
          </div>
          <div>
            <div className="text-sm font-bold text-slate-200">
              {criteria.label}
            </div>
            <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
              {criteria.definition}
            </div>
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span
            className={`font-mono text-3xl font-bold tracking-tighter ${
              levelInfo.color.split(" ")[0]
            }`}
          >
            {val}
          </span>
          <span className="text-xs text-slate-600 font-bold">/10</span>
        </div>
      </div>

      {/* === 滑块区域 (核心优化区) === */}
      {/* 1. 加高容器到 h-14 (56px)，确保足够大的触控垂直空间 */}
      <div className="relative h-14 flex items-center mb-4 touch-none">
        {/* 2. 原生输入控件：透明、全屏覆盖、层级最高 */}
        <input
          type="range"
          min="1"
          max="10"
          step="0.5"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          // 🟢 z-30 确保在最上层；h-full w-full 铺满整个触控区；cursor-grab 提供鼠标反馈
          className="absolute inset-0 w-full h-full opacity-0 z-30 cursor-grab active:cursor-grabbing"
          style={{ touchAction: "none" }}
        />

        {/* 3. 自定义滑块轨道 UI (视觉层，位于中间层 z-10) */}
        <div className="w-full h-3 bg-slate-800/80 rounded-full overflow-hidden relative border border-white/5 pointer-events-none z-10">
          <div
            // 这里的 transition 只负责颜色变化，不负责位置，避免卡顿
            className={`h-full transition-colors duration-200 ease-out ${
              Number(val) > 8
                ? "bg-gradient-to-r from-blue-500 to-cyan-400"
                : Number(val) > 6
                ? "bg-emerald-500"
                : Number(val) > 4
                ? "bg-amber-400"
                : Number(val) > 2
                ? "bg-orange-500"
                : "bg-rose-500"
            }`}
            style={{ width: `${val * 10}%` }}
          ></div>
        </div>

        {/* 4. 自定义滑块头 (视觉层，跟随移动，位于 z-20) */}
        <div
          // 🟢 will-change-transform 开启 GPU 加速
          // 🟢 group-active:scale-110 拖动时放大给予反馈
          // 🟢 使用 translate(-50%, -50%) 进行更精准的中心定位
          className="absolute top-1/2 h-7 w-7 bg-white rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.5)] border-4 border-[#0f172a] pointer-events-none transition-transform duration-150 ease-out flex items-center justify-center z-20 will-change-transform group-active:scale-110"
          style={{
            left: `${val * 10}%`,
            transform: `translate(-50%, -50%)`,
          }}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              Number(val) > 8 ? "bg-cyan-500" : "bg-slate-400"
            }`}
          ></div>
        </div>
      </div>

      {/* 状态反馈胶囊 */}
      <div
        className={`text-xs px-3 py-3 rounded-xl border mb-4 flex items-start gap-2 transition-all duration-300 ${levelInfo.color}`}
      >
        <Info size={14} className="shrink-0 mt-0.5 opacity-80" />
        <p className="font-bold tracking-wide">{levelInfo.text}</p>
      </div>

      {/* 备注输入框 */}
      <div className="relative group/input">
        <Edit3
          size={14}
          className="absolute left-4 top-4 text-slate-600 group-focus-within/input:text-blue-400 transition-colors"
        />
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="有什么故事？(选填)"
          className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl py-3.5 pl-10 pr-4 text-base text-slate-200 outline-none focus:border-blue-500/50 focus:bg-slate-900 transition-all placeholder:text-slate-600"
        />
      </div>
    </div>
  );
};

// --- Calendar ---
const CalendarView = ({ type, data, onSelectDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();
  const handlePrev = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  const handleNext = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );

  const getDataForDay = (day) => {
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const dayStr = day.toString().padStart(2, "0");
    const dateStr = `${currentDate.getFullYear()}-${month}-${dayStr}`;

    if (type === "review") {
      return data.find((r) => r.date === dateStr);
    } else {
      const tasksForDay = data.filter((t) => {
        const tDate = t.endTime
          ? t.endTime.split("T")[0]
          : t.createdAt.split("T")[0];
        return tDate === dateStr && t.status === "Completed";
      });
      if (tasksForDay.length === 0) return null;

      const totalSeconds = tasksForDay.reduce(
        (acc, t) => acc + (t.duration || 0),
        0
      );

      // 👇👇👇 [新增] 计算当天总营收 👇👇👇
      const totalRevenue = tasksForDay.reduce(
        (acc, t) => acc + (Number(t.actualRevenue) || 0),
        0
      );

      return {
        count: tasksForDay.length,
        duration: totalSeconds,
        totalRevenue, // 👈 记得把这个新算出来的钱返回出去
        tasks: tasksForDay,
      };
    }
  };

  const getScoreColor = (item) => {
    if (!item) return "bg-slate-800 border-slate-700 text-slate-600";
    if (type === "review") {
      const avg =
        (Number(item.bioEnergy) +
          Number(item.agency) +
          Number(item.connection) +
          Number(item.flow) +
          Number(item.awe)) /
        5;
      if (avg >= 8)
        return "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]";
      if (avg >= 5) return "bg-amber-500/20 border-amber-500 text-amber-400";
      return "bg-rose-500/20 border-rose-500 text-rose-400";
    } else {
      const hours = item.duration / 3600;
      if (hours >= 6)
        return "bg-blue-500/40 border-blue-400 text-white shadow-[0_0_10px_rgba(59,130,246,0.4)] font-bold";
      if (hours >= 3) return "bg-blue-600/20 border-blue-500/50 text-blue-200";
      return "bg-slate-700/50 border-slate-600 text-slate-400";
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-4 px-2">
        <button
          onClick={handlePrev}
          className="p-1 hover:bg-slate-800 rounded-lg text-slate-400"
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="font-bold text-white">
          {currentDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h3>
        <button
          onClick={handleNext}
          className="p-1 hover:bg-slate-800 rounded-lg text-slate-400"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2 mb-2 text-center">
        {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
          <span key={d} className="text-[10px] text-slate-500 font-bold">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="h-14"></div>
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const item = getDataForDay(day);
          const isToday =
            new Date().toDateString() ===
            new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              day
            ).toDateString();
          return (
            <div
              key={day}
              onClick={() => {
                const month = (currentDate.getMonth() + 1)
                  .toString()
                  .padStart(2, "0");
                const dayStr = day.toString().padStart(2, "0");
                onSelectDate(
                  `${currentDate.getFullYear()}-${month}-${dayStr}`,
                  item
                );
              }}
              className={`h-14 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 relative ${getScoreColor(
                item
              )} ${isToday ? "ring-2 ring-white z-10" : ""}`}
            >
              <span className="text-xs font-bold text-slate-500">{day}</span>

              {/* 👇👇👇 新增：显示金额逻辑 👇👇👇 */}
              {type === "task" && item && (
                <div className="flex flex-col items-center mt-0.5">
                  {/* 如果有钱，显示绿色金额 */}
                  {item.totalRevenue > 0 ? (
                    <span className="text-[9px] font-mono font-bold text-emerald-400">
                      ¥{item.totalRevenue}
                    </span>
                  ) : (
                    // 如果没钱只有时间，显示个小横杠或者时长
                    <span className="text-[9px] font-mono text-slate-600">
                      {(item.duration / 3600).toFixed(1)}h
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-center gap-4 mt-4 text-[10px] text-slate-500">
        {type === "review" ? (
          <>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div> 巅峰
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div> 平常
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-rose-500"></div> 低谷
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div> 深度 (
              {">"}6h)
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-900 border border-blue-700"></div>{" "}
              正常
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-slate-700"></div> 休息
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 5. 主应用逻辑
// ==========================================
const App = () => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLocalMode, setIsLocalMode] = useState(false); // [New] Offline Mode State
  const [activeTab, setActiveTab] = useState("execution");
  const [tasks, setTasks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTaskId, setActiveTaskId] = useState(null);

  // Modals & Views
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showDailyReportModal, setShowDailyReportModal] = useState(false);
  const [selectedStat, setSelectedStat] = useState(null);

  const [auditViewMode, setAuditViewMode] = useState("trends");
  const [taskViewMode, setTaskViewMode] = useState("list");
  const [targetDate, setTargetDate] = useState(null); // [新增] 用于记录补录的目标日期
  
  // 👇👇👇 1. 智能折叠状态 (改为记录“谁展开了”，默认全关) 👇👇👇
  const [expandedGroups, setExpandedGroups] = useState({});

  // 👇👇👇 2. 自动展开逻辑：当有任务开始时，自动展开它所在的分组 👇👇👇
  useEffect(() => {
    if (activeTaskId) {
      const activeTask = tasks.find(t => t.id === activeTaskId);
      if (activeTask) {
        const groupName = activeTask.project || "默认项目";
        setExpandedGroups(prev => ({
          ...prev,
          [groupName]: true // 强制展开当前正在进行的分组
        }));
      }
    }
  }, [activeTaskId, tasks]);

  const toggleGroup = (groupName) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };
  const [reviewDate, setReviewDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [reportDate, setReportDate] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [todayReview, setTodayReview] = useState(null);

  // Forms
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [showValueHelper, setShowValueHelper] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    project: "",
    customProject: "",
    estValue: 0,
    manualDurationMinutes: 0,
    manualRevenue: 0,
  });
  const [isNewProject, setIsNewProject] = useState(false);
  const [adjustTaskData, setAdjustTaskData] = useState({
    id: null,
    addMinutes: 0,
    addRevenue: 0,
  });
  const [reviewForm, setReviewForm] = useState({
    bioEnergy: 5,
    bioEnergyNote: "",
    agency: 5,
    agencyNote: "",
    connection: 5,
    connectionNote: "",
    flow: 5,
    flowNote: "",
    awe: 5,
    aweNote: "",
    highlight: "",
  });
  const [revenueInput, setRevenueInput] = useState("");
  const [editRevenueId, setEditRevenueId] = useState(null);
  const lastTickRef = useRef(Date.now()); // [新增] 记录上次计时的真实系统时间
  // --- Auth with Fallback ---
  useEffect(() => {
    const initAuth = async () => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          setIsLocalMode(false);
        }
        setAuthLoading(false);
      });
      return unsubscribe;
    };
    initAuth();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      alert(`登录失败: ${error.message}\n请检查控制台授权域名。`);
    }
  };

  const handleAnonymousLogin = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Anonymous auth failed", error);
      // Fallback to Local Mode if auth fails (e.g. admin restricted)
      startLocalMode();
    }
  };

  const startLocalMode = () => {
    setIsLocalMode(true);
    setUser({ uid: "local-user", isAnonymous: true });
    // Load local data
    const localTasks = JSON.parse(localStorage.getItem("ls_tasks") || "[]");
    const localReviews = JSON.parse(localStorage.getItem("ls_reviews") || "[]");
    setTasks(localTasks);
    setReviews(localReviews);
  };

  // --- Data Sync (Firebase or Local) ---
  useEffect(() => {
    if (!user) return;

    if (isLocalMode) {
      // Local Mode: Data is already loaded in startLocalMode, just ensure sync on updates
      // This effect mainly handles initial load if we were to reload page in local mode,
      // but for simplicity, we loaded in startLocalMode.
      // We can add a listener to localStorage if we want multi-tab support, but skipping for now.
      return;
    }

    const tasksUnsub = onSnapshot(
      collection(db, "artifacts", appId, "users", user.uid, "tasks"),
      (snap) => {
        setTasks(
          snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        );
      }
    );
    const q = query(
      collection(db, "artifacts", appId, "users", user.uid, "reviews"),
      orderBy("date", "desc"),
      limit(60)
    );
    const reviewsUnsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setReviews(list);
      const today = list.find(
        (r) => r.date === new Date().toISOString().split("T")[0]
      );
      setTodayReview(today || null);
    });
    return () => {
      tasksUnsub();
      reviewsUnsub();
    };
  }, [user, isLocalMode]);

  // Persist Local Data
  useEffect(() => {
    if (isLocalMode) {
      localStorage.setItem("ls_tasks", JSON.stringify(tasks));
      localStorage.setItem("ls_reviews", JSON.stringify(reviews));
    }
  }, [tasks, reviews, isLocalMode]);

  // --- Timer (真·系统时间补帧版) ---
  useEffect(() => {
    let interval;
    if (activeTaskId) {
      // 每次开始/恢复计时，记录下当前的真实时间戳
      lastTickRef.current = Date.now();

      interval = setInterval(() => {
        const now = Date.now();
        // 计算距离上次运行，真实过去了多少秒 (比如息屏了5分钟，这里算出来就是 300)
        const deltaSeconds = Math.round((now - lastTickRef.current) / 1000);

        if (deltaSeconds > 0) {
          setTasks((prev) =>
            prev.map((t) =>
              t.id === activeTaskId && t.status === "In Progress"
                ? { ...t, duration: (t.duration || 0) + deltaSeconds } // 直接加上真实的差值
                : t
            )
          );
          // 更新参考时间为当前时间
          lastTickRef.current = now;
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTaskId]);

  // --- Stats ---
  const stats = useMemo(() => {
    const completed = tasks.filter((t) => t.status === "Completed");
    const totalDurationHrs =
      tasks.reduce((acc, t) => acc + (t.duration || 0), 0) / 3600;
    const totalRevenue = tasks.reduce(
      (acc, t) => acc + (Number(t.actualRevenue) || 0),
      0
    );
    const avgROI = totalDurationHrs > 0 ? totalRevenue / totalDurationHrs : 0;
    const timeDebtTasks = completed.filter((t) => {
      const hrs = (t.duration || 0) / 3600;
      return hrs > 0 && (t.actualRevenue || 0) / hrs < HOURLY_THRESHOLD;
    }).length;
    const recentReviews = reviews.slice(0, 7);
    const avgAgency =
      recentReviews.length > 0
        ? (
            recentReviews.reduce((acc, r) => acc + Number(r.agency), 0) /
            recentReviews.length
          ).toFixed(1)
        : 0;
    return { totalDurationHrs, totalRevenue, avgROI, timeDebtTasks, avgAgency };
  }, [tasks, reviews]);
  // 👇👇👇 补上这段缺失的逻辑，白屏立刻就好 👇👇👇
  const [showUserMenu, setShowUserMenu] = useState(false); // 1. 控制菜单开关

  const playerStats = useMemo(() => {
    // 2. 计算 RPG 等级
    const totalXP = Math.floor(stats.totalDurationHrs * 60);
    const level = Math.floor(totalXP / 1000) + 1;
    const currentLevelXP = totalXP % 1000;
    const nextLevelXP = 1000;
    const progress = (currentLevelXP / nextLevelXP) * 100;

    let title = "见习者";
    if (level >= 3) title = "修行者";
    if (level >= 5) title = "觉醒者";
    if (level >= 10) title = "破局者";
    if (level >= 20) title = "主宰";

    return { totalXP, level, currentLevelXP, nextLevelXP, progress, title };
  }, [stats.totalDurationHrs]);
  const groupedTasks = useMemo(() => {
    const groups = {};
    tasks.forEach((task) => {
      const p = task.project || "默认项目";
      if (!groups[p])
        groups[p] = { name: p, tasks: [], totalTime: 0, totalRev: 0 };
      groups[p].tasks.push(task);
      groups[p].totalTime += task.duration || 0;
      groups[p].totalRev += task.actualRevenue || 0;
    });
    return Object.values(groups).sort((a, b) => b.totalTime - a.totalTime);
  }, [tasks]);

  const uniqueProjects = useMemo(
    () => [...new Set(tasks.map((t) => t.project || "默认项目"))],
    [tasks]
  );

  // --- Actions ---
  const updateLocalTask = (taskId, updates) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );
  };
  // 🟢【插入这个新函数】
  const handleExportJSON = () => {
    // 打包所有数据
    const data = {
      user: user?.uid,
      exportedAt: new Date().toISOString(),
      stats,
      tasks,
      reviews,
    };
    // 创建下载链接并自动点击
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `life-system-backup-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

 // 👇👇👇 最终修复版 handleTaskAction (暂停、完成均强制存档，拒绝清零) 👇👇👇
 const handleTaskAction = async (action, taskId, payload = null) => {
  if (!user) return;
  
  // 1. 获取当前内存中的最新任务状态 (包含刚刚跑出来的 duration)
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return; 

  const updates = {};

  // --- 动作 1: 开始/暂停 (Toggle) ---
  if (action === "toggle") {
    if (activeTaskId === taskId) {
      // 🛑 情况 A: 正在进行 -> 暂停
      setActiveTaskId(null);
      updates.status = "Pending";
      
      // 🚨🚨🚨 核心修复：暂停时也要存档！🚨🚨🚨
      // 把内存里的时间写入数据库，防止被云端旧数据覆盖
      updates.duration = task.duration || 0; 
      
    } else {
      // ▶️ 情况 B: 暂停/未开始 -> 开始
      setActiveTaskId(taskId);
      updates.status = "In Progress";
    }
  }

  // --- 动作 2: 完成任务 (Complete) ---
  if (action === "complete") {
    if (activeTaskId === taskId) setActiveTaskId(null); // 停止计时
    updates.status = "Completed";
    updates.endTime = new Date().toISOString();
    
    // 🚨🚨🚨 核心修复：完成时强制存档 🚨🚨🚨
    updates.duration = task.duration || 0; 

    // 自动结算金币
    if (!task.actualRevenue) {
       if (task.mode === 'bounty') {
          updates.actualRevenue = task.fixedReward || 0;
       } else if (task.hourlyRate > 0 && (task.duration || 0) > 0) {
          updates.actualRevenue = ((task.duration / 3600) * task.hourlyRate);
       }
    }
  }

  // --- 动作 3: 删除任务 ---
  if (action === "delete") {
    if (window.confirm("确认删除？")) {
      if (isLocalMode)
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      else
        await deleteDoc(
          doc(db, "artifacts", appId, "users", user.uid, "tasks", taskId)
        );
    }
    return;
  }

  // --- 动作 4: 撤销完成 ---
  if (action === "revert") {
    updates.status = "Pending";
    updates.endTime = null;
  }

  // --- 动作 5: 手动修改金额 ---
  if (action === "revenue") {
    updates.actualRevenue = Number(revenueInput);
  }

  // --- 动作 6: 补录/调整时间 ---
  if (action === "adjust") {
    const currentDuration = task.duration || 0;
    const currentRevenue = task.actualRevenue || 0;
    
    const newDuration = currentDuration + Number(payload.addMinutes) * 60;
    const newRevenue = currentRevenue + Number(payload.addRevenue);
    
    updates.duration = newDuration;
    updates.actualRevenue = newRevenue;
    
    if (payload.shouldStart) {
      updates.status = "In Progress";
      setActiveTaskId(taskId);
    }
    setShowAdjustModal(false);
  }

  // --- 统一提交更新 ---
  if (Object.keys(updates).length > 0) {
    if (isLocalMode) {
      updateLocalTask(taskId, updates);
    } else {
      await updateDoc(
        doc(db, "artifacts", appId, "users", user.uid, "tasks", taskId),
        updates
      );
    }
  }
};

  // 👇👇👇 这里的代码完全替换原来的 addTask 函数 👇👇👇
  // 👇👇👇 替换原来的 addTask 函数 (RPG 逻辑升级版) 👇👇👇
  const addTask = async (shouldStartImmediately = false) => {
    if (!user) return;

    // 1. 确定项目名称
    const finalProject = isNewProject
      ? newTask.customProject || "未命名项目"
      : newTask.project || "默认项目";

    if (!newTask.title && !isManualEntry) return;

    const id = Date.now().toString();

    // 2. 确定时间 (补录 vs 实时)
    let finalDate = new Date().toISOString();
    if (isManualEntry && targetDate) {
      finalDate = new Date(targetDate + "T12:00:00").toISOString();
    }

    // 3. 核心：计算 XP 倍率 (The Growth Multiplier)
    let multiplier = 1.0;
    if (newTask.xpType === "growth") multiplier = 2.0; // 进化 = 2倍经验
    if (newTask.xpType === "maintenance") multiplier = 0.5; // 维持 = 0.5倍经验

    // 4. 构建任务数据包
    let taskData = {
      id,
      title: newTask.title || "快速记录",
      project: finalProject,
      createdAt: finalDate,

      // --- RPG 新属性 ---
      mode: newTask.mode || "stream", // 'stream' (计时) or 'bounty' (悬赏)
      xpType: newTask.xpType || "work", // 'growth', 'work', 'maintenance'
      expMult: multiplier, // 存入倍率，方便后续计算

      // --- 金额逻辑 ---
      // 如果是悬赏模式，金额是固定赏金；如果是计时模式，金额是时薪
      hourlyRate: newTask.mode === "bounty" ? 0 : Number(newTask.estValue),
      fixedReward: newTask.mode === "bounty" ? Number(newTask.estValue) : 0,

      // --- 补录数据 ---
      duration: Number(newTask.manualDurationMinutes) * 60,
      actualRevenue: Number(newTask.manualRevenue), // 补录时直接填入的实际收益
    };

    // 5. 状态流转
    if (shouldStartImmediately) {
      taskData.status = "In Progress";
      setActiveTaskId(id);
    } else if (isManualEntry) {
      taskData.status = "Completed";
      taskData.endTime = finalDate;

      // 补录时的自动收益计算：
      // 如果没填实际收益，但有赏金/时薪，尝试自动计算
      if (!taskData.actualRevenue) {
        if (taskData.mode === "bounty") {
          taskData.actualRevenue = taskData.fixedReward;
        } else {
          // 补录时长(小时) * 时薪
          taskData.actualRevenue =
            (taskData.duration / 3600) * taskData.hourlyRate;
        }
      }
    } else {
      taskData.status = "Pending";
    }

    // 6. 保存到数据库
    if (isLocalMode) {
      setTasks((prev) => [taskData, ...prev]);
    } else {
      await setDoc(
        doc(db, "artifacts", appId, "users", user.uid, "tasks", id),
        taskData
      );
    }

    // 7. 重置表单 (保留项目以便连续输入)
    setNewTask({
      title: "",
      project: finalProject,
      customProject: "",
      estValue: 0,
      manualDurationMinutes: 0,
      manualRevenue: 0,
      mode: "stream", // 重置为默认流式
      xpType: "work", // 重置为默认搬砖
    });
    setShowAddModal(false);
    setIsManualEntry(false);
    setIsNewProject(false);
    setTargetDate(null);
  };
  // 👇👇👇 这是新加的函数，专门处理日历点击 👇👇👇
  const handleCalendarDateSelect = (dateStr, dayData) => {
    const todayStr = new Date().toISOString().split("T")[0];

    // 1. 禁止穿越未来
    if (dateStr > todayStr) {
      alert("无法预支未来！");
      return;
    }

    setTargetDate(dateStr); // 🟢 关键：把系统锁定在你点击的那一天

    if (!dayData || dayData.count === 0) {
      // 2. 如果当天没数据 -> 系统认为你想补录 -> 自动切到手动模式 -> 弹窗
      setIsManualEntry(true);
      setShowAddModal(true);
    } else {
      // 3. 如果当天有数据 -> 打开日报
      openDailyReport(dateStr, dayData);
    }
  };

  const openReviewForDate = (dateStr) => {
    setReviewDate(dateStr);
    const existingReview = reviews.find((r) => r.date === dateStr);
    const formData = existingReview
      ? {
          bioEnergy: existingReview.bioEnergy || 5,
          bioEnergyNote: existingReview.bioEnergyNote || "",
          agency: existingReview.agency || 5,
          agencyNote: existingReview.agencyNote || "",
          connection: existingReview.connection || 5,
          connectionNote: existingReview.connectionNote || "",
          flow: existingReview.flow || 5,
          flowNote: existingReview.flowNote || "",
          awe: existingReview.awe || 5,
          aweNote: existingReview.aweNote || "",
          highlight: existingReview.highlight || "",
        }
      : {
          bioEnergy: 5,
          bioEnergyNote: "",
          agency: 5,
          agencyNote: "",
          connection: 5,
          connectionNote: "",
          flow: 5,
          flowNote: "",
          awe: 5,
          aweNote: "",
          highlight: "",
        };
    setReviewForm(formData);
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    const reviewData = {
      ...reviewForm,
      date: reviewDate,
      updatedAt: new Date().toISOString(),
    };
    if (isLocalMode) {
      setReviews((prev) => {
        const filtered = prev.filter((r) => r.date !== reviewDate);
        return [...filtered, reviewData];
      });
    } else {
      await setDoc(
        doc(db, "artifacts", appId, "users", user.uid, "reviews", reviewDate),
        reviewData
      );
    }
    setShowReviewModal(false);
  };

  const openDailyReport = (dateStr, data) => {
    setReportDate(dateStr);
    setReportData(data);
    setShowDailyReportModal(true);
  };

  // 👇👇👇 第一步：替换时间格式化函数 (支持秒级跳动) 👇👇👇
  const formatTime = (seconds) => {
    if (!seconds) return "0s";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    // 逻辑：哪怕只有 5 秒，也要显示 5s，而不是 0m
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  if (authLoading)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <StyleLoader />
        <Loader2 className="animate-spin text-blue-500" />
      </div>
    );

  if (!user)
    return (
      <div className="min-h-screen w-full bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden animate-fade-in">
        <StyleLoader />
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative z-10 animate-slide-up text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-rose-500 rounded-2xl flex items-center justify-center mb-8 mx-auto shadow-lg">
            <Zap size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-rose-200 mb-2">
            强者系统
          </h1>
          <p className="text-slate-400 text-sm mb-10 tracking-[0.2em] uppercase font-bold">
            Life System v6.9 (Fixed)
          </p>
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white hover:bg-slate-50 text-slate-900 font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 mb-4"
          >
            <Zap size={18} />
            Google 登录
          </button>
          <button
            onClick={handleAnonymousLogin}
            className="w-full bg-white/5 hover:bg-white/10 text-slate-300 font-bold py-4 px-6 rounded-xl"
          >
            匿名访客试用
          </button>
          <button
            onClick={startLocalMode}
            className="w-full mt-2 text-slate-500 text-xs hover:text-slate-300 underline"
          >
            遇到问题？启用离线模式
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans pb-24 animate-fade-in">
      <StyleLoader />
      {/* 👇👇👇 新的 RPG 玩家状态栏 & 账号菜单 👇👇👇 */}
      <div className="sticky top-0 z-40 bg-[#020617]/90 backdrop-blur-xl border-b border-white/5 px-4 py-3 shadow-lg">
        <div className="flex justify-between items-center">
          {/* 左侧：玩家状态 HUD */}
          <div className="flex items-center gap-3 flex-1">
            {/* 头像/等级徽章 */}
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-white/10">
                <span className="font-bold text-white font-mono text-sm">
                  Lv.{playerStats.level}
                </span>
              </div>
              {/* 在线状态点 */}
              <div
                className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#020617] ${
                  isLocalMode ? "bg-amber-500" : "bg-emerald-500"
                }`}
              ></div>
            </div>

            {/* 经验条与头衔 */}
            <div className="flex-1 max-w-[160px]">
              <div className="flex justify-between items-end mb-1">
                <span className="text-xs font-bold text-white tracking-wider flex items-center gap-1">
                  {playerStats.title}
                  {isLocalMode && (
                    <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1 rounded">
                      OFFLINE
                    </span>
                  )}
                </span>
                <span className="text-[9px] font-mono text-blue-300">
                  {playerStats.currentLevelXP}/{playerStats.nextLevelXP} XP
                </span>
              </div>
              {/* 经验槽 */}
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                  style={{ width: `${playerStats.progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* 右侧：用户菜单触发器 */}
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors relative"
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                className="w-8 h-8 rounded-full border border-white/10"
                alt="User"
              />
            ) : (
              <LayoutDashboard size={24} />
            )}
          </button>
        </div>

        {/* 👇 账号切换下拉菜单 (解决切换难的问题) 👇 */}
        {showUserMenu && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/20"
              onClick={() => setShowUserMenu(false)}
            ></div>
            <div className="absolute top-full right-2 mt-2 w-64 bg-[#1e293b] border border-slate-700 rounded-2xl shadow-2xl p-4 z-50 animate-slide-up origin-top-right">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-700/50">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xl">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      className="w-10 h-10 rounded-full"
                      alt=""
                    />
                  ) : (
                    "👤"
                  )}
                </div>
                <div className="overflow-hidden">
                  <div className="text-sm font-bold text-white truncate">
                    {user?.displayName || "匿名强者"}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {user?.email || "Local User"}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (isLocalMode) {
                    setUser(null);
                    setIsLocalMode(false);
                  } else {
                    signOut(auth);
                  }
                  setShowUserMenu(false);
                }}
                className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
              >
                <LogOut size={16} /> 退出登录 / 切换账号
              </button>
            </div>
          </>
        )}
      </div>
      <div className="max-w-4xl mx-auto p-4 space-y-8 mt-4">
        {/* BLOCK 1: Life Audit */}
        {activeTab === "audit" && (
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-white/20 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity duration-500">
              <Fingerprint size={120} />
            </div>
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Heart className="text-rose-500" size={20} /> 人生满意度审计
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  "不要让亲人猜你幸不幸福，留下铁证。"
                </p>
              </div>
              <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setAuditViewMode("trends")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                    auditViewMode === "trends"
                      ? "bg-slate-700 text-white shadow"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <BarChart2 size={14} /> 趋势
                </button>
                <button
                  onClick={() => setAuditViewMode("calendar")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                    auditViewMode === "calendar"
                      ? "bg-slate-700 text-white shadow"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <CalendarIcon size={14} /> 日历
                </button>
              </div>
            </div>

            {auditViewMode === "trends" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10 animate-fade-in">
                <div
                  onClick={() => setSelectedStat("agency")}
                  className="bg-black/20 rounded-2xl p-4 border border-white/5 hover:border-amber-500/30 transition-colors group/card cursor-pointer"
                >
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
                      <Fingerprint size={12} /> 自主权趋势{" "}
                      <Info size={12} className="opacity-50" />
                    </span>
                    <span className="text-2xl font-mono font-bold text-white">
                      {stats.avgAgency}
                    </span>
                  </div>
                  <TrendChart
                    data={reviews.slice(0, 14)}
                    dataKey="agency"
                    color="#f59e0b"
                    height={40}
                  />
                </div>
                <div className="bg-black/20 rounded-2xl p-4 border border-white/5 hover:border-emerald-500/30 transition-colors flex flex-col justify-between">
                  <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
                    <Battery size={12} /> 生理能量
                  </span>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="h-10 w-1 bg-emerald-500/20 rounded-full overflow-hidden">
                      <div
                        className="w-full bg-emerald-500"
                        style={{
                          height: `${
                            (reviews.slice(0, 1)[0]?.bioEnergy || 0) * 10
                          }%`,
                        }}
                      ></div>
                    </div>
                    <div>
                      <span className="text-2xl font-mono font-bold text-white block leading-none">
                        {reviews.length > 0
                          ? reviews.slice(0, 1)[0]?.bioEnergy || "-"
                          : "-"}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase">
                        最新记录
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-black/20 rounded-2xl p-4 border border-white/5 hover:border-purple-500/30 transition-colors flex flex-col justify-center">
                  <span className="text-xs font-bold text-purple-500 uppercase mb-2 tracking-wider flex items-center gap-1">
                    <Zap size={12} /> 最新编年史
                  </span>
                  <p className="text-sm text-slate-300 italic line-clamp-2">
                    "{reviews.slice(0, 1)[0]?.highlight || "今日暂无记录..."}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative z-10">
                <CalendarView
                  type="review"
                  data={reviews}
                  onSelectDate={openReviewForDate}
                />
              </div>
            )}

            {auditViewMode === "trends" && (
              <div className="mt-4 flex justify-end relative z-10">
                <button
                  onClick={() =>
                    openReviewForDate(new Date().toISOString().split("T")[0])
                  }
                  className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg ${
                    todayReview
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/50"
                      : "bg-gradient-to-r from-rose-600 to-pink-600 text-white"
                  }`}
                >
                  {todayReview ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <PenTool size={16} />
                  )}{" "}
                  {todayReview ? "今日已审计 (点击修改)" : "开始今日审计"}
                </button>
              </div>
            )}
          </section>
        )}

        {/* BLOCK 2: Task Execution */}
        {activeTab === "execution" && (
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-white/20 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity duration-500">
              <Activity size={120} />
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 relative z-10 gap-4">
              {/* 标题区域 */}
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <LayoutDashboard className="text-blue-500" size={20} />{" "}
                  <span className="truncate">集团军作战 & ROI</span>
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  "像经营公司一样经营你的人生。"
                </p>
              </div>

              {/* 按钮控制区域 */}
              <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto">
                {/* 列表/日历 切换器 */}
                <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => setTaskViewMode("list")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                      taskViewMode === "list"
                        ? "bg-slate-700 text-white shadow"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <CheckSquare size={14} /> 列表
                  </button>
                  <button
                    onClick={() => setTaskViewMode("calendar")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                      taskViewMode === "calendar"
                        ? "bg-slate-700 text-white shadow"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <CalendarIcon size={14} /> 日历
                  </button>
                </div>

                {/* 新项目按钮 - 手机端只显示图标，PC端显示文字 */}
                <button
                  onClick={() => {
                    setTargetDate(null); // 🟢 [新增] 强制清空补录日期，确保是“新建今天”
                    setIsManualEntry(false);
                    setShowAddModal(true);
                  }}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  <Plus size={18} />
                  <span className="hidden md:inline">投入新项目</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 relative z-10">
              <StatBox
                label="真实时薪 (ROI)"
                value={`¥${stats.avgROI.toFixed(0)}`}
                unit="/h"
                color={
                  stats.avgROI < HOURLY_THRESHOLD
                    ? "text-rose-400"
                    : "text-emerald-400"
                }
                icon={<TrendingUp size={14} />}
                onClick={() => setSelectedStat("roi")}
              />
              <StatBox
                label="累计营收"
                value={`¥${stats.totalRevenue.toLocaleString()}`}
                unit=""
                color="text-emerald-400"
                icon={<DollarSign size={14} />}
                onClick={() => setSelectedStat("revenue")}
              />
              <StatBox
                label="总投入时长"
                value={stats.totalDurationHrs.toFixed(1)}
                unit="h"
                color="text-blue-400"
                icon={<Clock size={14} />}
                onClick={() => setSelectedStat("duration")}
              />
              <StatBox
                label="时间负债"
                value={stats.timeDebtTasks}
                unit="个"
                color={
                  stats.timeDebtTasks > 0 ? "text-rose-400" : "text-slate-400"
                }
                icon={<AlertCircle size={14} />}
                onClick={() => setSelectedStat("debt")}
              />
            </div>

            {taskViewMode === "list" ? (
              <div className="space-y-8 relative z-10 animate-fade-in">
                {/* 空状态提示 */}
                {groupedTasks.length === 0 && (
                  <div className="text-center py-12 text-slate-600 text-xs border border-dashed border-slate-800 rounded-2xl">
                    暂无战斗部署，请新建项目。
                  </div>
                )}

                {/* 任务分组渲染 */}
                {/* 👇👇👇 第二步：任务列表渲染 (实时金币 + 经验值 + 悬赏模式) 👇👇👇 */}
              {groupedTasks.map((group) => {
                const isCollapsed = collapsedGroups[group.name];

                return (
                  <div key={group.name} className="space-y-3">
                    {/* 分组标题栏 */}
                    <div
                      className="flex items-center gap-2 px-1 mb-2 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => toggleGroup(group.name)}
                    >
                      <div className="p-1.5 bg-slate-800/80 rounded-lg border border-white/5">
                        <FolderOpen size={14} className="text-blue-400" />
                      </div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex-shrink-0">
                        {group.name}
                      </h3>
                      <div
                        className={`text-slate-500 transition-transform duration-300 ${
                          isCollapsed ? "-rotate-90" : "rotate-0"
                        }`}
                      >
                        <ChevronDown size={14} />
                      </div>
                      <div className="h-px bg-slate-800 flex-1 ml-2"></div>
                      <span className="text-[10px] text-slate-600 font-mono bg-slate-900/50 px-2 py-1 rounded-lg border border-white/5">
                        {formatTime(group.totalTime)} · ¥{group.totalRev.toFixed(0)}
                      </span>
                    </div>

                    {/* 任务卡片列表 */}
                    {!isCollapsed && (
                      <div className="space-y-3 animate-fade-in origin-top">
                        {group.tasks.map((task) => {
                          const isCompleted = task.status === "Completed";
                          const isActive = activeTaskId === task.id;
                          const isBounty = task.mode === 'bounty';
                          const xpType = task.xpType || 'work';

                          // 🟢 1. 实时计算：当前已赚取的金额 (Real-time Revenue)
                          let currentRevenue = 0;
                          if (task.actualRevenue) {
                             currentRevenue = task.actualRevenue; // 如果已核算，显示核算值
                          } else if (isBounty) {
                             currentRevenue = 0; // 悬赏任务没做完前显示 0
                          } else {
                             // 计时模式：(当前秒数 / 3600) * 时薪
                             currentRevenue = ((task.duration || 0) / 3600) * (task.hourlyRate || 0);
                          }

                          // 🟣 2. 实时计算：当前已获得的经验 (Real-time XP)
                          // 逻辑：(分钟数) * 倍率 (向下取整，更有获得感)
                          const currentXP = Math.floor(((task.duration || 0) / 60) * (task.expMult || 1));

                          // 🔴 3. 判断时间负债
                          const taskHours = (task.duration || 0) / 3600;
                          const realHourlyRate = taskHours > 0 ? currentRevenue / taskHours : 0;
                          const isTimeDebt = !isBounty && isCompleted && taskHours > 0 && realHourlyRate < HOURLY_THRESHOLD;

                          return (
                            <div
                              key={task.id}
                              className={`relative group overflow-hidden rounded-2xl border transition-all duration-300 ${
                                isActive
                                  ? "bg-blue-900/10 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                                  : isTimeDebt
                                  ? "bg-rose-950/10 border-rose-500/30 hover:border-rose-500/50"
                                  : "bg-[#1e293b]/40 border-white/5 hover:border-white/10 hover:bg-[#1e293b]/60"
                              }`}
                            >
                              {/* 激活光效 */}
                              {isActive && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]"></div>
                              )}
                              
                              <div className="p-4 flex flex-row items-center justify-between gap-3">
                                {/* 左侧信息 */}
                                <div className="flex-1 min-w-0">
                                  {/* 标题 & 标签行 */}
                                  <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                                    {/* 经验标签 */}
                                    {xpType === 'growth' && <span className="text-[9px] font-bold bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">🟣 进化</span>}
                                    {xpType === 'maintenance' && <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">🟢 维持</span>}
                                    {isBounty && <span className="text-[9px] font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">🏆 悬赏</span>}

                                    <h4 className={`font-bold text-base truncate ${isCompleted ? "text-slate-400 line-through decoration-slate-700" : "text-slate-100"}`}>
                                      {task.title}
                                    </h4>
                                  </div>

                                  {/* 数据胶囊行 (动态核心) */}
                                  <div className="flex flex-wrap gap-2">
                                    
                                    {/* ⏱️ 1. 实时时长 (带秒) */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setAdjustTaskData({ id: task.id, addMinutes: 0, addRevenue: 0 });
                                        setShowAdjustModal(true);
                                      }}
                                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                                        isActive ? "text-blue-300 border-blue-500/30 bg-blue-500/10" : "bg-black/20 border-white/5 text-slate-400"
                                      }`}
                                    >
                                      <Clock size={12} className={isActive ? "animate-spin-slow" : ""} />
                                      {formatTime(task.duration)}
                                    </button>

                                    {/* 💰 2. 实时金币 (Active Revenue) */}
                                    {(currentRevenue > 0 || isBounty) && (
                                      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono ${
                                          isBounty && !isCompleted 
                                          ? "text-amber-400 border-amber-500/30 bg-amber-500/10" // 悬赏锁定态 (金色)
                                          : "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" // 实时进账态 (绿色)
                                      }`}>
                                        <span className="font-sans opacity-50">¥</span>
                                        {isBounty && !isCompleted 
                                            ? task.fixedReward // 悬赏模式显示总赏金
                                            : currentRevenue.toFixed(2) // 计时模式显示小数点后两位
                                        }
                                        {isBounty && !isCompleted && <Target size={10} className="ml-1 opacity-50" />}
                                      </div>
                                    )}

                                    {/* ✨ 3. 实时经验 (Live XP) */}
                                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-mono">
                                       <span className="font-sans">✨</span>
                                       {currentXP} XP
                                    </div>

                                  </div>
                                </div>

                                {/* 右侧操作按钮 (保持不变) */}
                                <div className="flex items-center gap-2 pl-2">
                                  {task.status !== "Completed" ? (
                                    <>
                                      <button
                                        onClick={() => handleTaskAction("toggle", task.id)}
                                        className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                                          isActive
                                            ? "bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20 active:scale-95"
                                            : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5"
                                        }`}
                                      >
                                        {isActive ? <Square size={18} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                                      </button>
                                      <button
                                        onClick={() => handleTaskAction("complete", task.id)}
                                        className="w-11 h-11 rounded-xl bg-white/5 border border-white/5 text-emerald-500 flex items-center justify-center hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all active:scale-95"
                                      >
                                        <CheckCircle2 size={22} />
                                      </button>
                                    </>
                                  ) : (
                                    <div className="flex items-center gap-1">
                                      {/* 核算与撤销按钮 */}
                                       {editRevenueId === task.id ? (
                                        <div className="flex items-center gap-1 animate-fade-in mr-1">
                                          <input
                                            type="number"
                                            value={revenueInput}
                                            onChange={(e) => setRevenueInput(e.target.value)}
                                            className="w-16 bg-black/50 border border-blue-500 rounded-lg text-xs px-2 py-2 text-white outline-none font-mono"
                                            autoFocus
                                            placeholder="0"
                                          />
                                          <button
                                            onClick={() => {
                                              handleTaskAction("revenue", task.id);
                                              setEditRevenueId(null);
                                            }}
                                            className="bg-blue-600 text-white text-xs px-3 py-2 rounded-lg font-bold"
                                          >
                                            OK
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => {
                                            setEditRevenueId(task.id);
                                            setRevenueInput(task.actualRevenue);
                                          }}
                                          className={`mr-1 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                                            isTimeDebt
                                              ? "border-rose-500/30 text-rose-400 bg-rose-500/10"
                                              : task.actualRevenue
                                              ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                                              : "border-dashed border-slate-700 text-slate-500 hover:border-slate-500"
                                          }`}
                                        >
                                          {task.actualRevenue ? `¥${task.actualRevenue}` : "核算?"}
                                        </button>
                                      )}
                                       <button onClick={() => handleTaskAction("revert", task.id)} className="w-10 h-10 rounded-lg bg-slate-800/50 text-slate-500 flex items-center justify-center hover:text-blue-400"><Undo2 size={18} /></button>
                                    </div>
                                  )}
                                  <button onClick={() => handleTaskAction("delete", task.id)} className="w-10 h-10 flex items-center justify-center text-slate-700 hover:text-rose-500 rounded-lg"><Trash2 size={18} /></button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
              </div>
            ) : (
              <div className="relative z-10">
                <CalendarView
                  type="task"
                  data={tasks}
                  onSelectDate={handleCalendarDateSelect}
                />
              </div>
            )}
          </section>
        )}

        {/* === Tab 3: Assets (新增的资产板块) === */}
        {activeTab === "assets" && (
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 animate-fade-in">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <ShieldCheck className="text-slate-400" size={20} /> 资产与数据
            </h2>
            <div className="space-y-4">
              <div className="bg-black/40 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <Database size={16} className="text-blue-500" /> JSON
                    数据导出
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    将所有人生数据打包下载，确保数据主权。
                  </div>
                </div>
                {/* 这里的 handleExportJSON 就是你刚才在第4步加的那个函数 */}
                <button
                  onClick={handleExportJSON}
                  className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors"
                >
                  <Download size={18} />
                </button>
              </div>
              <div className="bg-black/40 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">账户状态</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {isLocalMode
                      ? "离线模式 (数据存储在浏览器)"
                      : `已同步云端 (${user.email || "Google User"})`}
                  </div>
                </div>
                {isLocalMode && (
                  <button
                    onClick={() => {
                      setUser(null);
                      setIsLocalMode(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg"
                  >
                    去登录同步
                  </button>
                )}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Review Modal (动态仪表盘升级版) */}
      {showReviewModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-md transition-opacity animate-fade-in"
          onClick={() => setShowReviewModal(false)}
        >
          <div
            className="bg-[#0f172a] border-t sm:border border-slate-800 sm:rounded-3xl w-full max-w-md shadow-2xl animate-slide-up h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* === 1. 顶部动态仪表盘 (核心升级) === */}
            {(() => {
              // 实时计算平均分
              const avgScore = (
                (Number(reviewForm.bioEnergy) +
                  Number(reviewForm.agency) +
                  Number(reviewForm.connection) +
                  Number(reviewForm.flow) +
                  Number(reviewForm.awe)) /
                5
              ).toFixed(1);

              // 根据分数决定颜色和评语
              let statusColor = "text-rose-500";
              let statusBg = "bg-rose-500/10 border-rose-500/20";
              let statusText = "🛑 系统崩溃";

              if (avgScore >= 3) {
                statusColor = "text-orange-400";
                statusBg = "bg-orange-500/10 border-orange-500/20";
                statusText = "⚠️ 艰难维持";
              }
              if (avgScore >= 5) {
                statusColor = "text-yellow-400";
                statusBg = "bg-yellow-500/10 border-yellow-500/20";
                statusText = "⚓️ 平稳运行";
              }
              if (avgScore >= 7) {
                statusColor = "text-emerald-400";
                statusBg = "bg-emerald-500/10 border-emerald-500/20";
                statusText = "🚀 状态极佳";
              }
              if (avgScore >= 9) {
                statusColor = "text-cyan-400";
                statusBg =
                  "bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.3)]";
                statusText = "💎 巅峰时刻";
              }

              return (
                <div className="shrink-0 bg-[#0f172a] z-20 border-b border-slate-800 pb-4 pt-6 px-6 rounded-t-3xl relative overflow-hidden">
                  {/* 背景光效 */}
                  <div
                    className={`absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 ${statusColor.replace(
                      "text-",
                      "bg-"
                    )}/10 blur-[60px] pointer-events-none rounded-full`}
                  ></div>

                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                        今日综合状态
                      </h3>
                      <div
                        className={`text-4xl font-mono font-bold transition-all duration-500 flex items-baseline gap-2 ${statusColor}`}
                      >
                        {avgScore}
                        <span className="text-sm font-sans font-bold opacity-80 px-2 py-0.5 rounded-lg border bg-black/20 border-white/10">
                          {statusText}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowReviewModal(false)}
                      className="p-2 bg-slate-800/50 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* === 2. 可滚动的内容区 === */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <AuditItem
                type="bioEnergy"
                val={reviewForm.bioEnergy}
                setVal={(v) => setReviewForm({ ...reviewForm, bioEnergy: v })}
                note={reviewForm.bioEnergyNote}
                setNote={(v) =>
                  setReviewForm({ ...reviewForm, bioEnergyNote: v })
                }
              />
              <AuditItem
                type="agency"
                val={reviewForm.agency}
                setVal={(v) => setReviewForm({ ...reviewForm, agency: v })}
                note={reviewForm.agencyNote}
                setNote={(v) => setReviewForm({ ...reviewForm, agencyNote: v })}
              />
              <AuditItem
                type="connection"
                val={reviewForm.connection}
                setVal={(v) => setReviewForm({ ...reviewForm, connection: v })}
                note={reviewForm.connectionNote}
                setNote={(v) =>
                  setReviewForm({ ...reviewForm, connectionNote: v })
                }
              />
              <AuditItem
                type="flow"
                val={reviewForm.flow}
                setVal={(v) => setReviewForm({ ...reviewForm, flow: v })}
                note={reviewForm.flowNote}
                setNote={(v) => setReviewForm({ ...reviewForm, flowNote: v })}
              />
              <AuditItem
                type="awe"
                val={reviewForm.awe}
                setVal={(v) => setReviewForm({ ...reviewForm, awe: v })}
                note={reviewForm.aweNote}
                setNote={(v) => setReviewForm({ ...reviewForm, aweNote: v })}
              />

              {/* 编年史输入区 (UI微调) */}
              <div className="pt-4 border-t border-slate-800/50">
                <label className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                  <PenTool size={12} /> 史官笔录 (One Line Chronicle)
                </label>
                <div className="relative">
                  <textarea
                    value={reviewForm.highlight}
                    onChange={(e) =>
                      setReviewForm({
                        ...reviewForm,
                        highlight: e.target.value,
                      })
                    }
                    className="w-full bg-[#1e293b]/40 border border-slate-700/50 rounded-2xl p-4 text-base h-32 outline-none focus:border-purple-500/50 focus:bg-[#1e293b]/60 text-slate-200 placeholder:text-slate-600 transition-all resize-none leading-relaxed"
                    placeholder="此刻，有什么值得被写进你的人生传记里？..."
                  />
                  {/* 装饰性角标 */}
                  <div className="absolute bottom-3 right-3 opacity-30">
                    <History size={16} />
                  </div>
                </div>
              </div>
            </div>

            {/* === 3. 底部固定按钮 === */}
            <div className="p-6 pt-2 bg-[#0f172a] border-t border-slate-800 z-20">
              <button
                onClick={submitReview}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-2xl font-bold text-white shadow-lg shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 text-base tracking-wide"
              >
                <CheckCircle2 size={20} /> 确认今日归档
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task / Manual Entry Modal (RPG 契约升级版) */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-[#0f172a] border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 顶部标题栏 */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                {targetDate ? (
                  <>
                    <CalendarIcon size={18} className="text-amber-500" />{" "}
                    补录旧账: {targetDate}
                  </>
                ) : (
                  <>
                    <Plus size={18} className="text-blue-500" /> 发布新悬赏
                  </>
                )}
              </h3>
              <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                <button
                  onClick={() => setIsManualEntry(false)}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded transition-all ${
                    !isManualEntry
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  实时
                </button>
                <button
                  onClick={() => setIsManualEntry(true)}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded transition-all ${
                    isManualEntry
                      ? "bg-amber-600 text-white shadow"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  补录
                </button>
              </div>
            </div>

            <div className="space-y-5">
              {/* 1. 核心属性：结算模式 (Stream vs Bounty) */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">
                  选择结算模式 (Settlement Mode)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setNewTask({ ...newTask, mode: "stream" })}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      newTask.mode !== "bounty" // 默认 stream
                        ? "bg-blue-500/10 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                        : "bg-black/40 border-slate-800 text-slate-500 hover:border-slate-600"
                    }`}
                  >
                    <Clock size={20} />
                    <span className="text-xs font-bold">⏳ 计时付 (流式)</span>
                    <span className="text-[9px] opacity-60">
                      按时长累计收益
                    </span>
                  </button>
                  <button
                    onClick={() => setNewTask({ ...newTask, mode: "bounty" })}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      newTask.mode === "bounty"
                        ? "bg-amber-500/10 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                        : "bg-black/40 border-slate-800 text-slate-500 hover:border-slate-600"
                    }`}
                  >
                    <Target size={20} />
                    <span className="text-xs font-bold">🏆 一口价 (悬赏)</span>
                    <span className="text-[9px] opacity-60">
                      必须完工才结算
                    </span>
                  </button>
                </div>
              </div>

              {/* 2. 项目与任务名 */}
              <div className="space-y-3">
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  className="w-full bg-black/40 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 outline-none focus:border-blue-500 transition-all font-bold"
                  placeholder="任务名称 (e.g. 攻克算法题)"
                  autoFocus
                />

                <div className="flex gap-2">
                  <select
                    value={isNewProject ? "NEW" : newTask.project}
                    onChange={(e) => {
                      if (e.target.value === "NEW") {
                        setIsNewProject(true);
                        setNewTask({ ...newTask, project: "" });
                      } else {
                        setIsNewProject(false);
                        setNewTask({ ...newTask, project: e.target.value });
                      }
                    }}
                    className="flex-1 bg-black/40 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300 outline-none focus:border-blue-500"
                  >
                    <option value="" disabled>
                      选择项目...
                    </option>
                    {uniqueProjects.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                    <option value="NEW">+ 新建项目</option>
                  </select>
                  {isNewProject && (
                    <input
                      type="text"
                      value={newTask.customProject}
                      onChange={(e) =>
                        setNewTask({
                          ...newTask,
                          customProject: e.target.value,
                        })
                      }
                      className="flex-1 bg-black/40 border border-blue-500/50 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 animate-fade-in"
                      placeholder="新项目名"
                    />
                  )}
                </div>
              </div>

              {/* 3. 价值定义 (XP倍率 & 金额) */}
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 space-y-4">
                {/* XP 成长类型 */}
                <div>
                  <label className="text-[10px] font-bold text-purple-400 uppercase mb-2 block flex items-center gap-1">
                    <Zap size={10} /> 经验值倍率 (XP Growth)
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setNewTask({ ...newTask, xpType: "growth" })
                      }
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                        newTask.xpType === "growth"
                          ? "bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-900/50"
                          : "bg-slate-800 text-slate-400 border-transparent hover:bg-slate-700"
                      }`}
                    >
                      🟣 进化 (200%)
                    </button>
                    <button
                      onClick={() => setNewTask({ ...newTask, xpType: "work" })}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                        !newTask.xpType || newTask.xpType === "work"
                          ? "bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-900/50"
                          : "bg-slate-800 text-slate-400 border-transparent hover:bg-slate-700"
                      }`}
                    >
                      🔵 搬砖 (100%)
                    </button>
                    <button
                      onClick={() =>
                        setNewTask({ ...newTask, xpType: "maintenance" })
                      }
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                        newTask.xpType === "maintenance"
                          ? "bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-900/50"
                          : "bg-slate-800 text-slate-400 border-transparent hover:bg-slate-700"
                      }`}
                    >
                      🟢 维持 (50%)
                    </button>
                  </div>
                </div>

                {/* 金额设定 */}
                <div>
                  <label className="text-[10px] font-bold text-emerald-400 uppercase mb-2 block flex items-center gap-1">
                    <DollarSign size={10} />
                    {newTask.mode === "bounty"
                      ? "悬赏总金额 (Bounty)"
                      : "预计时薪 (Hourly Rate)"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-mono">
                      ¥
                    </span>
                    <input
                      type="number"
                      value={newTask.estValue}
                      onChange={(e) =>
                        setNewTask({ ...newTask, estValue: e.target.value })
                      }
                      className="w-full bg-black/40 border border-emerald-500/30 rounded-xl py-3 pl-8 pr-4 text-emerald-400 font-mono font-bold outline-none focus:border-emerald-500 placeholder:text-slate-700"
                      placeholder="0"
                    />
                    {newTask.mode !== "bounty" && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">
                        / hour
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 补录模式下的额外时间输入 */}
              {isManualEntry && (
                <div className="animate-fade-in">
                  <label className="text-[10px] font-bold text-amber-500 uppercase mb-1 block">
                    已耗时 (分钟)
                  </label>
                  <input
                    type="number"
                    value={newTask.manualDurationMinutes}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        manualDurationMinutes: e.target.value,
                      })
                    }
                    className="w-full bg-black/40 border border-amber-500/50 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {/* 底部按钮 */}
              <div className="pt-2">
                <button
                  onClick={() => addTask(isManualEntry ? false : true)} // 补录直接归档，实时则开始计时
                  className={`w-full py-4 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${
                    newTask.mode === "bounty"
                      ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
                  }`}
                >
                  {isManualEntry ? (
                    <>
                      {" "}
                      <CheckCircle2 size={18} /> 立即归档入库{" "}
                    </>
                  ) : newTask.mode === "bounty" ? (
                    <>
                      {" "}
                      <Target size={18} /> 发布悬赏令{" "}
                    </>
                  ) : (
                    <>
                      {" "}
                      <Play size={18} /> 启动计时器{" "}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Report Modal (New Feature) */}
      {showDailyReportModal && reportData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowDailyReportModal(false)}
        >
          <div
            className="bg-[#0f172a] border border-slate-800 p-6 rounded-3xl max-w-sm w-full shadow-2xl animate-slide-up max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-lg">
                  {reportDate.split("-")[2]}
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">单日战报</h3>
                  <p className="text-slate-500 text-xs font-mono">
                    {reportDate}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDailyReportModal(false)}
                className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">
                  当日投入
                </div>
                <div className="font-mono text-white text-lg font-bold">
                  {(reportData.duration / 3600).toFixed(1)}h
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">
                  当日产出
                </div>
                <div className="font-mono text-emerald-400 text-lg font-bold">
                  ¥
                  {reportData.tasks.reduce(
                    (acc, t) => acc + (t.actualRevenue || 0),
                    0
                  )}
                </div>
              </div>
            </div>
            {/* 👇👇👇 [新增] 一键补录按钮 👇👇👇 */}
            <button
              onClick={() => {
                setShowDailyReportModal(false); // 关闭战报
                setTargetDate(reportDate); // 🟢 关键：锁定战报显示的日期
                setIsManualEntry(true); // 开启手动模式
                setShowAddModal(true); // 打开输入弹窗
              }}
              className="w-full py-3 mb-4 bg-white/5 border border-dashed border-slate-700 hover:bg-blue-600/10 hover:border-blue-500/50 hover:text-blue-400 text-slate-500 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Plus size={14} /> 补录 {reportDate} 的任务
            </button>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                时间轴
              </h4>
              {reportData.tasks.length === 0 ? (
                <p className="text-slate-600 text-xs italic text-center py-4">
                  当日无战斗记录
                </p>
              ) : (
                reportData.tasks.map((task) => (
                  <div key={task.id} className="flex gap-3 relative group">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                      <div className="w-px h-full bg-slate-800 my-1 group-last:hidden"></div>
                    </div>
                    <div className="pb-4">
                      <div className="text-sm text-white font-medium">
                        {task.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                          {task.project}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {formatTime(task.duration)}
                        </span>
                        {task.actualRevenue > 0 && (
                          <span className="text-[10px] font-mono text-emerald-500">
                            +¥{task.actualRevenue}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Adjust Existing Task Modal */}
      {showAdjustModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowAdjustModal(false)}
        >
          <div
            className="bg-[#0f172a] border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <History size={18} className="text-amber-500" /> 补录旧账 /
              追加时间
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-amber-500 uppercase mb-1 block">
                    追加时长 (分钟)
                  </label>
                  <input
                    type="number"
                    value={adjustTaskData.addMinutes}
                    onChange={(e) =>
                      setAdjustTaskData({
                        ...adjustTaskData,
                        addMinutes: e.target.value,
                      })
                    }
                    className="w-full bg-black/40 border border-amber-500/50 rounded-xl px-4 py-3 outline-none focus:border-amber-500 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-emerald-500 uppercase mb-1 block">
                    追加收益 (¥)
                  </label>
                  <input
                    type="number"
                    value={adjustTaskData.addRevenue}
                    onChange={(e) =>
                      setAdjustTaskData({
                        ...adjustTaskData,
                        addRevenue: e.target.value,
                      })
                    }
                    className="w-full bg-black/40 border border-emerald-500/50 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 text-white"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                适用于：忘记开计时器、线下工作补录、或项目奖金追加。
              </p>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() =>
                    handleTaskAction("adjust", adjustTaskData.id, {
                      ...adjustTaskData,
                      shouldStart: false,
                    })
                  }
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all"
                >
                  仅补录
                </button>
                <button
                  onClick={() =>
                    handleTaskAction("adjust", adjustTaskData.id, {
                      ...adjustTaskData,
                      shouldStart: true,
                    })
                  }
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  <PlayCircle size={16} /> 补录并计时
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stat Details Modal */}
      {selectedStat && STAT_DETAILS[selectedStat] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedStat(null)}
        >
          <div
            className="bg-[#0f172a] border border-slate-800 p-8 rounded-3xl max-w-sm w-full shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                {STAT_DETAILS[selectedStat].icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {STAT_DETAILS[selectedStat].title}
                </h3>
                <p className="text-slate-400 text-xs">
                  {STAT_DETAILS[selectedStat].subtitle}
                </p>
              </div>
            </div>
            {selectedStat === "roi" && (
              <div className="bg-black/40 p-4 rounded-xl border border-white/5 mb-6">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-emerald-400 font-bold">总营收</span>{" "}
                  <span className="font-mono text-white">
                    ¥{stats.totalRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-px bg-slate-700 my-2 relative">
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0f172a] px-2 text-xs text-slate-500">
                    除以 (÷)
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm mt-2">
                  <span className="text-blue-400 font-bold">总时长</span>{" "}
                  <span className="font-mono text-white">
                    {stats.totalDurationHrs.toFixed(1)} 小时
                  </span>
                </div>
              </div>
            )}
            <div className="space-y-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                  <Calculator size={12} /> 计算公式
                </div>
                <p className="text-white font-mono text-sm bg-black/40 p-2 rounded-lg border border-white/5">
                  {STAT_DETAILS[selectedStat].formula}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <BrainCircuit size={12} /> 底层逻辑
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {STAT_DETAILS[selectedStat].logic}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <Lightbulb size={12} /> 强者建议
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {STAT_DETAILS[selectedStat].tips}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedStat(null)}
              className="w-full mt-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-white transition-colors"
            >
              明白了
            </button>
          </div>
        </div>
      )}
      {/* === 底部导航栏 === */}
      <div className="fixed bottom-0 left-0 w-full bg-[#020617]/90 backdrop-blur-xl border-t border-white/10 px-6 py-2 z-40 md:hidden pb-safe">
        <div className="flex justify-around items-center">
          <button
            onClick={() => setActiveTab("execution")}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${
              activeTab === "execution" ? "text-blue-500" : "text-slate-500"
            }`}
          >
            <LayoutDashboard size={24} />
            <span className="text-[10px] font-bold">作战</span>
          </button>

          <div className="w-px h-8 bg-white/10"></div>

          <button
            onClick={() => setActiveTab("audit")}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${
              activeTab === "audit" ? "text-rose-500" : "text-slate-500"
            }`}
          >
            <Heart size={24} />
            <span className="text-[10px] font-bold">审计</span>
          </button>

          <div className="w-px h-8 bg-white/10"></div>

          <button
            onClick={() => setActiveTab("assets")}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${
              activeTab === "assets" ? "text-slate-300" : "text-slate-500"
            }`}
          >
            <ShieldCheck size={24} />
            <span className="text-[10px] font-bold">资产</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, unit, color, icon, onClick }) => (
  <div
    onClick={onClick}
    className="bg-black/20 border border-white/5 hover:border-white/10 p-4 rounded-2xl cursor-pointer group transition-all active:scale-95"
  >
    <div className="flex justify-between items-start mb-2">
      <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1 group-hover:text-blue-400 transition-colors">
        {icon} {label}
      </div>
      <HelpCircle
        size={10}
        className="text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </div>
    <div className={`font-mono font-bold text-xl ${color}`}>
      {value}
      <span className="text-xs text-slate-600 ml-1 font-sans font-normal">
        {unit}
      </span>
    </div>
  </div>
);

export default App;
