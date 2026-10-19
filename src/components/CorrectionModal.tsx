'use client';

import React, { useState } from 'react';
import { Sale, ProductType, Client } from '@/lib/types';
import {
  X,
  AlertTriangle,
  Upload,
  FileText,
  CheckCircle2,
  Building2,
  Eye,
  RefreshCw,
  Image as ImageIcon,
  Check,
  Lightbulb,
} from 'lucide-react';
import { uploadReceiptFile } from '@/lib/storage';

export interface CorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
  clients?: Client[];
  onResubmitSale: (updatedSale: {
    saleId: string;
    product_type: ProductType;
    volume: number;
    volume_unit: 'Ton' | 'm3';
    document_number: string;
    receipt_url: string;
  }) => void;
}

interface CorrectionModalDialogProps {
  sale: Sale;
  onClose: () => void;
  clients: Client[];
  onResubmitSale: (updatedSale: {
    saleId: string;
    product_type: ProductType;
    volume: number;
    volume_unit: 'Ton' | 'm3';
    document_number: string;
    receipt_url: string;
  }) => void;
}

const CorrectionModalDialog: React.FC<CorrectionModalDialogProps> = ({
  sale,
  onClose,
  clients,
  onResubmitSale,
}) => {
  // Pre-load all existing sale data without needing useEffect
  const [productType, setProductType] = useState<ProductType>(sale.product_type);
  const [volume, setVolume] = useState<string>(sale.volume.toString());
  const [volumeUnit, setVolumeUnit] = useState<'Ton' | 'm3'>(sale.volume_unit);
  const [documentNumber, setDocumentNumber] = useState<string>(sale.document_number);
  const [receiptUrl, setReceiptUrl] = useState<string>(sale.receipt_url);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newReceiptUploaded, setNewReceiptUploaded] = useState<boolean>(false);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const clientInfo = clients.find((c) => c.id === sale.client_id);
  const clientDisplayName = sale.client_name || clientInfo?.business_name || 'Cliente Ultracem';

  // Demo sharp receipt replacement image (with clear scale seal)
  const NEW_RECEIPT_SAMPLE =
    'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=900&auto=format&fit=crop&q=80';

  const handleSimulateNewUpload = () => {
    setSelectedFile(null);
    setReceiptUrl(NEW_RECEIPT_SAMPLE);
    setNewReceiptUploaded(true);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create local object URL for preview
      const previewUrl = URL.createObjectURL(file);
      setReceiptUrl(previewUrl);
      setNewReceiptUploaded(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedVolume = parseFloat(volume);
    if (!documentNumber.trim() || isNaN(parsedVolume) || parsedVolume <= 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      let finalReceiptUrl = receiptUrl;
      if (selectedFile) {
        const { url } = await uploadReceiptFile(selectedFile);
        if (url) {
          finalReceiptUrl = url;
        }
      }

      onResubmitSale({
        saleId: sale.id,
        product_type: productType,
        volume: parsedVolume,
        volume_unit: volumeUnit,
        document_number: documentNumber.trim(),
        receipt_url: finalReceiptUrl,
      });

      setIsSubmitting(false);
      onClose();
    } catch (err) {
      console.error('[CorrectionModal] Error during resubmission:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
        <div
          className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-[#E0E6ED] animate-in zoom-in-95 duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="correction-modal-title"
        >
          {/* =================================================================== */}
          {/* HEADER: CORRECCIÓN DE VENTA */}
          {/* =================================================================== */}
          <div className="bg-[#003E78] text-white px-5 py-4 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E53E3E]/20 border border-[#E53E3E]/40 flex items-center justify-center text-[#FFCA00]">
                <RefreshCw className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h2 id="correction-modal-title" className="font-bold text-base sm:text-lg tracking-wide leading-tight text-white">
                  Corregir Venta Rechazada
                </h2>
                <p className="text-xs text-blue-200 mt-0.5">
                  Remisión original: <span className="font-mono text-white/90">{sale.document_number}</span> · Estado: Por Corregir
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1.5 rounded-md hover:bg-white/10 transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* =================================================================== */}
          {/* BODY: FORMULARIO CON DATOS PRECARGADOS Y CAJA ROJA DE MOTIVO */}
          {/* =================================================================== */}
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
            {/* 1. CAJA ROJA DESTACADA: MOTIVO DE RECHAZO DEL SUPERVISOR (PRD Regla #5) */}
            <div className="rounded-xl border-2 border-[#E53E3E] bg-red-50/90 p-4 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-[#E53E3E] font-bold text-xs uppercase tracking-wide">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#E53E3E]" />
                <span>Motivo de Rechazo del Supervisor:</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-red-950 bg-white/70 p-2.5 rounded-lg border border-red-200 leading-relaxed">
                &ldquo;{sale.rejection_reason || 'Comprobante ilegible. El sello de báscula o los datos de remisión no son visibles en la foto adjunta.'}&rdquo;
              </p>
              <p className="text-[11px] text-red-700 leading-tight flex items-center">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600 inline shrink-0 mr-1" />
                <span><strong>Regla de Negocio #5:</strong> Corrige los datos señalados o reemplaza el comprobante con una fotografía legible para reenviar inmediatamente a validación sin perder los Puntos Ultra asociados.</span>
              </p>
            </div>

            {/* 2. Cliente Destino (Precargado / Informativo) */}
            <div>
              <label className="font-bold text-[#003E78] block mb-1 uppercase tracking-wider text-xs">
                Cliente Destino
              </label>
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800">
                <Building2 className="w-4 h-4 text-[#003E78] shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-xs sm:text-sm text-[#003E78] leading-tight">
                    {clientDisplayName}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {clientInfo ? `NIT: ${clientInfo.nit} · ${clientInfo.city}` : 'Cliente asignado a su cartera'}
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Tipo de Producto */}
            <div>
              <label className="font-bold text-[#003E78] block mb-1 uppercase tracking-wider text-xs">
                Tipo de Producto
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Cemento', 'Concreto', 'Pegantes', 'Morteros'] as ProductType[]).map((prod) => (
                  <button
                    type="button"
                    key={prod}
                    onClick={() => {
                      setProductType(prod);
                      if (prod === 'Concreto') setVolumeUnit('m3');
                      else setVolumeUnit('Ton');
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all text-center ${
                      productType === prod
                        ? 'bg-[#003E78] text-white border-[#003E78] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {prod}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Volumen y Unidad */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#003E78] block mb-1 uppercase tracking-wider text-xs">
                  Volumen Despachado
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  className="input-ultracem w-full font-bold text-slate-800"
                  placeholder="Ej. 50"
                />
              </div>

              <div>
                <label className="font-bold text-[#003E78] block mb-1 uppercase tracking-wider text-xs">
                  Unidad de Medida
                </label>
                <div className="flex rounded-lg border border-[#E0E6ED] p-1 bg-slate-50 h-[42px] items-center">
                  <button
                    type="button"
                    onClick={() => setVolumeUnit('Ton')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${
                      volumeUnit === 'Ton' ? 'bg-[#003E78] text-white shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Toneladas (Ton)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVolumeUnit('m3')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${
                      volumeUnit === 'm3' ? 'bg-[#003E78] text-white shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Metros Cúbicos (m³)
                  </button>
                </div>
              </div>
            </div>

            {/* 5. Número de Remisión */}
            <div>
              <label className="font-bold text-[#003E78] block mb-1 uppercase tracking-wider text-xs">
                Número de Remisión / Factura
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="Ej. REM-2024-0839"
                  className="input-ultracem w-full pl-9 font-mono uppercase text-slate-800"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Asegúrate de que coincida con el número impreso en el tiquete de báscula.
              </p>
            </div>

            {/* 6. Soporte Documental: Reemplazo de Comprobante Ilegible */}
            <div className="space-y-2">
              <label className="font-bold text-[#003E78] block uppercase tracking-wider text-xs">
                Comprobante Documental / Tiquete de Báscula
              </label>

              {/* Current Receipt Preview Bar */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-md bg-slate-200 overflow-hidden shrink-0 border border-slate-300 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={receiptUrl || sale.receipt_url}
                      alt="Comprobante"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {newReceiptUploaded ? 'Nuevo comprobante cargado' : 'Comprobante actual (observado)'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {newReceiptUploaded ? 'Listo para revisión con sello visible' : 'Marcado como ilegible por supervisor'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(true)}
                    className="p-1.5 text-slate-600 hover:text-[#003E78] hover:bg-slate-200 rounded-md transition-colors"
                    title="Ver imagen completa"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {newReceiptUploaded && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-[5px]">
                      <Check className="w-3 h-3" /> Reemplazado
                    </span>
                  )}
                </div>
              </div>

              {/* Upload New Receipt Dropzone / Action */}
              <div className="border-2 border-dashed border-[#1E83EC]/60 hover:border-[#1E83EC] rounded-xl p-3.5 bg-blue-50/30 transition-all text-center">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E83EC] hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Seleccionar Nueva Foto / Archivo</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleSimulateNewUpload}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-blue-300 bg-white hover:bg-blue-50 text-[#003E78] font-semibold text-xs transition-colors"
                    title="Simular comprobante nítido con sello para demostración"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#1E83EC]" />
                    <span>Cargar Soporte Nítido (Demo)</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Formatos soportados: JPG, PNG o PDF. Asegúrate de enfocar el sello de báscula y fecha.
                </p>
              </div>
            </div>

            {/* =================================================================== */}
            {/* FOOTER ACTIONS */}
            {/* =================================================================== */}
            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-5 py-2.5 rounded-md border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-7 py-2.5 bg-[#003E78] hover:bg-[#002B54] active:scale-[0.98] text-white font-bold rounded-[5px] text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#FFCA00]" />
                    <span>Reenviando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#FFCA00]" />
                    <span>Reenviar a Validación</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* PREVIEW SUB-MODAL FOR RECEIPT INSPECTION */}
      {/* ===================================================================== */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="bg-[#003E78] text-white px-4 py-3 flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider">
                Vista Previa del Soporte
              </span>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-1 hover:bg-white/10 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 bg-slate-900 flex items-center justify-center max-h-[70vh] overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={receiptUrl || sale.receipt_url}
                alt="Vista Previa Soporte"
                className="max-h-[65vh] w-auto rounded object-contain"
              />
            </div>
            <div className="p-3 bg-white text-center">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-1.5 bg-[#003E78] text-white text-xs font-semibold rounded-md"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const CorrectionModal: React.FC<CorrectionModalProps> = ({
  isOpen,
  onClose,
  sale,
  clients = [],
  onResubmitSale,
}) => {
  if (!isOpen || !sale) return null;

  return (
    <CorrectionModalDialog
      key={sale.id}
      sale={sale}
      onClose={onClose}
      clients={clients}
      onResubmitSale={onResubmitSale}
    />
  );
};
