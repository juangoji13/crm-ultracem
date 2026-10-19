'use client';

import React, { useState, useRef } from 'react';
import {
  User,
  Client,
  Goal,
  Sale,
  ProductType,
} from '@/lib/types';
import { ProgressBar } from '../ProgressBar';
import { RecencyBadge } from '../RecencyBadge';
import { ClientDetailModal } from '../ClientDetailModal';
import { CorrectionModal } from '../CorrectionModal';
import {
  PlusCircle,
  Building2,
  Receipt,
  Search,
  Upload,
  CheckCircle2,
  X,
  Phone,
  MessageCircle,
  Clock,
  Sparkles,
  RefreshCw,
  Eye,
  FileText,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Zap,
  Trophy,
  Gift,
  MapPin,
  Package,
  Truck,
  AlertTriangle,
} from 'lucide-react';
import {
  uploadReceiptFile,
  formatFileSize,
  validateReceiptFile,
  readFileAsDataURL,
} from '@/lib/storage';
import { saveSaleOffline } from '@/lib/offlineDb';
import { isClientCritical, calculateSalePoints } from '@/lib/gamification';

interface AdvisorDashboardProps {
  user: User;
  clients: Client[];
  goals: Goal[];
  sales: Sale[];
  onRegisterSale: (newSale: Omit<Sale, 'id' | 'submitted_at'>) => void;
  onResubmitSale?: (updatedSale: {
    saleId: string;
    product_type: ProductType;
    volume: number;
    volume_unit: 'Ton' | 'm3';
    document_number: string;
    receipt_url: string;
  }) => void;
  onOpenLeaderboard?: () => void;
  onOpenRewards?: () => void;
}

