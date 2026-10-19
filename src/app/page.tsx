'use client';

import React, { useState, useEffect } from 'react';
import { User, Client, Goal, Sale, NotificationItem, ProductType, Role, UserStatus } from '@/lib/types';
import {
  INITIAL_USERS,
  INITIAL_CLIENTS,
  INITIAL_GOALS,
  INITIAL_SALES,
  INITIAL_NOTIFICATIONS,
} from '@/lib/mockData';
import {
  fetchUltracemUsers,
  fetchUltracemClients,
  fetchUltracemGoals,
  fetchUltracemSales,
  fetchUltracemNotifications,
  insertUltracemSale,
  updateSaleStatus,
  addUltraPoints,
  insertUltracemNotification,
  updateUserRole,
  updateUserStatus,
  createUltracemUser,
  requestAdvisorCreation,
} from '@/lib/supabase';
import { getStoredSession, saveSession } from '@/lib/auth';
import { UltracemHeader } from '@/components/UltracemHeader';
import { NetworkStatusBanner } from '@/components/NetworkStatusBanner';
import { CorrectionModal } from '@/components/CorrectionModal';
import { LoginModal } from '@/components/LoginModal';
import { UserManagementModal } from '@/components/UserManagementModal';
import { LeaderboardView } from '@/components/LeaderboardView';
import { RewardsCatalogModal } from '@/components/RewardsCatalogModal';
import { Reward, RedeemedRewardReceipt } from '@/lib/gamification';
import { Trophy } from 'lucide-react';
import { AdvisorDashboard } from '@/components/views/AdvisorDashboard';
import { ManagerDashboard } from '@/components/views/ManagerDashboard';

