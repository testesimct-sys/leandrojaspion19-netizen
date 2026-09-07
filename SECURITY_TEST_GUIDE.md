# Guia de Verificação de Segurança e Proteção de Rotas

Este documento descreve o protocolo para validar as restrições de acesso e a integridade das regras de segurança (RBAC) do sistema SICT.

## 1. Protocolo de Verificação Manual

### Pré-requisitos
*   Uma conta de usuário com o papel (role) **'CLIENTE'**.
*   Uma conta de usuário com o papel **'ADMIN'** ou **'CORRETOR'**.

### Passo a Passo

#### Cenário A: Usuário não autenticado (Anônimo)
1.  Abra o navegador em modo anônimo.
2.  Tente acessar diretamente a URL: `https://[seu-app]/dashboard`.
3.  **Resultado Esperado**: O sistema deve identificar a ausência de sessão e redirecionar para `/login`.

#### Cenário B: Usuário logado como 'CLIENTE'
1.  Faça login no sistema com a conta de **'CLIENTE'**.
2.  Uma vez logado, tente acessar as seguintes URLs digitando-as no navegador:
    *   `/dashboard`
    *   `/dashboard/imoveis`
    *   `/dashboard/crm/pipeline`
3.  **Resultado Esperado**: O componente `ProtectedRoute` deve detectar que o papel 'CLIENTE' não tem permissão para o grupo `['ADMIN', 'CORRETOR']`. O sistema deve redirecionar o usuário imediatamente para a Home (`/`).
4.  Verifique se o menu administrativo (Sidebar) **não** é visível na interface.

#### Cenário C: Acesso Direto a Dados (Segurança de Banco)
1.  Mesmo que a interface redirecione, este passo valida se o banco está protegido.
2.  Utilizando o Console do Desenvolvedor (F12) no navegador, tente simular uma consulta à coleção `leads` ou `auditLogs`.
3.  **Resultado Esperado**: O Firebase deve retornar um erro de `Missing or insufficient permissions`, comprovando que a regra no `firestore.rules` está bloqueando o acesso no nível do banco de dados.

## 2. Auditoria de Lógica (Code Review)

### Verificação de Proteção de Rotas (`src/App.tsx`)
O código abaixo garante o bloqueio preventivo no frontend:
```tsx
<Route path="/dashboard" element={
  <ProtectedRoute allowedRoles={['ADMIN', 'CORRETOR']}>
    <AdminLayout />
  </ProtectedRoute>
}>
```

### Verificação de Regras Firestore (`firestore.rules`)
O código abaixo garante o bloqueio definitivo no backend:
```javascript
match /leads/{leadId} {
  allow read, write: if request.auth != null && 
    (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['ADMIN', 'CORRETOR']);
}
```

---
*Este guia assegura que a Elite Imóveis mantém a privacidade dos dados de CRM e imóveis, permitindo apenas que profissionais autorizados acessem o painel administrativo.*