export const AdvisorDashboard: React.FC<AdvisorDashboardProps> = ({
  user,
  clients,
  goals,
  sales,
  onRegisterSale,
  onResubmitSale,
  onOpenLeaderboard,
  onOpenRewards,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRecency, setFilterRecency] = useState<'all' | 'optimo' | 'alerta' | 'critico'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modals state for Client Detail & Correction
  const [selectedClientForDetail, setSelectedClientForDetail] = useState<Client | null>(null);
  const [saleToCorrect, setSaleToCorrect] = useState<Sale | null>(null);

  // Form State for new Sale
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [selectedProduct, setSelectedProduct] = useState<ProductType>('Cemento');
  const [volume, setVolume] = useState('50');
  const [volumeUnit, setVolumeUnit] = useState<'Ton' | 'm3'>('Ton');
  const [documentNumber, setDocumentNumber] = useState('');
  const [receiptUploaded, setReceiptUploaded] = useState(false);
  const [isSuccessModal, setIsSuccessModal] = useState(false);
  const [isOfflineSubmission, setIsOfflineSubmission] = useState(false);
  const [lastAwardedPoints, setLastAwardedPoints] = useState<number>(125);
  const [wasLastCriticalBonus, setWasLastCriticalBonus] = useState<boolean>(false);

  // File Upload & Preview State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const activeGoal = goals.find((g) => g.status === 'activa') || goals[0];

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nit.includes(searchTerm);
    const matchesFilter = filterRecency === 'all' || c.recency_status === filterRecency;
    return matchesSearch && matchesFilter;
  });

  const handleFileChange = async (file: File | undefined) => {
    if (!file) return;

    const validation = validateReceiptFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Archivo inválido');
      return;
    }

    setUploadError(null);
    setSelectedFile(file);
    setReceiptUploaded(true);

    if (file.type.startsWith('image/')) {
      try {
        const dataUrl = await readFileAsDataURL(file);
        setFilePreviewUrl(dataUrl);
      } catch {
        setFilePreviewUrl(URL.createObjectURL(file));
      }
    } else {
      setFilePreviewUrl(null);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setFilePreviewUrl(null);
    setReceiptUploaded(false);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmitSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentNumber || (!selectedFile && !receiptUploaded)) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      let finalReceiptUrl = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600';

      if (selectedFile) {
        const { url, error } = await uploadReceiptFile(selectedFile);
        if (error && !url) {
          setUploadError('Error al subir el comprobante. Por favor intenta de nuevo.');
          setIsUploading(false);
          return;
        }
        if (url) {
          finalReceiptUrl = url;
        }
      }

      const client = clients.find((c) => c.id === selectedClientId);
      const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

      // Cálculo de Puntos Ultra con Multiplicador 2X para Clientes Críticos (HU-GAM-03)
      const pointsCalculation = calculateSalePoints(client);
      setLastAwardedPoints(pointsCalculation.points);
      setWasLastCriticalBonus(pointsCalculation.isCritical);

      const newSalePayload = {
        client_id: selectedClientId,
        client_name: client?.business_name || 'Cliente Ultracem',
        advisor_id: user.id,
        advisor_name: user.name,
        product_type: selectedProduct,
        volume: parseFloat(volume) || 1,
        volume_unit: volumeUnit,
        total_value_cop: (parseFloat(volume) || 1) * 250000,
        document_number: documentNumber,
        receipt_url: finalReceiptUrl,
        status: 'pendiente' as const,
        ultra_points_awarded: pointsCalculation.points,
      };

      if (isOffline) {
        await saveSaleOffline(newSalePayload);
        setIsOfflineSubmission(true);
      } else {
        setIsOfflineSubmission(false);
      }

      await onRegisterSale(newSalePayload);

      setIsModalOpen(false);
      setIsSuccessModal(true);
      setDocumentNumber('');
      setSelectedFile(null);
      setFilePreviewUrl(null);
      setReceiptUploaded(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('[AdvisorDashboard] Error submitting sale:', err);
      setUploadError(err.message || 'Error al procesar el registro de venta.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* 1. Greeting Card */}
      <div className="card-ultracem p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#003E78]">Buenos días, {user.name}</h1>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-[4px] bg-blue-50 text-[#1E83EC] border border-blue-200">
              {user.zone}
            </span>
          </div>
          <p className="text-xs text-[#4A5568] mt-0.5">
            Asesor Comercial · Cartera activa de {clients.length} cuentas clave
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-amber-100/60 border border-amber-300/80 px-3.5 py-1.5 rounded-[5px] shadow-2xs">
            <Sparkles className="w-4 h-4 text-[#FFCA00]" />
            <span className="text-xs font-bold text-[#B7791F]">Fuerza Comercial Nivel Oro</span>
          </div>
        </div>
      </div>

      {/* 2. Goal Progress Card (PRD Dynamic Progress Bar) */}
      {activeGoal && (
        <div className="card-ultracem p-5 bg-gradient-to-br from-white to-blue-50/20">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1E83EC]">
              Meta del Mes
            </span>
            <span className="text-xs text-slate-400 font-medium">Cierre en 12 días</span>
          </div>
          <ProgressBar
            current={activeGoal.current_volume}
            target={activeGoal.target_volume}
            unit={activeGoal.volume_unit}
            label={activeGoal.title}
            subtitle={`¡A solo ${activeGoal.target_volume - activeGoal.current_volume} ${activeGoal.volume_unit} de tu bonificación!`}
          />
        </div>
      )}

      {/* 3. Quick Action CTA (Large prominent button) */}
      <div className="flex justify-center pt-1">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto px-8 py-3.5 bg-[#1E83EC] hover:bg-blue-600 active:scale-[0.98] text-white font-bold rounded-[5px] shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 text-sm transition-all cursor-pointer"
        >
          <PlusCircle className="w-5 h-5 text-white" />
          <span>Registrar Venta de Cemento / Concreto</span>
        </button>
      </div>

      {/* 4. Clients Section with Recency Traffic Light Badges */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#003E78]">Mis Clientes & Recencia</h2>
            <p className="text-xs text-slate-500">
              Identifica cuentas con riesgo de fuga mediante el semáforo de compra
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterRecency('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-[5px] transition-all cursor-pointer ${
                filterRecency === 'all'
                  ? 'bg-[#003E78] text-white shadow-xs'
                  : 'bg-white border border-[#E0E6ED] text-[#4A5568] hover:bg-slate-50'
              }`}
            >
              Todos ({clients.length})
            </button>
            <button
              onClick={() => setFilterRecency('optimo')}
              className={`px-3 py-1.5 text-xs font-bold rounded-[5px] transition-all flex items-center gap-1.5 cursor-pointer ${
                filterRecency === 'optimo'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white border border-[#E0E6ED] text-[#4A5568] hover:bg-slate-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${filterRecency === 'optimo' ? 'bg-white' : 'bg-emerald-500'}`} />
              <span>Activos (&lt;15d)</span>
            </button>
            <button
              onClick={() => setFilterRecency('alerta')}
              className={`px-3 py-1.5 text-xs font-bold rounded-[5px] transition-all flex items-center gap-1.5 cursor-pointer ${
                filterRecency === 'alerta'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white border border-[#E0E6ED] text-[#4A5568] hover:bg-slate-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${filterRecency === 'alerta' ? 'bg-white' : 'bg-amber-500'}`} />
              <span>Alerta (16-30d)</span>
            </button>
            <button
              onClick={() => setFilterRecency('critico')}
              className={`px-3 py-1.5 text-xs font-bold rounded-[5px] transition-all flex items-center gap-1.5 cursor-pointer ${
                filterRecency === 'critico'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white border border-[#E0E6ED] text-[#4A5568] hover:bg-slate-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${filterRecency === 'critico' ? 'bg-white' : 'bg-red-500'}`} />
              <span>En Riesgo (&gt;30d)</span>
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por ferretería, constructora o NIT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-ultracem w-full pl-10"
          />
        </div>

        {/* Client Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              onClick={() => setSelectedClientForDetail(client)}
              className={`card-ultracem p-4 relative transition-all hover:border-[#1E83EC] hover:shadow-md cursor-pointer group ${
                client.recency_status === 'critico' ? 'border-l-4 border-l-[#E53E3E]' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-[5px] bg-blue-50 text-[#003E78] group-hover:bg-[#003E78] group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-[#003E78] group-hover:text-[#1E83EC] transition-colors leading-tight">
                      {client.business_name}
                    </h3>
                    <p className="text-[11px] text-slate-500">NIT: {client.nit}</p>
                  </div>
                </div>
                <RecencyBadge status={client.recency_status} days={client.days_since_last_purchase} />
              </div>

              <div className="text-xs text-slate-600 space-y-1.5 my-3 bg-slate-50/70 p-2.5 rounded-[5px] border border-slate-100">
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#1E83EC] shrink-0" />
                  <span>{client.address}, {client.city}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-[#003E78] shrink-0" />
                  <span>Producto habitual: <strong className="text-[#003E78]">{client.usual_product}</strong></span>
                </p>
                {client.last_purchase_volume && (
                  <p className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Último pedido: <strong>{client.last_purchase_volume} Ton</strong></span>
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {client.contact_phone && (
                    <a
                      href={`tel:${client.contact_phone}`}
                      className="p-1.5 rounded-[5px] text-slate-600 hover:text-[#003E78] hover:bg-slate-100 transition-colors"
                      title="Llamar"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                  {client.contact_whatsapp && (
                    <a
                      href={`https://wa.me/${client.contact_whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-[5px] text-emerald-600 hover:bg-emerald-50 transition-colors"
                      title="WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedClientForDetail(client);
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-[#003E78] hover:underline"
                  >
                    Ver Ficha
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedClientId(client.id);
                      setSelectedProduct(client.usual_product);
                      setIsModalOpen(true);
                    }}
                    className="text-xs font-semibold text-[#1E83EC] hover:underline"
                  >
                    + Vender
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Recent Activity List */}
      <div className="card-ultracem p-5 space-y-3">
        <h2 className="text-sm font-bold text-[#003E78] flex items-center justify-between">
          <span>Actividad Reciente de Ventas</span>
          <span className="text-xs text-slate-400 font-normal">Últimos envíos</span>
        </h2>
        <div className="space-y-2.5">
          {sales.map((sale) => (
            <div
              key={sale.id}
              className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-3 ${
                sale.status === 'aprobada'
                  ? 'border-l-4 border-l-[#38A169] bg-white border-slate-200'
                  : sale.status === 'por_corregir'
                  ? 'border-l-4 border-l-[#E53E3E] bg-red-50/30 border-red-200'
                  : 'border-l-4 border-l-amber-400 bg-white border-slate-200'
              }`}
            >
              <div>
                <p className="font-bold text-slate-900">{sale.client_name}</p>
                <p className="text-slate-500">
                  {sale.volume} {sale.volume_unit} de {sale.product_type} · Remisión #{sale.document_number}
                </p>
                {sale.rejection_reason && (
                  <p className="text-red-700 font-medium mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#E53E3E] shrink-0" />
                    <span>{sale.rejection_reason}</span>
                  </p>
                )}
                {sale.receipt_url && (
                  <a
                    href={sale.receipt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-[#1E83EC] hover:underline mt-1 font-medium"
                    title="Ver comprobante de remisión"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Ver comprobante adjunto</span>
                  </a>
                )}
              </div>
              <div className="text-right shrink-0">
                <span
                  className={`inline-block px-2 py-0.5 rounded-[4px] text-[11px] font-bold ${
                    sale.status === 'aprobada'
                      ? 'bg-emerald-100 text-emerald-800'
                      : sale.status === 'por_corregir'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {sale.status === 'aprobada' ? '+125 pts' : sale.status === 'por_corregir' ? 'Por Corregir' : sale.status}
                </span>

                {sale.status === 'por_corregir' && (
                  <div className="mt-1.5">
                    <button
                      type="button"
                      onClick={() => setSaleToCorrect(sale)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#E53E3E] hover:bg-red-700 active:scale-95 text-white rounded-[5px] text-[10px] font-bold shadow-2xs transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Corregir Venta</span>
                    </button>
                  </div>
                )}

                <p className="text-[10px] text-slate-400 mt-1">
                  {new Date(sale.submitted_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: REGISTRAR VENTA (Matching Stitch Screen #4) */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col border border-[#E0E6ED]">
            {/* Modal Header */}
            <div className="bg-[#003E78] text-white px-5 py-3.5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm tracking-wide">Registrar Venta</h3>
                <p className="text-[11px] text-blue-200">Paso 1/2 · Soporte con remisión obligatoria</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-[5px] hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitSale} className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Cliente */}
              <div>
                <label className="font-bold text-[#003E78] block mb-1">CLIENTE DESTINO</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="input-ultracem w-full font-medium"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.business_name} (NIT: {c.nit}) {isClientCritical(c) ? '· [CRÍTICO >30d]' : ''}
                    </option>
                  ))}
                </select>

                {/* Badge Reactivación 2X (HU-GAM-03) */}
                {isClientCritical(clients.find((c) => c.id === selectedClientId)) && (
                  <div className="mt-2 p-2.5 rounded-[5px] bg-amber-500/10 border border-[#FFCA00] flex items-center justify-between gap-2 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-[5px] bg-[#FFCA00] text-[#003E78] flex items-center justify-center shrink-0">
                        <Zap className="w-3.5 h-3.5 fill-current" />
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-1 px-2 py-0.2 rounded-[5px] bg-[#003E78] text-[#FFCA00] text-[10px] font-extrabold uppercase">
                          <Sparkles className="w-3 h-3 text-[#FFCA00]" />
                          <span>Bono Reactivación 2X (+250 Pts)</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Cliente en estado crítico (&gt;30 días sin comprar). ¡Esta venta otorga el doble de Puntos Ultra!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Producto Selector Chips */}
              <div>
                <label className="font-bold text-[#003E78] block mb-1.5">TIPO DE PRODUCTO</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Cemento', 'Concreto', 'Pegantes', 'Morteros'] as ProductType[]).map((prod) => (
                    <button
                      key={prod}
                      type="button"
                      onClick={() => setSelectedProduct(prod)}
                      className={`p-2.5 rounded-[5px] border font-semibold flex items-center justify-center gap-2 transition-all ${
                        selectedProduct === prod
                          ? 'bg-[#003E78] text-white border-[#003E78] shadow-xs'
                          : 'bg-white border-[#E0E6ED] text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <Building2 className={`w-3.5 h-3.5 ${selectedProduct === prod ? 'text-[#FFCA00]' : 'text-[#1E83EC]'}`} />
                      <span>{prod}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Volumen y Unidad */}
              <div>
                <label className="font-bold text-[#003E78] block mb-1">VOLUMEN REGISTRADO</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    className="input-ultracem flex-1 font-bold text-base"
                    required
                  />
                  <div className="flex rounded-[5px] border border-[#E0E6ED] overflow-hidden bg-slate-100">
                    <button
                      type="button"
                      onClick={() => setVolumeUnit('Ton')}
                      className={`px-3 py-2 text-xs font-bold cursor-pointer ${
                        volumeUnit === 'Ton' ? 'bg-[#003E78] text-white' : 'text-slate-600'
                      }`}
                    >
                      Toneladas
                    </button>
                    <button
                      type="button"
                      onClick={() => setVolumeUnit('m3')}
                      className={`px-3 py-2 text-xs font-bold cursor-pointer ${
                        volumeUnit === 'm3' ? 'bg-[#003E78] text-white' : 'text-slate-600'
                      }`}
                    >
                      m³
                    </button>
                  </div>
                </div>
              </div>

              {/* Número de Remisión */}
              <div>
                <label className="font-bold text-[#003E78] block mb-1">
                  NÚMERO DE REMISIÓN / FACTURA (ÚNICO)
                </label>
                <input
                  type="text"
                  placeholder="Ej: REM-2024-89421"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  className="input-ultracem w-full uppercase"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Validación anti-duplicados activa para auditoría fiscal.
                </p>
              </div>

              {/* Dropzone Comprobante Obligatorio */}
              <div>
                <label className="font-bold text-[#003E78] block mb-1">
                  COMPROBANTE DE VENTA O REMISIÓN FÍSICA (OBLIGATORIO)
                </label>

                {/* Real hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={handleFileInputChange}
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    isDragOver
                      ? 'border-[#003E78] bg-blue-100/60 scale-[1.01]'
                      : selectedFile || receiptUploaded
                      ? 'border-[#38A169] bg-emerald-50/50 text-emerald-800'
                      : 'border-[#1E83EC] bg-blue-50/40 text-slate-600 hover:bg-blue-50/70'
                  }`}
                >
                  {selectedFile ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-white/90 p-2.5 rounded-[5px] border border-emerald-200 text-left">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          {selectedFile.type.startsWith('image/') ? (
                            filePreviewUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={filePreviewUrl}
                                alt="Vista previa comprobante"
                                className="w-12 h-12 rounded-[4px] object-cover border border-slate-200 shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-[4px] bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
                                <ImageIcon className="w-6 h-6" />
                              </div>
                            )
                          ) : (
                            <div className="w-12 h-12 rounded-[4px] bg-red-100 flex items-center justify-center shrink-0 text-red-600">
                              <FileText className="w-6 h-6" />
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <p className="font-bold text-xs text-slate-800 truncate" title={selectedFile.name}>
                              {selectedFile.name}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {formatFileSize(selectedFile.size)} · {selectedFile.type.includes('pdf') ? 'Documento PDF' : 'Imagen'}
                            </p>
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded-[4px]">
                              <CheckCircle2 className="w-3 h-3 text-[#38A169]" /> Listo para subir
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="p-1 rounded-[5px] text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors ml-2 shrink-0 cursor-pointer"
                          title="Eliminar y seleccionar otro archivo"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-400">
                        Haz clic o arrastra otro archivo para reemplazar
                      </p>
                    </div>
                  ) : receiptUploaded ? (
                    <div className="font-semibold text-xs flex items-center justify-center gap-1.5 text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-[#38A169]" />
                      <span>Comprobante listo para validar</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 mx-auto mb-1.5 text-[#1E83EC]" />
                      <p className="font-bold text-[#003E78] text-xs">
                        Toca aquí para subir o tomar foto
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        JPG, PNG o PDF. Máximo 10MB
                      </p>
                    </>
                  )}
                </div>

                {uploadError && (
                  <div className="flex items-center gap-1.5 text-red-600 text-[11px] mt-1.5 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>

              {/* Previsualización Puntos Ultra */}
              {(() => {
                const selectedClientObj = clients.find((c) => c.id === selectedClientId);
                const isCriticalClient = isClientCritical(selectedClientObj);
                return (
                  <div className="bg-amber-50/80 border-l-4 border-l-[#FFCA00] p-3 rounded-[5px] flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#003E78] text-xs">Puntos Ultra Estimados</p>
                      <p className="text-[11px] text-slate-500">
                        {isCriticalClient
                          ? '¡Multiplicador 2X por reactivación de cliente crítico!'
                          : 'Se acreditan tras validación del supervisor'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-[#B7791F]">
                        +{isCriticalClient ? '250' : '125'} pts
                      </span>
                      {isCriticalClient && (
                        <span className="block text-[9px] font-bold text-[#003E78] uppercase">
                          Bono 2X Activo
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Submit Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={!documentNumber || (!selectedFile && !receiptUploaded) || isUploading}
                  className={`w-full py-3 rounded-[5px] font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 ${
                    documentNumber && (selectedFile || receiptUploaded) && !isUploading
                      ? 'bg-[#003E78] hover:bg-[#002B54] text-white active:scale-[0.99] cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#FFCA00]" />
                      <span>Subiendo comprobante a Storage...</span>
                    </>
                  ) : (
                    <span>Enviar a Validación</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full text-center text-xs text-slate-500 hover:underline py-1"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL (ONLINE & OFFLINE ADAPTIVE) */}
      {isSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl p-6 text-center max-w-sm shadow-xl space-y-4 animate-in zoom-in-95 duration-150 border border-[#E0E6ED]">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto shadow-sm ${
                isOfflineSubmission
                  ? 'bg-amber-100 text-[#B7791F]'
                  : 'bg-emerald-100 text-[#38A169]'
              }`}
            >
              {isOfflineSubmission ? (
                <Sparkles className="w-7 h-7 text-[#FFCA00]" />
              ) : (
                <CheckCircle2 className="w-7 h-7" />
              )}
            </div>

            <div className="space-y-1.5">
              <span
                className={`inline-block px-3 py-0.5 rounded-[5px] text-[11px] font-bold uppercase tracking-wider ${
                  isOfflineSubmission
                    ? 'bg-amber-50 text-amber-900 border border-amber-300'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {isOfflineSubmission
                  ? 'Guardado en Dispositivo (Modo Offline)'
                  : 'Enviada a Supervisión'}
              </span>

              <h3 className="text-base font-bold text-[#003E78]">
                {isOfflineSubmission
                  ? '¡Venta Guardada en Dispositivo!'
                  : '¡Venta Registrada Exitosamente!'}
              </h3>

              {/* Banner de Bono 2X en Modal de Éxito */}
              {wasLastCriticalBonus && (
                <div className="p-2.5 rounded-[5px] bg-amber-500/10 border border-[#FFCA00] text-center space-y-1 my-2">
                  <div className="inline-flex items-center gap-1.5 text-[#003E78] font-black text-xs uppercase tracking-wider">
                    <Zap className="w-3.5 h-3.5 text-[#003E78] fill-current" />
                    <span>¡Bono Reactivación 2X Aplicado!</span>
                  </div>
                  <p className="text-[11px] text-slate-700">
                    Se acreditarán <strong>+250 Puntos Ultra</strong> tras la aprobación de la supervisora por recuperar cartera inactiva.
                  </p>
                </div>
              )}

              <p className="text-xs text-slate-600 leading-relaxed">
                {isOfflineSubmission
                  ? 'Tu remisión se almacenó de forma segura en la base de datos local (IndexedDB) de tu dispositivo. En cuanto recuperes conexión, se sincronizará automáticamente con Oracle Supabase.'
                  : 'La remisión ha sido enviada a la bandeja de tu supervisora (María López). Plazo de revisión de SLA: 48 horas.'}
              </p>
            </div>

            <button
              onClick={() => setIsSuccessModal(false)}
              className="btn-ultracem-primary w-full py-2.5 text-xs font-bold rounded-[5px]"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* FICHA TÉCNICA DE CLIENTE (MODAL) */}
      <ClientDetailModal
        isOpen={!!selectedClientForDetail}
        onClose={() => setSelectedClientForDetail(null)}
        client={selectedClientForDetail}
        salesHistory={sales}
        onRegisterSale={(client) => {
          setSelectedClientId(client.id);
          setSelectedProduct(client.usual_product);
          setIsModalOpen(true);
        }}
      />

      {/* FLUJO DE CORRECCIÓN DE VENTA RECHAZADA (MODAL) */}
      <CorrectionModal
        isOpen={!!saleToCorrect}
        onClose={() => setSaleToCorrect(null)}
        sale={saleToCorrect}
        clients={clients}
        onResubmitSale={(updatedData) => {
          if (onResubmitSale) {
            onResubmitSale(updatedData);
          }
          setSaleToCorrect(null);
        }}
      />
    </div>
  );
};