export default function Home() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  // Default to Asesor (Hichel Espitia) for field PWA experience
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[2]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leaderboard'>('dashboard');
  const [isRewardsModalOpen, setIsRewardsModalOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isUserManagementModalOpen, setIsUserManagementModalOpen] = useState<boolean>(false);

  // Load live data from Oracle Supabase on mount
  useEffect(() => {
    async function loadLiveData() {
      try {
        const [liveUsers, liveClients, liveGoals, liveSales, liveNotifications] = await Promise.all([
          fetchUltracemUsers(),
          fetchUltracemClients(),
          fetchUltracemGoals(),
          fetchUltracemSales(),
          fetchUltracemNotifications(),
        ]);

        if (liveUsers && liveUsers.length > 0) {
          setUsers(liveUsers);
          const savedSession = getStoredSession();
          const validSessionUser = savedSession ? liveUsers.find((u) => u.id === savedSession.id && u.status === 'activo') : null;
          if (validSessionUser) {
            setCurrentUser(validSessionUser);
          } else {
            const defaultAdvisor = liveUsers.find((u) => u.role === 'asesor' && u.status === 'activo') || liveUsers[0];
            setCurrentUser(defaultAdvisor);
          }
        }
        if (liveClients && liveClients.length > 0) setClients(liveClients);
        if (liveGoals && liveGoals.length > 0) setGoals(liveGoals);
        if (liveSales && liveSales.length > 0) setSales(liveSales);
        if (liveNotifications && liveNotifications.length > 0) setNotifications(liveNotifications);
        setIsLiveConnected(true);
      } catch (err) {
        console.warn('Usando datos locales resilientes:', err);
      }
    }

    loadLiveData();
  }, []);

  // 1. Register Sale Action (Advisor)
  const handleRegisterSale = async (newSaleData: Omit<Sale, 'id' | 'submitted_at'>) => {
    const tempId = `sale-${Date.now()}`;
    const optimisticSale: Sale = {
      ...newSaleData,
      id: tempId,
      submitted_at: new Date().toISOString(),
    };

    // Optimistic UI update
    setSales((prev) => [optimisticSale, ...prev]);

    // Persist to Oracle Supabase
    try {
      const persistedSale = await insertUltracemSale(newSaleData);
      setSales((prev) => prev.map((s) => (s.id === tempId ? persistedSale : s)));
    } catch (e) {
      console.warn('Error persistiendo venta en Supabase:', e);
    }

    // Add notification for Gerencia (Auditoría de Ventas)
    const manager = users.find((u) => u.role === 'gerente');
    if (manager) {
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        user_id: manager.id,
        type: 'info',
        title: 'Nueva Remisión para Auditoría',
        message: `${currentUser.name} ha registrado una remisión de ${optimisticSale.volume} ${optimisticSale.volume_unit} (${optimisticSale.product_type}) para ${optimisticSale.client_name}. Remisión #${optimisticSale.document_number}.`,
        read: false,
        created_at: 'Ahora',
      };
      setNotifications((prev) => [newNotif, ...prev]);
      insertUltracemNotification(newNotif).catch(() => {});
    }
  };

  // 2. Approve Sale Action (Supervisor)
  const handleApproveSale = async (saleId: string) => {
    setSales((prev) =>
      prev.map((s) => (s.id === saleId ? { ...s, status: 'aprobada', reviewed_at: new Date().toISOString() } : s))
    );

    const approvedSale = sales.find((s) => s.id === saleId);
    if (!approvedSale) return;

    const pointsToAdd = approvedSale.ultra_points_awarded || 125;

    // Update in Oracle Supabase
    updateSaleStatus(saleId, 'aprobada', undefined, currentUser.id, pointsToAdd).catch((e) =>
      console.warn('Error aprobando en Supabase:', e)
    );
    addUltraPoints(approvedSale.advisor_id, pointsToAdd).catch(() => {});

    // Award points locally
    setUsers((prev) =>
      prev.map((u) =>
        u.id === approvedSale.advisor_id ? { ...u, ultra_points: u.ultra_points + pointsToAdd } : u
      )
    );

    if (currentUser.id === approvedSale.advisor_id) {
      setCurrentUser((prev) => ({ ...prev, ultra_points: prev.ultra_points + pointsToAdd }));
    }

    // Update goal volume
    setGoals((prev) =>
      prev.map((g) =>
        g.assigned_to_user_id === approvedSale.advisor_id
          ? { ...g, current_volume: g.current_volume + approvedSale.volume }
          : g
      )
    );

    // Notification for advisor
    const approvalNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      user_id: approvedSale.advisor_id,
      type: 'aprobacion',
      title: '¡Venta Aprobada!',
      message: `Tu remisión #${approvedSale.document_number} (${approvedSale.volume} ${approvedSale.volume_unit} ${approvedSale.product_type}) ha sido aprobada por ${currentUser.name}. Se te han acreditado +${pointsToAdd} Puntos Ultra.`,
      read: false,
      created_at: 'Ahora',
    };
    setNotifications((prev) => [approvalNotif, ...prev]);
    insertUltracemNotification(approvalNotif).catch(() => {});
  };

  // 3. Reject Sale Action (Supervisor)
  const handleRejectSale = async (saleId: string, reason: string) => {
    setSales((prev) =>
      prev.map((s) =>
        s.id === saleId
          ? { ...s, status: 'por_corregir', rejection_reason: reason, reviewed_at: new Date().toISOString() }
          : s
      )
    );

    const rejectedSale = sales.find((s) => s.id === saleId);
    if (!rejectedSale) return;

    // Persist rejection to Oracle Supabase
    updateSaleStatus(saleId, 'por_corregir', reason, currentUser.id).catch((e) =>
      console.warn('Error rechazando en Supabase:', e)
    );

    // Notification for advisor with rejection reason
    const rejectionNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      user_id: rejectedSale.advisor_id,
      type: 'rechazo',
      title: 'Venta Requiere Corrección',
      message: `Tu remisión #${rejectedSale.document_number} para ${rejectedSale.client_name} requiere ajuste: ${reason}`,
      reference_id: rejectedSale.id,
      read: false,
      created_at: 'Ahora',
    };
    setNotifications((prev) => [rejectionNotif, ...prev]);
    insertUltracemNotification(rejectionNotif).catch(() => {});
  };

  // 4. Resubmit Corrected Sale Action (Advisor - PRD Rule #5)
  const [saleForCorrection, setSaleForCorrection] = useState<Sale | null>(null);

  const handleOpenCorrection = (saleId?: string) => {
    const target =
      sales.find((s) => s.id === saleId) ||
      sales.find((s) => s.status === 'por_corregir') ||
      null;
    if (target) {
      setSaleForCorrection(target);
    }
  };

  const handleResubmitSale = async (updatedData: {
    saleId: string;
    product_type: ProductType;
    volume: number;
    volume_unit: 'Ton' | 'm3';
    document_number: string;
    receipt_url: string;
  }) => {
    setSales((prev) =>
      prev.map((s) =>
        s.id === updatedData.saleId
          ? {
              ...s,
              product_type: updatedData.product_type,
              volume: updatedData.volume,
              volume_unit: updatedData.volume_unit,
              document_number: updatedData.document_number,
              receipt_url: updatedData.receipt_url,
              status: 'pendiente',
              rejection_reason: undefined,
              submitted_at: new Date().toISOString(),
            }
          : s
      )
    );

    // Update in Oracle Supabase
    updateSaleStatus(updatedData.saleId, 'pendiente').catch(() => {});

    // Notify Gerencia of resubmission
    const manager = users.find((u) => u.role === 'gerente');
    if (manager) {
      const resubmitNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        user_id: manager.id,
        type: 'info',
        title: 'Remisión Corregida para Auditoría',
        message: `${currentUser.name} ha corregido y reenviado la remisión #${updatedData.document_number} para auditoría.`,
        read: false,
        created_at: 'Ahora',
      };
      setNotifications((prev) => [resubmitNotif, ...prev]);
      insertUltracemNotification(resubmitNotif).catch(() => {});
    }
  };

  // 5. Export CSV Action according to user's role
  const handleExportCSV = () => {
    let csvContent = '';
    let filename = '';

    if (currentUser.role === 'asesor') {
      filename = `Reporte_Asesor_${currentUser.name.replace(/\s+/g, '_')}.csv`;
      csvContent = 'Cliente,NIT,Producto,Ultima_Compra_Fecha,Volumen_Ton,Puntos_Ultra\n';
      clients
        .filter((c) => c.assigned_advisor_id === currentUser.id)
        .forEach((c) => {
          csvContent += `"${c.business_name}","${c.nit}","${c.usual_product}","${c.last_purchase_date || ''}",${c.last_purchase_volume || 0},${currentUser.ultra_points}\n`;
        });
    } else {
      filename = `Reporte_Consolidado_Direccion_Ultracem.csv`;
      csvContent = 'Zona,Remision,Asesor,Cliente,Producto,Volumen,Unidad,Valor_COP,Estado,Fecha\n';
      sales.forEach((s) => {
        csvContent += `"Caribe","${s.document_number}","${s.advisor_name}","${s.client_name}","${s.product_type}",${s.volume},"${s.volume_unit}",${s.total_value_cop},"${s.status}","${s.submitted_at}"\n`;
      });
    }

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 6. RBAC: Update User Role (Ascend / Degrade)
  const handleUpdateUserRole = async (userId: string, newRole: Role) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, role: newRole }));
    }

    try {
      await updateUserRole(userId, newRole);
    } catch (e) {
      console.warn('Error actualizando rol en Supabase:', e);
    }

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      user_id: userId,
      type: 'info',
      title: 'Actualización Jerárquica RBAC',
      message: `Tu rol en Ultracem ha sido actualizado a ${newRole.toUpperCase()} por la Gerencia General.`,
      read: false,
      created_at: 'Ahora',
    };
    setNotifications((prev) => [notif, ...prev]);
    insertUltracemNotification(notif).catch(() => {});
  };

  // 7. RBAC: Update User Status (Activate, Suspend, Approve)
  const handleUpdateUserStatus = async (userId: string, newStatus: UserStatus) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              status: newStatus,
              approved_by_user_id: newStatus === 'activo' ? currentUser.id : u.approved_by_user_id,
            }
          : u
      )
    );

    if (currentUser.id === userId && newStatus === 'suspendido') {
      setIsLoginModalOpen(true);
    }

    try {
      await updateUserStatus(userId, newStatus, currentUser.id);
    } catch (e) {
      console.warn('Error actualizando estado en Supabase:', e);
    }

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      user_id: userId,
      type: 'info',
      title: newStatus === 'activo' ? 'Credenciales Autorizadas' : 'Credenciales Suspendidas',
      message:
        newStatus === 'activo'
          ? `Tus credenciales profesionales han sido validadas y activadas por la Gerencia General de Ultracem.`
          : `Tus credenciales profesionales han sido suspendidas por la Gerencia General.`,
      read: false,
      created_at: 'Ahora',
    };
    setNotifications((prev) => [notif, ...prev]);
    insertUltracemNotification(notif).catch(() => {});
  };

  // 8. RBAC: Create Direct User (Gerente General)
  const handleCreateDirectUser = async (userData: {
    name: string;
    email: string;
    role: Role;
    zone: string;
    phone: string;
    employee_code: string;
    corporate_password?: string;
  }) => {
    const tempId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `usr-${Date.now()}`;
    const newUser: User = {
      id: tempId,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      zone: userData.zone,
      phone: userData.phone,
      employee_code: userData.employee_code,
      corporate_password: userData.corporate_password || 'Ultracem2026*',
      status: 'activo',
      approved_by_user_id: currentUser.id,
      ultra_points: 0,
    };

    setUsers((prev) => [newUser, ...prev]);

    try {
      const persistedUser = await createUltracemUser({
        ...userData,
        approved_by_user_id: currentUser.id,
        status: 'activo',
      });
      if (persistedUser) {
        setUsers((prev) => prev.map((u) => (u.id === tempId ? persistedUser : u)));
      }
    } catch (e) {
      console.warn('Error creando usuario en Supabase:', e);
    }
  };

  // 9. RBAC: Supervisor Requests Advisor (Pending Approval)
  const handleRequestAdvisor = async (data: {
    name: string;
    email: string;
    phone: string;
    zone: string;
  }) => {
    const tempId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `req-${Date.now()}`;
    const generatedCode = `ULTRA-ASE-${Math.floor(100 + Math.random() * 900)}`;

    const requestedUser: User = {
      id: tempId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      zone: data.zone,
      role: 'asesor',
      employee_code: generatedCode,
      corporate_password: 'Ultra2026*Ase',
      status: 'pendiente_aprobacion',
      requested_by_user_id: currentUser.id,
      ultra_points: 0,
    };

    setUsers((prev) => [requestedUser, ...prev]);

    try {
      const persisted = await requestAdvisorCreation({
        ...data,
        requestedByUserId: currentUser.id,
      });
      if (persisted) {
        setUsers((prev) => prev.map((u) => (u.id === tempId ? persisted : u)));
      }
    } catch (e) {
      console.warn('Error solicitando asesor en Supabase:', e);
    }

    // Notificar a todos los Gerentes Generales
    const managers = users.filter((u) => u.role === 'gerente');
    managers.forEach((m) => {
      const notif: NotificationItem = {
        id: `notif-${Date.now()}-${m.id}`,
        user_id: m.id,
        type: 'info',
        title: 'Solicitud de Asesor Pendiente',
        message: `${currentUser.name} (Supervisor Zona ${currentUser.zone}) ha solicitado credenciales para el asesor ${data.name} (${generatedCode}).`,
        read: false,
        created_at: 'Ahora',
      };
      setNotifications((prev) => [notif, ...prev]);
      insertUltracemNotification(notif).catch(() => {});
    });
  };

  // 10. Login Success Action
  const handleLoginSuccess = (authenticatedUser: User) => {
    setCurrentUser(authenticatedUser);
    saveSession(authenticatedUser);
    setIsLoginModalOpen(false);
  };

  // 11. Gamification: Redeem Reward Action (Semana 4 SLC)
  const handleRedeemReward = (reward: Reward, receipt: RedeemedRewardReceipt) => {
    // Deduct points from currentUser and users list
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? { ...u, ultra_points: Math.max(0, u.ultra_points - reward.pointsRequired) }
          : u
      )
    );
    setCurrentUser((prev) => ({
      ...prev,
      ultra_points: Math.max(0, prev.ultra_points - reward.pointsRequired),
    }));

    // Local & Supabase notification for advisor
    const redeemNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      user_id: currentUser.id,
      type: 'info',
      title: '¡Incentivo Canjeado con Éxito!',
      message: `Has redimido "${reward.title}". Código corporativo: ${receipt.redemptionCode}. Preséntalo en la Dirección Comercial de Ultracem.`,
      read: false,
      created_at: 'Ahora',
    };
    setNotifications((prev) => [redeemNotif, ...prev]);
    insertUltracemNotification(redeemNotif).catch(() => {});
  };

  const pendingRequestsCount = users.filter((u) => u.status === 'pendiente_aprobacion').length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9]">
      {/* Ultracem Header with Real Logo, Points, Notifications & Demo Role Switcher */}
      <UltracemHeader
        currentUser={currentUser}
        onSwitchUser={(user) => {
          setCurrentUser(user);
          saveSession(user);
        }}
        availableUsers={users}
        notifications={notifications.filter(
          (n) => n.user_id === currentUser.id || currentUser.role === 'gerente'
        )}
        onCorrectSale={handleOpenCorrection}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenUserManagementModal={() => setIsUserManagementModalOpen(true)}
        pendingRequestsCount={pendingRequestsCount}
        activeTab={activeTab}
        onSwitchTab={setActiveTab}
        onOpenRewards={() => setIsRewardsModalOpen(true)}
      />

      {/* PWA Offline Detection & Sync Banner (Yellow #FFCA00 - PRD Spec 1.4) */}
      <NetworkStatusBanner
        onSyncComplete={async () => {
          const updatedSales = await fetchUltracemSales();
          if (updatedSales && updatedSales.length > 0) setSales(updatedSales);
        }}
      />

      {/* Mobile Sub-Navigation Bar for Tab Switching */}
      <div className="md:hidden bg-white border-b border-[#E0E6ED] px-4 py-2 flex items-center justify-center gap-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 py-1.5 px-3 rounded-[5px] text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-[#003E78] text-white shadow-xs'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          Operaciones
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 py-1.5 px-3 rounded-[5px] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'leaderboard'
              ? 'bg-[#FFCA00] text-[#003E78] shadow-xs font-extrabold'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-[#003E78]" />
          <span>Ranking &amp; Podio</span>
        </button>
      </div>

      {/* Main Content Router based on current active tab and role */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'leaderboard' ? (
          <LeaderboardView
            currentUser={currentUser}
            users={users}
            sales={sales}
            onOpenRewards={() => setIsRewardsModalOpen(true)}
          />
        ) : (
          <>
            {currentUser.role === 'asesor' && (
              <AdvisorDashboard
                user={currentUser}
                clients={clients.filter((c) => c.assigned_advisor_id === currentUser.id)}
                goals={goals.filter((g) => g.assigned_to_user_id === currentUser.id)}
                sales={sales.filter((s) => s.advisor_id === currentUser.id)}
                onRegisterSale={handleRegisterSale}
                onResubmitSale={handleResubmitSale}
                onOpenLeaderboard={() => setActiveTab('leaderboard')}
                onOpenRewards={() => setIsRewardsModalOpen(true)}
              />
            )}

            {currentUser.role === 'gerente' && (
              <ManagerDashboard
                user={currentUser}
                clients={clients}
                goals={goals}
                sales={sales}
                onExportCSV={handleExportCSV}
                onApproveSale={handleApproveSale}
                onRejectSale={handleRejectSale}
              />
            )}
          </>
        )}
      </main>

      {/* Correction Modal triggered from Notification Drawer or Sales Activity */}
      <CorrectionModal
        isOpen={!!saleForCorrection}
        onClose={() => setSaleForCorrection(null)}
        sale={saleForCorrection}
        clients={clients}
        onResubmitSale={handleResubmitSale}
      />

      {/* Modal de Autenticación con Credenciales Profesionales */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        availableUsers={users}
        currentSessionUser={currentUser}
      />

      {/* Modal de Gestión Jerárquica RBAC & Credenciales */}
      <UserManagementModal
        isOpen={isUserManagementModalOpen}
        onClose={() => setIsUserManagementModalOpen(false)}
        currentUser={currentUser}
        allUsers={users}
        onUpdateUserRole={handleUpdateUserRole}
        onUpdateUserStatus={handleUpdateUserStatus}
        onCreateDirectUser={handleCreateDirectUser}
        onRequestAdvisor={handleRequestAdvisor}
      />

      {/* Modal de Catálogo Oficial de Incentivos y Recompensas Ultracem (Semana 4 SLC) */}
      <RewardsCatalogModal
        isOpen={isRewardsModalOpen}
        onClose={() => setIsRewardsModalOpen(false)}
        currentUser={currentUser}
        onRedeemReward={handleRedeemReward}
      />
    </div>
  );
}
