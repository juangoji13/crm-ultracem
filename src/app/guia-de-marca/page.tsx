'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Copy,
  Check,
  Shield,
  Trophy,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Award,
  Crown,
  KeyRound,
  MapPin,
  Layers,
  Phone,
  MessageCircle,
  AlertTriangle,
  Building2,
  PlusCircle,
  Filter,
  FileCheck,
  Download,
  Info,
  CheckCheck,
  X,
  Palette,
  Maximize2,
  Monitor,
  Smartphone,
  ExternalLink,
} from 'lucide-react';

interface ColorSwatch {
  name: string;
  hex: string;
  rgb: string;
  role: string;
  textDark?: boolean;
}

interface ScreenItem {
  id: string;
  title: string;
  role: 'asesor' | 'gerente' | 'general';
  roleLabel: string;
  category: 'asesor' | 'gerente' | 'acceso';
  imageSrc: string;
  urlSimulated: string;
  deviceType: 'desktop' | 'mobile';
  description: string;
  businessRules: string[];
  tokens: string[];
}

export default function GuiaDeMarcaPage() {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [activeChipDemo, setActiveChipDemo] = useState<string>('todos');
  const [activeScreenCategory, setActiveScreenCategory] = useState<string>('todos');
  const [zoomImage, setZoomImage] = useState<ScreenItem | null>(null);

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2200);
  };

  const primaryColors: ColorSwatch[] = [
    {
      name: 'Azul Primario Ultracem',
      hex: '#003E78',
      rgb: 'rgb(0, 62, 120)',
      role: 'Cabeceras, botones primarios, títulos H1/H2 y chips de filtro activos.',
      textDark: false,
    },
    {
      name: 'Azul Marino Profundo',
      hex: '#002B54',
      rgb: 'rgb(0, 43, 84)',
      role: 'Bordes de cabecera, hover de botones y contenedor de credencial.',
      textDark: false,
    },
    {
      name: 'Azul Eléctrico Interactivo',
      hex: '#1E83EC',
      rgb: 'rgb(30, 131, 236)',
      role: 'Botón de registro de venta (+), barras de progreso activas y foco interactivo.',
      textDark: false,
    },
    {
      name: 'Amarillo Construcción (Acento)',
      hex: '#FFCA00',
      rgb: 'rgb(255, 202, 0)',
      role: 'Puntos Ultra, podio comercial de honor, alertas offline y bonificaciones.',
      textDark: true,
    },
  ];

  const surfaceColors: ColorSwatch[] = [
    {
      name: 'Blanco Puro',
      hex: '#FFFFFF',
      rgb: 'rgb(255, 255, 255)',
      role: 'Fondo de tarjetas, modales y formularios.',
      textDark: true,
    },
    {
      name: 'Gris Nieve (Superficie)',
      hex: '#F4F6F9',
      rgb: 'rgb(244, 246, 249)',
      role: 'Fondo general de la PWA para mitigar deslumbramiento en campo.',
      textDark: true,
    },
    {
      name: 'Gris Borde Estructural',
      hex: '#E0E6ED',
      rgb: 'rgb(224, 230, 237)',
      role: 'Divisores, contorno de inputs y pistas de avance.',
      textDark: true,
    },
    {
      name: 'Gris Carbón (Texto Secundario)',
      hex: '#4A5568',
      rgb: 'rgb(74, 85, 104)',
      role: 'Metadatos, descripciones secundarias y etiquetas de soporte.',
      textDark: false,
    },
  ];

  const statusColors: ColorSwatch[] = [
    {
      name: 'Verde Concreto (Óptimo)',
      hex: '#38A169',
      rgb: 'rgb(56, 161, 105)',
      role: 'Semáforo de recencia (<15d), ventas aprobadas y cumplimiento de cuota.',
      textDark: false,
    },
    {
      name: 'Ámbar Alerta (Preventivo)',
      hex: '#D97706',
      rgb: 'rgb(217, 119, 6)',
      role: 'Semáforo de recencia (16-30d) y advertencia preventiva de SLA.',
      textDark: false,
    },
    {
      name: 'Rojo Operativo (Crítico)',
      hex: '#E53E3E',
      rgb: 'rgb(229, 62, 62)',
      role: 'Semáforo de recencia (>30d), causales de rechazo y SLA vencido.',
      textDark: false,
    },
  ];

  const officialScreens: ScreenItem[] = [
    {
      id: 'screen-1',
      title: 'Dashboard Operativo del Asesor Comercial',
      role: 'asesor',
      roleLabel: 'Fuerza Comercial (Asesor)',
      category: 'asesor',
      imageSrc: '/screenshots/01-advisor-dashboard.png',
      urlSimulated: 'https://crm.ultracem.co/operaciones',
      deviceType: 'desktop',
      description: 'Vista principal de la fuerza de ventas en terreno: visualización de cuota mensual con barra dinámica, cartera semaforizada y botón prioritario para registro de despachos.',
      businessRules: [
        'Barra de avance en tiempo real con meta de Cemento Gris y Concreto.',
        'Semáforo de recencia (<15d Óptimo, 16-30d Alerta, >30d Crítico).',
        'Acceso directo a llamadas telefónicas y chat de WhatsApp con clientes.',
      ],
      tokens: ['#003E78', '#1E83EC', '#FFCA00', 'rounded-[5px]'],
    },
    {
      id: 'screen-2',
      title: 'Registro de Ventas con Evidencia de Báscula',
      role: 'asesor',
      roleLabel: 'Fuerza Comercial (Asesor)',
      category: 'asesor',
      imageSrc: '/screenshots/02-sale-registration-modal.png',
      urlSimulated: 'https://crm.ultracem.co/operaciones?modal=nueva-venta',
      deviceType: 'desktop',
      description: 'Formulario de registro de despachos con adjunto obligatorio de tiquete de báscula de planta o remisión sellada, conmutación automática de unidad (Ton vs m³) y cálculo previo de Puntos Ultra.',
      businessRules: [
        'Carga obligatoria de comprobante fotográfico para auditoría cruzada.',
        'Estimación previa de +125 pts estándar o +250 pts si el cliente es Crítico (Bono 2X).',
        'Persistencia en IndexedDB offline ante caídas de señal en obra.',
      ],
      tokens: ['#003E78', '#1E83EC', '#38A169', 'Dropzone'],
    },
    {
      id: 'screen-3',
      title: 'Tabla de Posiciones & Podio Comercial (SLC)',
      role: 'general',
      roleLabel: 'Todos los Roles',
      category: 'asesor',
      imageSrc: '/screenshots/03-leaderboard-ranking.png',
      urlSimulated: 'https://crm.ultracem.co/ranking',
      deviceType: 'desktop',
      description: 'Clasificación oficial en vivo de la fuerza comercial: Podio de honor Oro, Plata y Bronce, filtros unificados en azul `#003E78` y cálculo motivacional de brecha métrica.',
      businessRules: [
        'Ordenamiento dinámico por Volumen Despachado (Ton/m³) o Puntos Ultra.',
        'Indicador de distancia: brecha exacta en toneladas para superar al rival inmediato.',
        'Filtro cruzado estandarizado por Zona (Atlántico, Córdoba, Bolívar) y Producto.',
      ],
      tokens: ['#003E78', '#FFCA00', 'Pedestal Oro/Plata/Bronce'],
    },
    {
      id: 'screen-4',
      title: 'Catálogo Oficial de Incentivos y Recompensas',
      role: 'asesor',
      roleLabel: 'Fuerza Comercial (Asesor)',
      category: 'asesor',
      imageSrc: '/screenshots/04-rewards-catalog.png',
      urlSimulated: 'https://crm.ultracem.co/recompensas',
      deviceType: 'desktop',
      description: 'Portal de canje simulado de Puntos Ultra por artículos de dotación industrial, herramientas técnicas para obra y bienestar familiar, con emisión de voucher digital.',
      businessRules: [
        'Consulta de saldo en tiempo real con recordatorio de Bono 2X por reactivación.',
        'Barra de progreso porcentual individual por cada incentivo disponible.',
        'Generación de código único institucional copiable al portapapeles tras canje.',
      ],
      tokens: ['#003E78', '#FFCA00', '#38A169', 'Voucher Digital'],
    },
    {
      id: 'screen-5',
      title: 'Portal de Acceso Institucional (Credenciales Profesionales)',
      role: 'general',
      roleLabel: 'Portal General',
      category: 'acceso',
      imageSrc: '/screenshots/05-login-credentials.png',
      urlSimulated: 'https://crm.ultracem.co/login',
      deviceType: 'desktop',
      description: 'Pantalla de autenticación corporativa bajo jerarquía de 2 roles. Protege las claves institucionales y restringe la administración exclusivamente al Gerente.',
      businessRules: [
        'Ingreso con Código Oficial (ULTRA-ASE-XXX o ULTRA-GER-XXX) o correo corporativo.',
        'Aislamiento total de credenciales sin fuga de contraseñas de terceros.',
        'Validación de estado activo vs suspendido en motor PostgreSQL de Oracle Cloud.',
      ],
      tokens: ['#003E78', '#FFCA00', 'Contraseñas Protegidas'],
    },
    {
      id: 'screen-6',
      title: 'Dirección Comercial: Auditoría & Aprobación de Remisiones',
      role: 'gerente',
      roleLabel: 'Dirección Comercial (Gerente)',
      category: 'gerente',
      imageSrc: '/screenshots/06-manager-audit.png',
      urlSimulated: 'https://crm.ultracem.co/auditoria',
      deviceType: 'desktop',
      description: 'Mesa de inspección dividida (40% cola / 60% detalle): control de SLA corporativo de 48h, visor de báscula en alta resolución y aprobación instantánea con acreditación de puntos.',
      businessRules: [
        'Temporizador de SLA corporativo con alerta de vencimiento.',
        'Aprobación en 1 clic que acredita Puntos Ultra y actualiza metas en la BD.',
        'Rechazo estructurado con 4 causales obligatorias y observaciones para corrección.',
      ],
      tokens: ['#003E78', '#38A169', '#E53E3E', 'Split 40/60'],
    },
    {
      id: 'screen-7',
      title: 'Dirección Comercial: Tablero Ejecutivo & Analítica',
      role: 'gerente',
      roleLabel: 'Dirección Comercial (Gerente)',
      category: 'gerente',
      imageSrc: '/screenshots/07-manager-metrics.png',
      urlSimulated: 'https://crm.ultracem.co/metricas',
      deviceType: 'desktop',
      description: 'Tablero macro para la toma de decisiones: 4 KPIs primarios, penetración por línea de producto, cumplimiento porcentual por zona territorial y exportación a Excel.',
      businessRules: [
        '4 KPIs: Clientes Activos (1,248), Volumen (18,450 Ton), Ventas Aprobadas y Puntos.',
        'Distribución de producto: Cemento (66%), Concreto (21%), Morteros (8%), Pegantes (5%).',
        'Exportación instantánea en CSV codificado con UTF-8 BOM para Microsoft Excel.',
      ],
      tokens: ['#003E78', '#1E83EC', 'UTF-8 CSV'],
    },
    {
      id: 'screen-8',
      title: 'PWA Móvil en Terreno (Vista Smartphone)',
      role: 'asesor',
      roleLabel: 'Fuerza Comercial (Móvil)',
      category: 'acceso',
      imageSrc: '/screenshots/08-mobile-pwa-advisor.png',
      urlSimulated: 'https://crm.ultracem.co/m',
      deviceType: 'mobile',
      description: 'Diseño Mobile-First adaptado ergonómicamente para operación con una sola mano en visitas de campo a ferreterías y depósitos, con botones de marcación táctil.',
      businessRules: [
        'Optimizada para pantallas móviles de 360px a 430px de ancho.',
        'Barra de navegación táctil inferior docking y banners de aviso offline.',
        'Botón de llamada directa y enlace directo a WhatsApp sin abrir agenda.',
      ],
      tokens: ['Mobile-First', '#003E78', 'Táctil Ergonomía'],
    },
  ];

  const filteredScreens =
    activeScreenCategory === 'todos'
      ? officialScreens
      : officialScreens.filter((s) => s.category === activeScreenCategory);

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 flex flex-col font-sans selection:bg-[#FFCA00] selection:text-[#003E78]">
      {/* ========================================================================= */}
      {/* 1. TOP PERSISTENT NAVBAR                                                  */}
      {/* ========================================================================= */}
      <header className="h-16 bg-[#003E78] text-white px-4 sm:px-8 sticky top-0 z-40 shadow-md flex items-center justify-between border-b border-[#002B54]">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-[5px] bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer border border-white/20"
            title="Volver a la aplicación operativa del CRM"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al CRM</span>
          </Link>

          <div className="h-5 w-px bg-blue-300/30 hidden sm:block" />

          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#FFCA00]" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-100 hidden sm:inline">
              Guía Oficial de Marca &amp; UI
            </span>
          </div>
        </div>

        {/* Quick jump navigation */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-blue-200">
          <a href="#logotipo" className="px-2.5 py-1 rounded-[4px] hover:text-white hover:bg-white/10 transition">
            Logotipo
          </a>
          <a href="#colores" className="px-2.5 py-1 rounded-[4px] hover:text-white hover:bg-white/10 transition">
            Colores
          </a>
          <a href="#tipografia" className="px-2.5 py-1 rounded-[4px] hover:text-white hover:bg-white/10 transition">
            Tipografía
          </a>
          <a href="#geometria" className="px-2.5 py-1 rounded-[4px] hover:text-white hover:bg-white/10 transition">
            Geometría
          </a>
          <a href="#iconos" className="px-2.5 py-1 rounded-[4px] hover:text-white hover:bg-white/10 transition">
            Iconografía
          </a>
          <a href="#componentes" className="px-2.5 py-1 rounded-[4px] hover:text-white hover:bg-white/10 transition">
            Componentes
          </a>
          <a href="#pantallas" className="px-2.5 py-1 rounded-[4px] text-[#FFCA00] font-bold hover:bg-white/10 transition">
            Pantallas &amp; Mockups
          </a>
        </nav>

        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-[4px] bg-[#FFCA00] text-[#003E78]">
          v2.0 Oficial
        </span>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO HEADER (CLEAN & PROFESSIONAL)                                     */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-b from-[#003E78] to-[#002B54] text-white py-12 px-4 sm:px-8 border-b border-[#002B54]">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-[5px] bg-[#FFCA00] text-[#003E78] text-[10px] font-black uppercase tracking-wider">
              Branding Original Ultracem
            </span>
            <span className="text-xs text-blue-200 font-medium">Costa Caribe Colombiana</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Manual de Identidad Visual &amp; Catálogo Oficial de Pantallas
          </h1>

          <p className="text-sm sm:text-base text-blue-100 max-w-3xl leading-relaxed">
            Especificación técnica de activos visuales, tokens de diseño y suite completa de pantallas en alta resolución para el CRM Gamificado B2B de Ultracem S.A.S.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="#pantallas"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[5px] bg-[#FFCA00] hover:bg-amber-400 text-[#003E78] text-xs font-black uppercase tracking-wider shadow-md transition-all cursor-pointer"
            >
              <Monitor className="w-4 h-4" />
              <span>Ver Suite de Pantallas &amp; Mockups</span>
            </a>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[5px] bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 cursor-pointer"
            >
              <span>Abrir CRM en Vivo</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. MAIN CONTENT CONTAINER                                                 */}
      {/* ========================================================================= */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-14">
        {/* SECTION 1: LOGOTIPO CORPORATIVO */}
        <section id="logotipo" className="space-y-5 scroll-mt-20">
          <div className="border-b border-[#E0E6ED] pb-3">
            <span className="text-xs font-bold text-[#1E83EC] uppercase tracking-wider">Sección 01</span>
            <h2 className="text-xl font-bold text-[#003E78] flex items-center gap-2">
              <span>Logotipo Corporativo &amp; Variantes de Aplicación</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              El isotipo representa la solidez del concreto y la flecha de avance continuo hacia el futuro de la construcción.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Dark background variant */}
            <div className="bg-[#003E78] p-8 rounded-xl border border-[#002B54] shadow-xs flex flex-col justify-between space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFCA00] bg-white/10 px-2 py-0.5 rounded-[4px]">
                  Aplicación Principal (Fondo Corporativo)
                </span>
                <p className="text-xs text-blue-200 mt-2">
                  Uso en cabeceras de aplicación, barras de navegación persistentes y carátulas ejecutivas.
                </p>
              </div>

              <div className="h-16 flex items-center justify-center p-4 bg-[#002B54] rounded-lg border border-blue-400/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/logo-ultracem.webp"
                  alt="Ultracem Logo Blanco"
                  className="max-h-12 object-contain brightness-0 invert"
                />
              </div>

              <div className="text-[11px] text-blue-200 flex items-center justify-between border-t border-blue-400/20 pt-3">
                <span>Contraste: <strong>100% Monocromático Blanco</strong></span>
                <span>Fondo: <strong>#003E78</strong></span>
              </div>
            </div>

            {/* Light background variant */}
            <div className="bg-white p-8 rounded-xl border border-[#E0E6ED] shadow-xs flex flex-col justify-between space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#003E78] bg-slate-100 px-2 py-0.5 rounded-[4px]">
                  Aplicación Secundaria (Fondo Claro)
                </span>
                <p className="text-xs text-slate-500 mt-2">
                  Uso en documentos de remisión, reportes impresos de báscula y exportaciones formales.
                </p>
              </div>

              <div className="h-16 flex items-center justify-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/logo-ultracem.webp"
                  alt="Ultracem Logo Oficial"
                  className="max-h-12 object-contain"
                />
              </div>

              <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-3">
                <span>Versión: <strong>Institucional a Color</strong></span>
                <span>Fondo: <strong>#FFFFFF / #F4F6F9</strong></span>
              </div>
            </div>
          </div>

          {/* Rules strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 bg-white rounded-lg border border-[#E0E6ED] space-y-1">
              <span className="font-bold text-[#003E78] block">Zona de Protección</span>
              <p className="text-slate-500 text-[11px]">
                Espacio mínimo libre en los 4 bordes equivalente al 50% de la altura de la letra &quot;U&quot;.
              </p>
            </div>
            <div className="p-3.5 bg-white rounded-lg border border-[#E0E6ED] space-y-1">
              <span className="font-bold text-[#003E78] block">Altura Mínima Digital</span>
              <p className="text-slate-500 text-[11px]">
                32 píxeles de alto en vistas móviles y 40 píxeles en aplicaciones de escritorio.
              </p>
            </div>
            <div className="p-3.5 bg-white rounded-lg border border-[#E0E6ED] space-y-1">
              <span className="font-bold text-[#E53E3E] block">Usos No Permitidos</span>
              <p className="text-slate-500 text-[11px]">
                No condensar, no rotar, no aplicar sombras proyectadas ni alterar la proporción 1:1.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: PALETA CROMÁTICA OFICIAL */}
        <section id="colores" className="space-y-6 scroll-mt-20">
          <div className="border-b border-[#E0E6ED] pb-3">
            <span className="text-xs font-bold text-[#1E83EC] uppercase tracking-wider">Sección 02</span>
            <h2 className="text-xl font-bold text-[#003E78]">Paleta Cromática Oficial &amp; Tokens de Color</h2>
            <p className="text-xs text-slate-500 mt-1">
              Haz clic en cualquier tarjeta para copiar el código HEX directamente al portapapeles.
            </p>
          </div>

          {/* Primary Swatches */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Colores Primarios de Marca &amp; Acentos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {primaryColors.map((color) => {
                const isCopied = copiedHex === color.hex;
                return (
                  <div
                    key={color.hex}
                    onClick={() => copyToClipboard(color.hex)}
                    className="bg-white rounded-xl border border-[#E0E6ED] overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div
                      className="h-28 p-3 flex flex-col justify-between transition-transform group-hover:scale-[1.02]"
                      style={{ backgroundColor: color.hex }}
                    >
                      <div className="flex justify-end">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] shadow-2xs flex items-center gap-1 ${
                            color.textDark ? 'bg-black/10 text-slate-900' : 'bg-white/20 text-white'
                          }`}
                        >
                          {isCopied ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                          <span>{isCopied ? '¡Copiado!' : 'Copiar'}</span>
                        </span>
                      </div>
                      <p
                        className={`text-sm font-black font-mono tracking-wider ${
                          color.textDark ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        {color.hex}
                      </p>
                    </div>

                    <div className="p-3.5 space-y-1">
                      <p className="font-bold text-xs text-[#003E78]">{color.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{color.rgb}</p>
                      <p className="text-[11px] text-slate-600 leading-snug pt-1">{color.role}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Surfaces & Neutrals */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Superficies, Neutros &amp; Contornos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {surfaceColors.map((color) => {
                const isCopied = copiedHex === color.hex;
                return (
                  <div
                    key={color.hex}
                    onClick={() => copyToClipboard(color.hex)}
                    className="bg-white rounded-xl border border-[#E0E6ED] overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div
                      className="h-24 p-3 flex flex-col justify-between border-b border-[#E0E6ED] transition-transform group-hover:scale-[1.02]"
                      style={{ backgroundColor: color.hex }}
                    >
                      <div className="flex justify-end">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] shadow-2xs flex items-center gap-1 ${
                            color.textDark ? 'bg-black/10 text-slate-900' : 'bg-white/20 text-white'
                          }`}
                        >
                          {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{isCopied ? '¡Copiado!' : 'Copiar'}</span>
                        </span>
                      </div>
                      <p
                        className={`text-sm font-black font-mono tracking-wider ${
                          color.textDark ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        {color.hex}
                      </p>
                    </div>

                    <div className="p-3.5 space-y-1">
                      <p className="font-bold text-xs text-[#003E78]">{color.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{color.rgb}</p>
                      <p className="text-[11px] text-slate-600 leading-snug pt-1">{color.role}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Traffic Light Swatches */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Semáforo de Recencia &amp; Estados Operativos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {statusColors.map((color) => {
                const isCopied = copiedHex === color.hex;
                return (
                  <div
                    key={color.hex}
                    onClick={() => copyToClipboard(color.hex)}
                    className="bg-white rounded-xl border border-[#E0E6ED] overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div
                      className="h-20 p-3 flex flex-col justify-between transition-transform group-hover:scale-[1.02]"
                      style={{ backgroundColor: color.hex }}
                    >
                      <div className="flex justify-end">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-[4px] bg-white/20 text-white shadow-2xs flex items-center gap-1">
                          {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{isCopied ? '¡Copiado!' : 'Copiar'}</span>
                        </span>
                      </div>
                      <p className="text-sm font-black font-mono tracking-wider text-white">
                        {color.hex}
                      </p>
                    </div>

                    <div className="p-3.5 space-y-1">
                      <p className="font-bold text-xs text-[#003E78]">{color.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{color.rgb}</p>
                      <p className="text-[11px] text-slate-600 leading-snug pt-1">{color.role}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION 3: TIPOGRAFÍA & ESCALA */}
        <section id="tipografia" className="space-y-5 scroll-mt-20">
          <div className="border-b border-[#E0E6ED] pb-3">
            <span className="text-xs font-bold text-[#1E83EC] uppercase tracking-wider">Sección 03</span>
            <h2 className="text-xl font-bold text-[#003E78]">Tipografía &amp; Escala Jerárquica</h2>
            <p className="text-xs text-slate-500 mt-1">
              Diseñada para máxima legibilidad bajo sol brillante en dispositivos móviles de campo.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-[#E0E6ED] p-6 shadow-xs divide-y divide-slate-100">
            {/* Display H1 */}
            <div className="py-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">H1 Display / Títulos Principales</span>
                <p className="text-2xl font-bold text-[#003E78]">
                  Tablero Ejecutivo de Rendimiento
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500 shrink-0">24px · Bold (700) · Inter / Montserrat</span>
            </div>

            {/* H2 */}
            <div className="py-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">H2 Títulos de Sección</span>
                <p className="text-lg font-bold text-[#003E78]">
                  Mis Clientes &amp; Semáforo de Recencia
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500 shrink-0">18px · Bold (700) · Inter / Montserrat</span>
            </div>

            {/* H3 */}
            <div className="py-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">H3 Tarjetas &amp; Sub-encabezados</span>
                <p className="text-sm font-bold text-[#003E78]">
                  Remisión de Báscula #REM-2024-0847
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500 shrink-0">14px · Bold (700) · Inter / Montserrat</span>
            </div>

            {/* Body */}
            <div className="py-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div className="space-y-1 max-w-xl">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Body Texto General</span>
                <p className="text-xs text-[#4A5568] leading-relaxed">
                  Identifica cuentas con riesgo de fuga mediante el semáforo de compra. Registrar una venta a un cliente en semáforo crítico otorga un bono multiplicador 2X.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500 shrink-0">12px · Regular (400) · Inter</span>
            </div>

            {/* Badges */}
            <div className="py-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Badges &amp; Tags Técnicos</span>
                <p className="text-[10px] font-black uppercase tracking-wider text-[#003E78] bg-blue-50 px-2 py-0.5 rounded-[4px] inline-block border border-blue-200">
                  Fuerza Comercial Nivel Oro
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500 shrink-0">10px · Black (900) · Tracking +0.05em</span>
            </div>

            {/* Monospace */}
            <div className="py-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Monospace / Códigos &amp; NIT</span>
                <p className="font-mono text-xs font-bold text-[#003E78] bg-slate-100 px-2 py-0.5 rounded-[4px] inline-block">
                  ULTRA-ASE-003 · NIT 901.882.114-6
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500 shrink-0">12px · Mono (700) · ui-monospace</span>
            </div>
          </div>
        </section>

        {/* SECTION 4: GEOMETRÍA RECTANGULAR CORPORATIVA */}
        <section id="geometria" className="space-y-5 scroll-mt-20">
          <div className="border-b border-[#E0E6ED] pb-3">
            <span className="text-xs font-bold text-[#1E83EC] uppercase tracking-wider">Sección 04</span>
            <h2 className="text-xl font-bold text-[#003E78]">Geometría Institucional: Estándar Rectangular</h2>
            <p className="text-xs text-slate-500 mt-1">
              Las formas rectangulares con esquinas ligeramente suavizadas proyectan la solidez del cemento y la ingeniería civil.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Standard Permitido */}
            <div className="bg-emerald-50/50 rounded-xl border-2 border-emerald-500 p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm">Estándar Autorizado Ultracem (Rectangular)</h3>
              </div>

              <p className="text-xs text-slate-600">
                Uso exclusivo de radios compactos de <strong>5px</strong> y <strong>4px</strong> para botones, pills y tags:
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1.5 rounded-[5px] bg-[#003E78] text-white text-xs font-bold shadow-xs">
                  rounded-[5px] (Botón Primario)
                </span>
                <span className="px-3 py-1.5 rounded-[5px] bg-[#1E83EC] text-white text-xs font-bold shadow-xs">
                  rounded-[5px] (+ Registrar Venta)
                </span>
                <span className="px-2.5 py-0.5 rounded-[4px] bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                  rounded-[4px] (Micro-badge)
                </span>
              </div>
            </div>

            {/* No Permitido */}
            <div className="bg-red-50/40 rounded-xl border-2 border-red-300 p-6 space-y-4">
              <div className="flex items-center gap-2 text-red-800">
                <XCircle className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-sm">No Permitido en la Plataforma</h3>
              </div>

              <p className="text-xs text-slate-600">
                Se prohíbe el uso de píldoras ovales completas (`rounded-full`) o radios discordantes que resten seriedad B2B:
              </p>

              <div className="flex flex-wrap gap-2 pt-2 opacity-60">
                <span className="px-4 py-1.5 rounded-full bg-slate-300 text-slate-600 text-xs font-semibold line-through">
                  rounded-full (Óvalo prohibido)
                </span>
                <span className="px-3 py-1.5 rounded-2xl bg-slate-300 text-slate-600 text-xs font-semibold line-through">
                  rounded-2xl (Curvatura excesiva)
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: ICONOGRAFÍA MINIMALISTA (CERO EMOJIS) */}
        <section id="iconos" className="space-y-5 scroll-mt-20">
          <div className="border-b border-[#E0E6ED] pb-3">
            <span className="text-xs font-bold text-[#1E83EC] uppercase tracking-wider">Sección 05</span>
            <h2 className="text-xl font-bold text-[#003E78]">Iconografía Vectorial &amp; Regla Cero Emojis</h2>
            <p className="text-xs text-slate-500 mt-1">
              Todos los iconos deben provenir de la librería técnica `lucide-react`. Queda terminantemente prohibido el uso de emojis informales.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 bg-white rounded-lg border border-[#E0E6ED] flex items-center gap-3">
              <Trophy className="w-5 h-5 text-[#FFCA00] shrink-0" />
              <div>
                <p className="font-bold text-[#003E78]">Trophy</p>
                <p className="text-[10px] text-slate-400">Puntos &amp; Ranking</p>
              </div>
            </div>
            <div className="p-3.5 bg-white rounded-lg border border-[#E0E6ED] flex items-center gap-3">
              <Package className="w-5 h-5 text-[#003E78] shrink-0" />
              <div>
                <p className="font-bold text-[#003E78]">Package</p>
                <p className="text-[10px] text-slate-400">Cemento &amp; Cargas</p>
              </div>
            </div>
            <div className="p-3.5 bg-white rounded-lg border border-[#E0E6ED] flex items-center gap-3">
              <Truck className="w-5 h-5 text-[#1E83EC] shrink-0" />
              <div>
                <p className="font-bold text-[#003E78]">Truck</p>
                <p className="text-[10px] text-slate-400">Concreto &amp; Despacho</p>
              </div>
            </div>
            <div className="p-3.5 bg-white rounded-lg border border-[#E0E6ED] flex items-center gap-3">
              <Clock className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-[#003E78]">Clock</p>
                <p className="text-[10px] text-slate-400">SLA 48 Horas</p>
              </div>
            </div>
            <div className="p-3.5 bg-white rounded-lg border border-[#E0E6ED] flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#38A169] shrink-0" />
              <div>
                <p className="font-bold text-[#003E78]">CheckCircle2</p>
                <p className="text-[10px] text-slate-400">Venta Aprobada</p>
              </div>
            </div>
            <div className="p-3.5 bg-white rounded-lg border border-[#E0E6ED] flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-[#E53E3E] shrink-0" />
              <div>
                <p className="font-bold text-[#003E78]">AlertTriangle</p>
                <p className="text-[10px] text-slate-400">Riesgo &amp; Rechazo</p>
              </div>
            </div>
            <div className="p-3.5 bg-white rounded-lg border border-[#E0E6ED] flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#FFCA00] shrink-0" />
              <div>
                <p className="font-bold text-[#003E78]">Sparkles</p>
                <p className="text-[10px] text-slate-400">Nivel de Asesor</p>
              </div>
            </div>
            <div className="p-3.5 bg-white rounded-lg border border-[#E0E6ED] flex items-center gap-3">
              <KeyRound className="w-5 h-5 text-[#1E83EC] shrink-0" />
              <div>
                <p className="font-bold text-[#003E78]">KeyRound</p>
                <p className="text-[10px] text-slate-400">Credencial Oficial</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: COMPONENTES EN VIVO (LIVE SHOWCASE) */}
        <section id="componentes" className="space-y-6 scroll-mt-20">
          <div className="border-b border-[#E0E6ED] pb-3">
            <span className="text-xs font-bold text-[#1E83EC] uppercase tracking-wider">Sección 06</span>
            <h2 className="text-xl font-bold text-[#003E78]">Librería de Componentes en Vivo</h2>
            <p className="text-xs text-slate-500 mt-1">
              Componentes interactivos renderizados directamente con los estilos de producción del CRM.
            </p>
          </div>

          {/* Interactive Buttons */}
          <div className="card-ultracem p-6 space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              Botones de Acción (Radio 5px)
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <button className="px-4 py-2 rounded-[5px] bg-[#003E78] hover:bg-[#002B54] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer">
                Primario Institucional
              </button>
              <button className="px-5 py-2.5 rounded-[5px] bg-[#1E83EC] hover:bg-blue-600 active:scale-95 text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer">
                <PlusCircle className="w-4 h-4 text-white" />
                <span>+ Registrar Venta (Interactivo)</span>
              </button>
              <button className="px-4 py-2 rounded-[5px] bg-white border border-[#003E78] text-[#003E78] hover:bg-slate-50 text-xs font-bold shadow-xs transition-colors cursor-pointer">
                Secundario / Contorno
              </button>
              <button className="px-4 py-2 rounded-[5px] bg-[#FFCA00] hover:bg-amber-400 text-[#003E78] text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-[#003E78]" />
                <span>Botón de Recompensa</span>
              </button>
              <button className="px-4 py-2 rounded-[5px] bg-red-50 text-[#E53E3E] hover:bg-red-100 border border-red-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-[#E53E3E]" />
                <span>Rechazar Remisión</span>
              </button>
            </div>
          </div>

          {/* Interactive Recency Filter Chips */}
          <div className="card-ultracem p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Chips de Filtrado de Recencia (Interactivos)
              </h3>
              <span className="text-[11px] text-slate-400">Haz clic para probar el estado activo</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveChipDemo('todos')}
                className={`px-3 py-1.5 text-xs font-bold rounded-[5px] transition-all cursor-pointer ${
                  activeChipDemo === 'todos'
                    ? 'bg-[#003E78] text-white shadow-xs'
                    : 'bg-white border border-[#E0E6ED] text-[#4A5568] hover:bg-slate-50'
                }`}
              >
                Todos (6)
              </button>
              <button
                onClick={() => setActiveChipDemo('activos')}
                className={`px-3 py-1.5 text-xs font-bold rounded-[5px] transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeChipDemo === 'activos'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white border border-[#E0E6ED] text-[#4A5568] hover:bg-slate-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${activeChipDemo === 'activos' ? 'bg-white' : 'bg-emerald-500'}`} />
                <span>Activos (&lt;15d)</span>
              </button>
              <button
                onClick={() => setActiveChipDemo('alerta')}
                className={`px-3 py-1.5 text-xs font-bold rounded-[5px] transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeChipDemo === 'alerta'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white border border-[#E0E6ED] text-[#4A5568] hover:bg-slate-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${activeChipDemo === 'alerta' ? 'bg-white' : 'bg-amber-500'}`} />
                <span>Alerta (16-30d)</span>
              </button>
              <button
                onClick={() => setActiveChipDemo('critico')}
                className={`px-3 py-1.5 text-xs font-bold rounded-[5px] transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeChipDemo === 'critico'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-white border border-[#E0E6ED] text-[#4A5568] hover:bg-slate-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${activeChipDemo === 'critico' ? 'bg-white' : 'bg-red-500'}`} />
                <span>En Riesgo (&gt;30d)</span>
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 7: CATÁLOGO OFICIAL DE PANTALLAS & MOCKUPS                        */}
        {/* ========================================================================= */}
        <section id="pantallas" className="space-y-6 scroll-mt-20">
          <div className="border-b border-[#E0E6ED] pb-3 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#1E83EC] uppercase tracking-wider">Sección 07</span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#003E78] flex items-center gap-2">
                <Monitor className="w-6 h-6 text-[#1E83EC]" />
                <span>Catálogo Oficial de Pantallas &amp; Mockups de Dispositivo</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Capturas directas en alta resolución montadas en marcos fotorrealistas de navegador y móvil.
              </p>
            </div>

            {/* Category Filter for Screens */}
            <div className="flex bg-white border border-[#E0E6ED] p-1 rounded-[6px] text-xs font-semibold shrink-0">
              <button
                onClick={() => setActiveScreenCategory('todos')}
                className={`px-3 py-1.5 rounded-[4px] transition-all cursor-pointer ${
                  activeScreenCategory === 'todos'
                    ? 'bg-[#003E78] text-white shadow-xs font-bold'
                    : 'text-[#4A5568] hover:text-[#003E78]'
                }`}
              >
                Todas ({officialScreens.length})
              </button>
              <button
                onClick={() => setActiveScreenCategory('asesor')}
                className={`px-3 py-1.5 rounded-[4px] transition-all cursor-pointer ${
                  activeScreenCategory === 'asesor'
                    ? 'bg-[#003E78] text-white shadow-xs font-bold'
                    : 'text-[#4A5568] hover:text-[#003E78]'
                }`}
              >
                Fuerza Comercial (Asesor)
              </button>
              <button
                onClick={() => setActiveScreenCategory('gerente')}
                className={`px-3 py-1.5 rounded-[4px] transition-all cursor-pointer ${
                  activeScreenCategory === 'gerente'
                    ? 'bg-[#003E78] text-white shadow-xs font-bold'
                    : 'text-[#4A5568] hover:text-[#003E78]'
                }`}
              >
                Dirección Comercial (Gerente)
              </button>
              <button
                onClick={() => setActiveScreenCategory('acceso')}
                className={`px-3 py-1.5 rounded-[4px] transition-all cursor-pointer ${
                  activeScreenCategory === 'acceso'
                    ? 'bg-[#003E78] text-white shadow-xs font-bold'
                    : 'text-[#4A5568] hover:text-[#003E78]'
                }`}
              >
                Acceso &amp; PWA Móvil
              </button>
            </div>
          </div>

          {/* Grid of Screen Mockup Cards */}
          <div className="grid grid-cols-1 gap-10">
            {filteredScreens.map((screen) => {
              const isMobile = screen.deviceType === 'mobile';
              return (
                <div
                  key={screen.id}
                  className="bg-white rounded-2xl border border-[#E0E6ED] shadow-sm overflow-hidden flex flex-col xl:flex-row gap-6 p-5 sm:p-6"
                >
                  {/* Left / Top: Device Mockup Frame */}
                  <div className={`shrink-0 ${isMobile ? 'xl:w-[340px] flex justify-center' : 'xl:w-[62%]'}`}>
                    {isMobile ? (
                      /* Realistic Smartphone Frame */
                      <div className="w-[300px] sm:w-[320px] bg-slate-900 rounded-[44px] p-3 shadow-2xl border-4 border-slate-700 relative">
                        {/* Dynamic Island / Speaker */}
                        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-20 flex items-center justify-end pr-2">
                          <div className="w-2 h-2 rounded-full bg-blue-900/60" />
                        </div>
                        {/* Screen Content Container */}
                        <div
                          onClick={() => setZoomImage(screen)}
                          className="bg-slate-100 rounded-[34px] overflow-hidden cursor-zoom-in relative group aspect-[9/19.5]"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={screen.imageSrc}
                            alt={screen.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="px-3 py-1.5 rounded-[5px] bg-[#003E78] text-white text-xs font-bold flex items-center gap-1.5 shadow-lg">
                              <Maximize2 className="w-3.5 h-3.5" /> Ampliar Captura
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Realistic Desktop Browser Frame */
                      <div className="bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
                        {/* Browser Chrome Header */}
                        <div className="bg-slate-800 px-4 py-2.5 flex items-center justify-between border-b border-slate-700">
                          {/* Traffic Light Dots */}
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-red-600/40" />
                            <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-amber-600/40" />
                            <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-emerald-600/40" />
                          </div>

                          {/* URL Bar */}
                          <div className="flex-1 max-w-sm mx-4 bg-slate-900/80 rounded-[4px] px-3 py-1 text-[11px] font-mono text-slate-300 truncate text-center border border-slate-700/60">
                            {screen.urlSimulated}
                          </div>

                          <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">1440 × 900</span>
                        </div>

                        {/* Screenshot Inside Window */}
                        <div
                          onClick={() => setZoomImage(screen)}
                          className="bg-slate-100 overflow-hidden cursor-zoom-in relative group"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={screen.imageSrc}
                            alt={screen.title}
                            className="w-full object-contain group-hover:scale-[1.02] transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="px-3.5 py-2 rounded-[5px] bg-[#003E78] text-white text-xs font-bold flex items-center gap-2 shadow-lg">
                              <Maximize2 className="w-4 h-4" /> Ver Captura en Resolución Completa
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right / Bottom: Technical Breakdown & Business Rules */}
                  <div className="flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-[4px] tracking-wider ${
                            screen.role === 'gerente'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : screen.role === 'asesor'
                              ? 'bg-blue-50 text-[#003E78] border border-blue-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {screen.roleLabel}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          ID: {screen.id}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-[#003E78] leading-snug">
                        {screen.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {screen.description}
                      </p>

                      {/* Business Rules Box */}
                      <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                        <span className="font-bold text-[#003E78] text-[11px] uppercase tracking-wider block">
                          Reglas de Negocio Implementadas:
                        </span>
                        <ul className="space-y-1">
                          {screen.businessRules.map((rule, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 text-slate-700 text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#38A169] shrink-0 mt-0.5" />
                              <span>{rule}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Tokens Strip & CTA */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase mr-1">Tokens:</span>
                        {screen.tokens.map((token) => (
                          <span
                            key={token}
                            className="px-2 py-0.5 rounded-[4px] bg-slate-100 text-slate-700 text-[10px] font-mono font-bold border border-slate-200"
                          >
                            {token}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => setZoomImage(screen)}
                        className="text-xs font-bold text-[#1E83EC] hover:text-[#003E78] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Ver en Zoom</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 8: ENLACES & ACCIONES DE RETORNO */}
        <section className="p-8 bg-gradient-to-r from-[#003E78] to-[#1E83EC] rounded-2xl text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold">¿Listo para probar la aplicación en vivo?</h3>
            <p className="text-xs text-blue-100">
              Regresa a la plataforma operativa del CRM Gamificado Ultracem para interactuar con los dos roles.
            </p>
          </div>

          <Link
            href="/"
            className="px-6 py-3 rounded-[5px] bg-[#FFCA00] hover:bg-amber-400 text-[#003E78] font-bold text-xs shadow-md transition-all cursor-pointer shrink-0"
          >
            Abrir CRM Ultracem
          </Link>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* 4. LIGHTBOX MODAL FOR FULL SCREEN VIEW                                    */}
      {/* ========================================================================= */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setZoomImage(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-300 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#003E78] px-5 py-3 text-white flex items-center justify-between shrink-0">
              <div>
                <h4 className="font-bold text-sm text-white">{zoomImage.title}</h4>
                <p className="text-xs text-blue-200">{zoomImage.roleLabel} · {zoomImage.urlSimulated}</p>
              </div>
              <button
                onClick={() => setZoomImage(null)}
                className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Cerrar vista ampliada"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image Body */}
            <div className="p-4 overflow-y-auto bg-slate-100 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={zoomImage.imageSrc}
                alt={zoomImage.title}
                className="max-h-[75vh] w-auto object-contain rounded-lg shadow-md border border-slate-300"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. FOOTER CORPORATIVO                                                     */}
      {/* ========================================================================= */}
      <footer className="bg-white border-t border-[#E0E6ED] py-6 px-4 text-center text-xs text-slate-400">
        <p>© 2026 Ultracem S.A.S. — Sistema de Diseño Corporativo B2B. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
