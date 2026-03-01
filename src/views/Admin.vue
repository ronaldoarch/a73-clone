<template>
  <ion-page>
    <!-- Login -->
    <div v-if="!adminLoggedIn" class="admin-login-page">
      <div class="admin-login-box">
        <h1>🎰 A73 Admin</h1>
        <form @submit.prevent="adminLogin">
          <div class="form-group">
            <label>Usuário</label>
            <input v-model="adminUser" type="text" placeholder="admin" />
          </div>
          <div class="form-group">
            <label>Senha</label>
            <input v-model="adminPass" type="password" placeholder="••••••" />
          </div>
          <button type="submit" class="btn btn-primary">Entrar</button>
        </form>
        <router-link to="/main/inicio/" class="link-site">← Voltar ao site</router-link>
      </div>
    </div>

    <!-- Main Admin -->
    <div v-else class="admin-layout">
      <div v-if="sidebarOpen" class="admin-sidebar-overlay" @click="sidebarOpen = false" aria-hidden="true"></div>
      <aside class="admin-sidebar" :class="{ open: sidebarOpen }">
        <div class="admin-logo">A73 Admin</div>
        <nav>
          <a
            v-for="s in sections"
            :key="s.id"
            :class="['nav-item', { active: activeSection === s.id }]"
            @click.prevent="selectSection(s.id)"
          >
            <component :is="s.icon" />
            {{ s.label }}
          </a>
          <router-link to="/main/inicio/" class="nav-item" @click="sidebarOpen = false">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
            Ver site
          </router-link>
        </nav>
        <button class="admin-sidebar-close" @click="sidebarOpen = false" aria-label="Fechar menu">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </aside>
      <main class="admin-main">
        <div class="admin-header">
          <button class="admin-menu-btn" @click="sidebarOpen = true" aria-label="Abrir menu">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          <h1>{{ titles[activeSection] }}</h1>
          <div class="user-badge">
            <span class="dot"></span>
            <span>Admin</span>
            <button class="btn btn-ghost" @click="adminLogout">Sair</button>
          </div>
        </div>

        <!-- Dashboard -->
        <section v-show="activeSection === 'dashboard'" class="admin-section">
          <div class="cards">
            <div class="card"><div class="card-label">Usuários ativos</div><div class="card-value">1.247</div></div>
            <div class="card"><div class="card-label">Depósitos hoje</div><div class="card-value green">R$ 12.450</div></div>
            <div class="card"><div class="card-label">Saques pendentes</div><div class="card-value">R$ 3.200</div></div>
            <div class="card"><div class="card-label">Banca total</div><div class="card-value">R$ 89.320</div></div>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Atividade recente</th><th>Valor</th><th>Status</th><th>Data</th></tr></thead>
              <tbody>
                <tr><td>Depósito - user_***42</td><td>R$ 50,00</td><td><span class="badge badge-success">Aprovado</span></td><td>25/02 14:32</td></tr>
                <tr><td>Saque - user_***18</td><td>R$ 120,00</td><td><span class="badge badge-pending">Pendente</span></td><td>25/02 14:28</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Usuários -->
        <section v-show="activeSection === 'usuarios'" class="admin-section">
          <div class="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Usuário</th><th>Saldo</th><th>Registro</th><th>Ações</th></tr></thead>
              <tbody>
                <tr v-for="u in usuarios" :key="u.id"><td>{{ u.id }}</td><td>{{ u.user }}</td><td>{{ u.saldo }}</td><td>{{ u.reg }}</td><td><button class="btn btn-ghost">Ver</button></td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Depósitos -->
        <section v-show="activeSection === 'depositos'" class="admin-section">
          <div class="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Usuário</th><th>Valor</th><th>Método</th><th>Status</th><th>Data</th></tr></thead>
              <tbody>
                <tr v-for="d in depositos" :key="d.id"><td>{{ d.id }}</td><td>{{ d.user }}</td><td>{{ d.valor }}</td><td>{{ d.metodo }}</td><td><span :class="['badge', d.badge]">{{ d.status }}</span></td><td>{{ d.data }}</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Saques -->
        <section v-show="activeSection === 'saques'" class="admin-section">
          <div class="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Usuário</th><th>Valor</th><th>Chave PIX</th><th>Status</th><th>Ação</th></tr></thead>
              <tbody>
                <tr v-for="s in saques" :key="s.id"><td>{{ s.id }}</td><td>{{ s.user }}</td><td>{{ s.valor }}</td><td>{{ s.pix }}</td><td><span :class="['badge', s.badge]">{{ s.status }}</span></td><td><button v-if="s.pendente" class="btn btn-primary">Aprovar</button><span v-else>-</span></td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Afiliados -->
        <section v-show="activeSection === 'afiliados'" class="admin-section">
          <div class="card" style="margin-bottom: 1.5rem;">
            <div class="card-label" style="margin-bottom: 1rem;">Todos os usuários que se cadastrarem já se tornam afiliados. Configure a comissão padrão:</div>
            <form @submit.prevent="savePadraoAfiliado" style="display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: flex-end;">
              <div class="form-group" style="margin-bottom: 0; min-width: 140px;">
                <label>Porcentagem padrão (%)</label>
                <input v-model.number="configPadrao.porcentagem" type="number" min="1" max="50" step="0.5" />
              </div>
              <div class="radio-group" style="margin-bottom: 0;">
                <label>Comissão em:</label>
                <label><input v-model="configPadrao.tipo" type="radio" value="primeiro" /> Apenas no primeiro depósito</label>
                <label><input v-model="configPadrao.tipo" type="radio" value="todos" /> Em todos os depósitos</label>
              </div>
              <button type="submit" class="btn btn-primary">Salvar padrão</button>
            </form>
            <div v-if="padraoSalvo" class="padrao-msg">✓ Configuração salva!</div>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Código</th><th>Nome</th><th>Comissão</th><th>Tipo</th><th>Total ganho</th><th>Indicações</th><th>Ações</th></tr></thead>
              <tbody>
                <tr v-for="a in afiliados" :key="a.id" :data-id="a.id">
                  <td>{{ a.codigo }}</td><td>{{ a.nome }}</td><td>{{ a.porcentagem }}%</td>
                  <td><span :class="['badge', a.tipo === 'primeiro' ? 'badge-success' : 'badge-pending']">{{ a.tipo === 'primeiro' ? '1º depósito' : 'Todos' }}</span></td>
                  <td>{{ a.total }}</td><td>{{ a.ind }}</td>
                  <td><button class="btn btn-ghost" @click="openModalAfiliado(a.id)">Editar</button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style="margin-top: 1rem;"><button class="btn btn-primary" @click="openModalAfiliado()">+ Novo afiliado</button></div>
        </section>

        <!-- Tema -->
        <section v-show="activeSection === 'tema'" class="admin-section">
          <div class="card" style="margin-bottom: 1.5rem;">
            <div class="card-label" style="margin-bottom: 1rem;">Gerencie os temas da plataforma. Altere cores em tempo real.</div>
            <button class="btn btn-primary" @click="openModalTema()">+ Novo tema</button>
          </div>
          <div class="cards temas-grid">
            <div v-for="t in temas" :key="t.id" class="card tema-card">
              <span v-if="temaAtivoId === t.id" class="badge badge-success tema-badge">Principal</span>
              <div class="tema-preview">
                <div :style="{ background: t.primary }"></div>
                <div :style="{ background: t.bg, border: '1px solid ' + t.border }"></div>
                <div :style="{ background: t.card }"></div>
              </div>
              <div class="card-label">{{ t.nome }}</div>
              <div class="tema-actions">
                <button class="btn btn-primary" @click="setTemaPrincipal(t.id)">Definir principal</button>
                <button class="btn btn-ghost" @click="openModalTema(t.id)">Editar</button>
                <button v-if="t.id !== 'default'" class="btn btn-ghost btn-danger" @click="excluirTema(t.id)">Excluir</button>
              </div>
            </div>
          </div>
          <div class="card" style="margin-top: 1.5rem;">
            <h3 style="margin-bottom: 1rem;">Preview em tempo real</h3>
            <iframe ref="temaPreview" src="/main/inicio/" class="tema-iframe" title="Preview"></iframe>
          </div>
        </section>

        <!-- API de Jogos (iGameWin) -->
        <section v-show="activeSection === 'jogos'" class="admin-section">
          <div class="card api-jogos-card">
            <div class="api-jogos-header">
              <h3>iGameWin API</h3>
              <span class="badge" :class="igameConfig.sandbox ? 'badge-pending' : 'badge-success'">
                {{ igameConfig.sandbox ? 'Sandbox' : 'Live' }}
              </span>
            </div>
            <div class="api-jogos-grid">
              <div class="api-jogos-item">
                <span class="api-jogos-label">Agent Balance</span>
                <span class="api-jogos-value">{{ formatBalance(igameConfig.agent_balance) }}</span>
              </div>
              <div class="api-jogos-item">
                <span class="api-jogos-label">Agent RTP</span>
                <div class="api-jogos-rtp-row">
                  <span class="api-jogos-value">{{ igameConfig.agent_rtp }}%</span>
                  <button class="btn btn-ghost btn-sm" @click="showRtpModal = true">Change</button>
                </div>
              </div>
              <div class="api-jogos-item">
                <span class="api-jogos-label">Add Balance</span>
                <div class="api-jogos-add-row">
                  <input v-model.number="addBalanceAmount" type="number" min="100" step="1000" placeholder="10000" class="api-jogos-input" />
                  <button class="btn btn-primary" @click="doAddBalance">Add</button>
                </div>
              </div>
            </div>
            <div class="api-jogos-config">
              <div class="form-group">
                <label>Agent Code</label>
                <input v-model="igameConfig.agent_code" type="text" placeholder="Midaslabs" @blur="saveIgameConfig" />
              </div>
              <div class="form-group">
                <label>Agent Token</label>
                <input v-model="igameConfig.agent_token" type="password" placeholder="••••••" @blur="saveIgameConfig" />
              </div>
              <div class="form-group">
                <label>Agent Secret (Seamless)</label>
                <input v-model="igameConfig.agent_secret" type="password" placeholder="••••••" @blur="saveIgameConfig" />
              </div>
              <label class="api-jogos-check">
                <input v-model="igameConfig.sandbox" type="checkbox" @change="saveIgameConfig" />
                Modo Sandbox (mock)
              </label>
              <label class="api-jogos-check">
                <input v-model="igameConfig.is_demo" type="checkbox" @change="saveIgameConfig" />
                Modo Demo/Samples (user_create com is_demo)
              </label>
              <div class="api-jogos-save-row">
                <button type="button" class="btn btn-primary" @click="saveIgameConfig">
                  Salvar credenciais
                </button>
                <span v-if="igameSaveMsg" class="api-jogos-save-msg" :class="{ error: igameSaveError }">{{ igameSaveMsg }}</span>
              </div>
            </div>
          </div>

          <div class="card api-guide-card">
            <h4 class="api-guide-title" @click="apiGuideOpen = !apiGuideOpen">
              API Link Guide
              <span class="api-guide-arrow">{{ apiGuideOpen ? '▼' : '▶' }}</span>
            </h4>
            <div v-show="apiGuideOpen" class="api-guide-content">
              <p><strong>Endpoint:</strong> <code>https://igamewin.com/api/v1</code></p>
              <p>Métodos: user_create, user_deposit, user_withdraw, user_withdraw_reset, set_demo, game_launch, money_info, provider_list, game_list, get_game_log, control_rtp, control_demo_spin</p>
            </div>
          </div>

          <!-- Call API (Slot) - RTP e Demo Spin -->
          <div class="card api-slot-card">
            <h4>Call API (Slot Game)</h4>
            <p class="card-label" style="margin-bottom: 1rem;">RTP (1–95%) e Demo Spin (1–15). Deixe vazio para agent/todos.</p>
            <div class="api-slot-grid">
              <div class="api-slot-item">
                <span class="api-slot-label">RTP</span>
                <div class="api-slot-row">
                  <input v-model.number="slotRtpValue" type="number" min="1" max="95" placeholder="92" class="api-slot-input" />
                  <input v-model="slotRtpUsers" type="text" placeholder="user ou user1,user2,user3" class="api-slot-input wide" />
                  <button class="btn btn-primary" :disabled="slotApiLoading" @click="doSlotRtp">
                    {{ slotApiLoading ? '...' : 'RTP' }}
                  </button>
                </div>
              </div>
              <div class="api-slot-item">
                <span class="api-slot-label">Demo Spin</span>
                <div class="api-slot-row">
                  <input v-model.number="slotDemoStart" type="number" min="1" max="15" placeholder="3" class="api-slot-input" />
                  <span class="api-slot-sep">–</span>
                  <input v-model.number="slotDemoEnd" type="number" min="1" max="15" placeholder="7" class="api-slot-input" />
                  <input v-model="slotDemoUsers" type="text" placeholder="user ou user1,user2" class="api-slot-input wide" />
                  <button class="btn btn-primary" :disabled="slotApiLoading" @click="doSlotDemoSpin">
                    {{ slotApiLoading ? '...' : 'Demo Spin' }}
                  </button>
                </div>
              </div>
            </div>
            <div v-if="slotApiMsg" class="api-slot-msg" :class="{ error: slotApiError }">{{ slotApiMsg }}</div>
          </div>

          <!-- Provedores e Jogos -->
          <div class="card api-games-card">
            <h4>Provedores e Jogos</h4>
            <p class="card-label" style="margin-bottom: 1rem;">Carregue os provedores e jogos da API (desmarque Sandbox e use suas credenciais)</p>
            <div class="api-games-actions">
              <button class="btn btn-primary" :disabled="gamesLoading" @click="loadProviders">
                {{ gamesLoading ? 'Carregando...' : 'Carregar Provedores' }}
              </button>
              <div v-if="providers.length" class="api-games-select-wrap">
                <select v-model="selectedProvider" class="api-games-select" @change="loadGames">
                  <option value="">Selecione um provedor</option>
                  <option v-for="p in providers" :key="p.code" :value="p.code">{{ p.name }}</option>
                </select>
                <button class="btn btn-primary" :disabled="gamesLoading || !selectedProvider" @click="loadGames">
                  {{ gamesLoading ? '...' : 'Carregar Jogos' }}
                </button>
              </div>
            </div>
            <div v-if="gamesError" class="api-games-error">{{ gamesError }}</div>
            <div v-if="games.length" class="api-games-grid">
              <div v-for="g in games" :key="g.game_code" class="api-game-card">
                <div class="api-game-banner">
                  <img v-if="g.banner" :src="g.banner" :alt="g.game_name" loading="lazy" />
                  <div v-else class="api-game-placeholder">
                    <span>{{ g.game_name?.slice(0, 2) || '?' }}</span>
                  </div>
                </div>
                <div class="api-game-info">
                  <span class="api-game-name">{{ g.game_name }}</span>
                  <span class="api-game-code">{{ g.game_code }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="card api-list-card">
            <h4>API List</h4>
            <div class="api-list-table">
              <div class="api-list-row header">
                <span>Method</span>
                <span>Descrição</span>
              </div>
              <div v-for="api in apiMethods" :key="api.method" class="api-list-row">
                <code>{{ api.method }}</code>
                <span>{{ api.desc }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Mídia -->
        <section v-show="activeSection === 'midia'" class="admin-section">
          <div class="card" style="margin-bottom: 1.5rem;">
            <div class="card-label" style="margin-bottom: 1rem;">Faça upload da logo e dos banners da plataforma.</div>
          </div>
          <div class="cards midia-grid">
            <div class="card">
              <h3>Logo / Ícone</h3>
              <p class="card-label" style="margin-bottom: 1rem;">Favicon e ícones do app</p>
              <div class="preview-box">
                <img v-if="logoUrl" :src="logoUrl" alt="Logo" />
                <span v-else class="placeholder">Sem logo</span>
              </div>
              <form @submit.prevent="uploadLogo">
                <input ref="logoInput" type="file" accept=".jpg,.jpeg,.png,.webp,.gif,.svg" style="display:none" @change="onLogoSelect" />
                <button type="button" class="btn btn-primary" @click="$refs.logoInput?.click()">Escolher arquivo</button>
                <button type="submit" class="btn btn-primary" :disabled="!logoFile">Enviar</button>
              </form>
              <div v-if="logoMsg" class="upload-msg" :class="{ error: logoMsgError }">{{ logoMsg }}</div>
            </div>
            <div class="card">
              <h3>Banner principal</h3>
              <p class="card-label" style="margin-bottom: 1rem;">Imagem para redes sociais</p>
              <div class="preview-box banner-preview">
                <img v-if="bannerUrl" :src="bannerUrl" alt="Banner" />
                <span v-else class="placeholder">Sem banner</span>
              </div>
              <form @submit.prevent="uploadBanner">
                <input ref="bannerInput" type="file" accept=".jpg,.jpeg,.png,.webp" style="display:none" @change="onBannerSelect" />
                <button type="button" class="btn btn-primary" @click="$refs.bannerInput?.click()">Escolher arquivo</button>
                <button type="submit" class="btn btn-primary" :disabled="!bannerFile">Enviar</button>
              </form>
              <div v-if="bannerMsg" class="upload-msg" :class="{ error: bannerMsgError }">{{ bannerMsg }}</div>
            </div>
          </div>
        </section>
      </main>
    </div>

    <!-- Modal Tema -->
    <div v-if="modalTemaOpen" class="modal-overlay" @click.self="closeModalTema">
      <div class="modal modal-tema">
        <h3>{{ editTemaId ? 'Editar tema' : 'Novo tema' }}</h3>
        <form @submit.prevent="saveTema">
          <div class="form-group">
            <label>Nome do tema</label>
            <input v-model="formTema.nome" type="text" placeholder="Ex: Escuro Dourado" />
          </div>
          <div class="form-row colors">
            <div class="form-group"><label>Cor primária</label><input v-model="formTema.primary" type="color" @input="previewTema" /></div>
            <div class="form-group"><label>Cor primária (hover)</label><input v-model="formTema.primaryHover" type="color" @input="previewTema" /></div>
            <div class="form-group"><label>Fundo</label><input v-model="formTema.bg" type="color" @input="previewTema" /></div>
            <div class="form-group"><label>Cards</label><input v-model="formTema.card" type="color" @input="previewTema" /></div>
            <div class="form-group"><label>Borda</label><input v-model="formTema.border" type="color" @input="previewTema" /></div>
            <div class="form-group"><label>Texto</label><input v-model="formTema.text" type="color" @input="previewTema" /></div>
            <div class="form-group"><label>Texto secundário</label><input v-model="formTema.textMuted" type="color" @input="previewTema" /></div>
            <div class="form-group"><label>Sucesso</label><input v-model="formTema.success" type="color" @input="previewTema" /></div>
            <div class="form-group"><label>Perigo</label><input v-model="formTema.danger" type="color" @input="previewTema" /></div>
          </div>
          <div class="form-group">
            <label>URL do ícone (opcional)</label>
            <input v-model="formTema.icon" type="text" placeholder="/s5/app-icon/1222508/LOGO.jpg" @input="previewTema" />
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-ghost" @click="closeModalTema">Cancelar</button>
            <button type="submit" class="btn btn-primary">Salvar tema</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal RTP -->
    <div v-if="showRtpModal" class="modal-overlay" @click.self="showRtpModal = false">
      <div class="modal">
        <h3>Alterar Agent RTP</h3>
        <p class="card-label">RTP deve ser ≤ 95%</p>
        <div class="form-group">
          <label>RTP (%)</label>
          <input v-model.number="newRtpValue" type="number" min="1" max="95" step="1" />
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" @click="showRtpModal = false">Cancelar</button>
          <button type="button" class="btn btn-primary" @click="doChangeRtp">Alterar</button>
        </div>
      </div>
    </div>

    <!-- Modal Afiliado -->
    <div v-if="modalAfiliadoOpen" class="modal-overlay" @click.self="closeModalAfiliado">
      <div class="modal">
        <h3>{{ editAfiliadoId ? 'Editar afiliado' : 'Novo afiliado' }}</h3>
        <form @submit.prevent="saveAfiliado">
          <div class="form-group">
            <label>Código do afiliado</label>
            <input v-model="formAfiliado.codigo" type="text" placeholder="AF001" :readonly="!!editAfiliadoId" />
          </div>
          <div class="form-group">
            <label>Nome</label>
            <input v-model="formAfiliado.nome" type="text" placeholder="Nome do afiliado" />
          </div>
          <div class="form-group">
            <label>Porcentagem de comissão (%)</label>
            <input v-model.number="formAfiliado.porcentagem" type="number" min="1" max="50" step="0.5" placeholder="15" />
          </div>
          <div class="radio-group">
            <label>Comissão em:</label>
            <label><input v-model="formAfiliado.tipo" type="radio" value="primeiro" /> Apenas no primeiro depósito</label>
            <label><input v-model="formAfiliado.tipo" type="radio" value="todos" /> Em todos os depósitos</label>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-ghost" @click="closeModalAfiliado">Cancelar</button>
            <button type="submit" class="btn btn-primary">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  </ion-page>
</template>

<script setup>
import { ref, computed, watch, h, onMounted } from 'vue'
import { IonPage } from '@ionic/vue'
import { igamewinApi } from '@/api/igamewin'
import { useSettings } from '@/composables/useSettings'
import { apiUrl } from '@/config/api'

const TEMAS_KEY = 'a73_temas'
const TEMA_ATIVO_KEY = 'a73_tema_ativo'
const defaultTheme = {
  id: 'default', nome: 'Padrão', primary: '#f59e0b', primaryHover: '#fbbf24', bg: '#0f0f14', card: '#1a1a24',
  border: '#2a2a3a', text: '#e5e7eb', textMuted: '#9ca3af', success: '#10b981', danger: '#ef4444', icon: '/s5/app-icon/1222508/LOGO.jpg'
}

const adminLoggedIn = ref(!!localStorage.getItem('admin_a73'))
const adminUser = ref('admin')
const adminPass = ref('admin123')
const activeSection = ref('dashboard')
const padraoSalvo = ref(false)
const sidebarOpen = ref(false)

function selectSection(id) {
  activeSection.value = id
  sidebarOpen.value = false
}

const titles = { dashboard: 'Dashboard', usuarios: 'Usuários', depositos: 'Depósitos', saques: 'Saques', afiliados: 'Afiliados', jogos: 'API de Jogos', tema: 'Tema', midia: 'Logo e Banners' }

const sections = [
  { id: 'dashboard', label: 'Dashboard', icon: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' })]) },
  { id: 'usuarios', label: 'Usuários', icon: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' })]) },
  { id: 'depositos', label: 'Depósitos', icon: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })]) },
  { id: 'saques', label: 'Saques', icon: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' })]) },
  { id: 'afiliados', label: 'Afiliados', icon: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M7 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' })]) },
  { id: 'jogos', label: 'API de Jogos', icon: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z' }), h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })]) },
  { id: 'tema', label: 'Tema', icon: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' })]) },
  { id: 'midia', label: 'Logo e Banners', icon: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' })]) },
]

const usuarios = [{ id: 1001, user: 'user_***42', saldo: 'R$ 85,00', reg: '20/02/2025' }, { id: 1002, user: 'user_***18', saldo: 'R$ 0,00', reg: '22/02/2025' }, { id: 1003, user: 'user_***91', saldo: 'R$ 210,50', reg: '24/02/2025' }]
const depositos = [{ id: 'D-4521', user: 'user_***42', valor: 'R$ 50,00', metodo: 'PIX', status: 'Aprovado', badge: 'badge-success', data: '25/02 14:32' }, { id: 'D-4520', user: 'user_***91', valor: 'R$ 25,00', metodo: 'PIX', status: 'Aprovado', badge: 'badge-success', data: '25/02 14:15' }, { id: 'D-4519', user: 'user_***77', valor: 'R$ 100,00', metodo: 'PIX', status: 'Pendente', badge: 'badge-pending', data: '25/02 13:58' }]
const saques = [{ id: 'S-1203', user: 'user_***18', valor: 'R$ 120,00', pix: '***@email.com', status: 'Pendente', badge: 'badge-pending', pendente: true }, { id: 'S-1202', user: 'user_***55', valor: 'R$ 80,00', pix: '***123', status: 'Pago', badge: 'badge-success', pendente: false }]

const configPadrao = ref(JSON.parse(localStorage.getItem('a73_config_padrao_afiliado') || '{"porcentagem":20,"tipo":"primeiro"}'))
const afiliados = ref([
  { id: 1, codigo: 'AF001', nome: 'João Silva', porcentagem: 15, tipo: 'todos', total: 'R$ 1.245,00', ind: 42 },
  { id: 2, codigo: 'AF002', nome: 'Maria Costa', porcentagem: 10, tipo: 'primeiro', total: 'R$ 320,00', ind: 18 },
  { id: 3, codigo: 'AF003', nome: 'Pedro Santos', porcentagem: 20, tipo: 'todos', total: 'R$ 890,50', ind: 31 },
])

function getTemas() {
  try {
    const t = JSON.parse(localStorage.getItem(TEMAS_KEY) || '[]')
    return t.length ? t : [defaultTheme]
  } catch (e) { return [defaultTheme] }
}
const temas = ref(getTemas())
const temaAtivoId = ref(localStorage.getItem(TEMA_ATIVO_KEY) || 'default')
const temaPreview = ref(null)

const modalTemaOpen = ref(false)
const modalAfiliadoOpen = ref(false)
const editTemaId = ref('')
const editAfiliadoId = ref('')
const formTema = ref({ nome: '', primary: '#f59e0b', primaryHover: '#fbbf24', bg: '#0f0f14', card: '#1a1a24', border: '#2a2a3a', text: '#e5e7eb', textMuted: '#9ca3af', success: '#10b981', danger: '#ef4444', icon: '' })
const formAfiliado = ref({ codigo: '', nome: '', porcentagem: 20, tipo: 'primeiro' })

// API de Jogos (iGameWin)
const igameConfig = ref({ ...igamewinApi.getConfig() })
const igameSaveMsg = ref('')
const igameSaveError = ref(false)

async function loadIgamewinConfigFromBackend() {
  try {
    const r = await fetch(apiUrl('/api/settings/igamewin'))
    const data = await r.json()
    if (data?.agent_code || data?.agent_token || data?.agent_secret) {
      igameConfig.value = { ...igamewinApi.getConfig(), ...data }
      igamewinApi.saveConfig(igameConfig.value)
    }
  } catch (e) { /* ignore */ }
}
const addBalanceAmount = ref(10000)
const showRtpModal = ref(false)
const newRtpValue = ref(70)
const apiGuideOpen = ref(false)
const providers = ref([])
const games = ref([])
const selectedProvider = ref('')
const gamesLoading = ref(false)
const gamesError = ref('')

// Call API (Slot) - RTP e Demo Spin
const slotApiLoading = ref(false)
const slotApiMsg = ref('')
const slotApiError = ref(false)
const slotRtpValue = ref(92)
const slotRtpUsers = ref('')
const slotDemoStart = ref(3)
const slotDemoEnd = ref(7)
const slotDemoUsers = ref('')

function parseUserCodes(str) {
  if (!str || !String(str).trim()) return null
  const arr = String(str).split(/[,\s]+/).map(s => s.trim()).filter(Boolean)
  return arr.length === 1 ? arr[0] : arr
}

async function doSlotRtp() {
  const rtp = Math.min(95, Math.max(1, slotRtpValue.value || 92))
  slotApiLoading.value = true
  slotApiMsg.value = ''
  slotApiError.value = false
  try {
    const userCode = parseUserCodes(slotRtpUsers.value)
    const data = await igamewinApi.controlRtp(rtp, userCode)
    if (data.status === 1) {
      slotApiMsg.value = `RTP alterado para ${data.changed_rtp ?? rtp}%`
      igameConfig.value = { ...igamewinApi.getConfig() }
    } else {
      slotApiMsg.value = data.msg || data.detail || 'Erro'
      slotApiError.value = true
    }
  } catch (e) {
    slotApiMsg.value = e.message || 'Erro'
    slotApiError.value = true
  } finally {
    slotApiLoading.value = false
  }
}

async function doSlotDemoSpin() {
  const start = Math.min(15, Math.max(1, slotDemoStart.value || 3))
  const end = Math.min(15, Math.max(1, slotDemoEnd.value || 7))
  if (start > end) {
    slotApiMsg.value = 'start deve ser ≤ end'
    slotApiError.value = true
    return
  }
  slotApiLoading.value = true
  slotApiMsg.value = ''
  slotApiError.value = false
  try {
    const userCode = parseUserCodes(slotDemoUsers.value)
    const data = await igamewinApi.controlDemoSpin(start, end, userCode)
    if (data.status === 1) {
      slotApiMsg.value = `Demo Spin: ${data.demo_spin_start}–${data.demo_spin_end}`
    } else {
      slotApiMsg.value = data.msg || data.detail || 'Erro'
      slotApiError.value = true
    }
  } catch (e) {
    slotApiMsg.value = e.message || 'Erro'
    slotApiError.value = true
  } finally {
    slotApiLoading.value = false
  }
}

async function loadProviders() {
  gamesError.value = ''
  gamesLoading.value = true
  try {
    const data = await igamewinApi.providerList()
    if (data.status === 1 && data.providers) {
      providers.value = data.providers.filter(p => p.status === 1)
      selectedProvider.value = providers.value[0]?.code || ''
      if (selectedProvider.value) await loadGames()
    } else {
      gamesError.value = data.msg || 'Erro ao carregar provedores'
    }
  } catch (e) {
    gamesError.value = e.message || 'Erro de conexão. Verifique CORS ou use o proxy em dev.'
  } finally {
    gamesLoading.value = false
  }
}

async function loadGames() {
  if (!selectedProvider.value) return
  gamesError.value = ''
  gamesLoading.value = true
  try {
    const data = await igamewinApi.gameList(selectedProvider.value)
    if (data.status === 1 && data.games) {
      games.value = data.games
    } else {
      gamesError.value = data.msg || 'Erro ao carregar jogos'
      games.value = []
    }
  } catch (e) {
    gamesError.value = e.message || 'Erro de conexão'
    games.value = []
  } finally {
    gamesLoading.value = false
  }
}

const apiMethods = [
  { method: 'user_create', desc: 'Criar novo usuário (is_demo para modo samples)' },
  { method: 'user_deposit', desc: 'Depositar saldo do usuário' },
  { method: 'user_withdraw', desc: 'Sacar saldo do usuário' },
  { method: 'user_withdraw_reset', desc: 'Resetar saque do usuário' },
  { method: 'set_demo', desc: 'Definir usuário como demo' },
  { method: 'game_launch', desc: 'Iniciar jogo' },
  { method: 'money_info', desc: 'Obter saldo do agent/usuário' },
  { method: 'provider_list', desc: 'Listar provedores' },
  { method: 'game_list', desc: 'Listar jogos por provedor' },
  { method: 'get_game_log', desc: 'Histórico de jogos' },
  { method: 'control_rtp', desc: 'Controlar RTP do agent/usuário' },
  { method: 'control_demo_spin', desc: 'Demo spin to pay (1–15)' },
]

function formatBalance(val) {
  const n = Number(val) || 0
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}

async function saveIgameConfig() {
  igamewinApi.saveConfig(igameConfig.value)
  igameSaveMsg.value = ''
  igameSaveError.value = false
  try {
    const r = await fetch(apiUrl('/api/settings/igamewin'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agent_code: igameConfig.value.agent_code,
        agent_token: igameConfig.value.agent_token,
        agent_secret: igameConfig.value.agent_secret ?? '',
        sandbox: igameConfig.value.sandbox,
        is_demo: igameConfig.value.is_demo,
      }),
    })
    const data = await r.json()
    if (data?.ok) {
      igameSaveMsg.value = 'Credenciais salvas! Os jogos aparecerão na plataforma.'
      igameSaveError.value = false
    } else {
      igameSaveMsg.value = data?.error || 'Erro ao salvar'
      igameSaveError.value = true
    }
  } catch (e) {
    igameSaveMsg.value = e.message || 'Erro de conexão. Verifique o proxy (BACKEND_URL).'
    igameSaveError.value = true
  }
  setTimeout(() => { igameSaveMsg.value = '' }, 4000)
}

function doAddBalance() {
  const amt = addBalanceAmount.value || 1000
  igamewinApi.addBalance(amt)
  igameConfig.value = { ...igamewinApi.getConfig() }
}

function doChangeRtp() {
  const rtp = Math.min(95, Math.max(1, newRtpValue.value || 70))
  igamewinApi.controlRtp(rtp).then(() => {
    igameConfig.value = { ...igamewinApi.getConfig() }
    showRtpModal.value = false
  })
}

watch(showRtpModal, (v) => {
  if (v) newRtpValue.value = igameConfig.value.agent_rtp ?? 70
})

onMounted(() => {
  loadIgamewinConfigFromBackend()
  igamewinApi.moneyInfo().then((data) => {
    if (data?.agent?.balance != null) {
      igameConfig.value.agent_balance = data.agent.balance
    }
  })
})

const { logoUrl, bannerUrl } = useSettings()
const logoFile = ref(null)
const bannerFile = ref(null)
const logoMsg = ref('')
const logoMsgError = ref(false)
const bannerMsg = ref('')
const bannerMsgError = ref(false)

function adminLogin() {
  if (adminUser.value && adminPass.value) {
    localStorage.setItem('admin_a73', '1')
    adminLoggedIn.value = true
  }
}
function adminLogout() {
  localStorage.removeItem('admin_a73')
  adminLoggedIn.value = false
}

function savePadraoAfiliado() {
  localStorage.setItem('a73_config_padrao_afiliado', JSON.stringify(configPadrao.value))
  padraoSalvo.value = true
  setTimeout(() => { padraoSalvo.value = false }, 2000)
}

function openModalAfiliado(id) {
  editAfiliadoId.value = id || ''
  if (id && afiliados.value.find(a => a.id == id)) {
    const a = afiliados.value.find(x => x.id == id)
    formAfiliado.value = { codigo: a.codigo, nome: a.nome, porcentagem: a.porcentagem, tipo: a.tipo }
  } else {
    const nextNum = Math.max(0, ...afiliados.value.map(a => parseInt(String(a.codigo).replace(/\D/g, '')) || 0)) + 1
    formAfiliado.value = { codigo: 'AF' + String(nextNum).padStart(3, '0'), nome: '', porcentagem: configPadrao.value.porcentagem, tipo: configPadrao.value.tipo }
  }
  modalAfiliadoOpen.value = true
}
function closeModalAfiliado() { modalAfiliadoOpen.value = false }
function saveAfiliado() {
  const id = editAfiliadoId.value || (Math.max(...afiliados.value.map(a => a.id), 0) + 1)
  const tipoLabel = formAfiliado.value.tipo === 'primeiro' ? '1º depósito' : 'Todos'
  const tipoBadge = formAfiliado.value.tipo === 'primeiro' ? 'badge-success' : 'badge-pending'
  const idx = afiliados.value.findIndex(a => a.id == id)
  const novo = { id, codigo: formAfiliado.value.codigo, nome: formAfiliado.value.nome, porcentagem: formAfiliado.value.porcentagem, tipo: formAfiliado.value.tipo, total: idx >= 0 ? afiliados.value[idx].total : 'R$ 0,00', ind: idx >= 0 ? afiliados.value[idx].ind : 0 }
  if (idx >= 0) afiliados.value[idx] = novo
  else afiliados.value.push(novo)
  closeModalAfiliado()
}

function getTemaById(id) {
  return getTemas().find(t => t.id === id) || defaultTheme
}
function applyTheme(tema) {
  const iframe = temaPreview.value
  if (iframe?.contentWindow) {
    try { iframe.contentWindow.postMessage({ type: 'a73_apply_theme', theme: tema }, '*') } catch (e) {}
  }
}
function previewTema() { applyTheme(formTema.value) }
function openModalTema(id) {
  editTemaId.value = id || ''
  const t = id ? getTemaById(id) : null
  formTema.value = t ? { ...t } : { nome: '', primary: '#f59e0b', primaryHover: '#fbbf24', bg: '#0f0f14', card: '#1a1a24', border: '#2a2a3a', text: '#e5e7eb', textMuted: '#9ca3af', success: '#10b981', danger: '#ef4444', icon: '/s5/app-icon/1222508/LOGO.jpg' }
  modalTemaOpen.value = true
  previewTema()
}
function closeModalTema() { modalTemaOpen.value = false }
function setTemaPrincipal(id) {
  localStorage.setItem(TEMA_ATIVO_KEY, id)
  temaAtivoId.value = id
  applyTheme(getTemaById(id))
}
function excluirTema(id) {
  if (id === 'default' || !confirm('Excluir este tema?')) return
  let t = getTemas().filter(x => x.id !== id)
  if (!t.length) t = [defaultTheme]
  localStorage.setItem(TEMAS_KEY, JSON.stringify(t))
  temas.value = t
  if (temaAtivoId.value === id) { setTemaPrincipal('default') }
}
function saveTema() {
  const id = editTemaId.value || 't' + Date.now()
  const tema = { id, ...formTema.value }
  let t = getTemas()
  const idx = t.findIndex(x => x.id === id)
  if (idx >= 0) t[idx] = tema
  else t.push(tema)
  localStorage.setItem(TEMAS_KEY, JSON.stringify(t))
  temas.value = t
  applyTheme(tema)
  closeModalTema()
}

function onLogoSelect(e) { logoFile.value = e.target.files?.[0] }
function onBannerSelect(e) { bannerFile.value = e.target.files?.[0] }
function showUploadMsg(which, text, isError) {
  if (which === 'logo') { logoMsg.value = text; logoMsgError.value = isError; setTimeout(() => { logoMsg.value = '' }, 4000) }
  else { bannerMsg.value = text; bannerMsgError.value = isError; setTimeout(() => { bannerMsg.value = '' }, 4000) }
}
async function uploadLogo() {
  if (!logoFile.value) return
  const fd = new FormData()
  fd.append('file', logoFile.value)
  try {
    const r = await fetch(apiUrl('/api/upload/logo'), { method: 'POST', body: fd })
    const data = await r.json()
    if (data.ok) { logoUrl.value = apiUrl(data.url) + '?t=' + Date.now(); showUploadMsg('logo', 'Logo enviada!', false); logoFile.value = null }
    else showUploadMsg('logo', data.error || 'Erro', true)
  } catch (e) { showUploadMsg('logo', 'Erro ao enviar', true) }
}
async function uploadBanner() {
  if (!bannerFile.value) return
  const fd = new FormData()
  fd.append('file', bannerFile.value)
  try {
    const r = await fetch(apiUrl('/api/upload/banner'), { method: 'POST', body: fd })
    const data = await r.json()
    if (data.ok) { bannerUrl.value = apiUrl(data.url) + '?t=' + Date.now(); showUploadMsg('banner', 'Banner enviado!', false); bannerFile.value = null }
    else showUploadMsg('banner', data.error || 'Erro', true)
  } catch (e) { showUploadMsg('banner', 'Erro ao enviar', true) }
}

watch(activeSection, async (s) => {
  if (s === 'tema') temas.value = getTemas()
  if (s === 'jogos') {
    await loadIgamewinConfigFromBackend()
    if (!igameConfig.value.sandbox && providers.value.length === 0) loadProviders()
  }
})
</script>

<style scoped>
:deep(ion-page) { --background: var(--bg); }
.admin-login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--bg) 0%, var(--card) 100%); }
.admin-login-box { width: 100%; max-width: 400px; padding: 2.5rem; background: var(--card); border: 1px solid var(--border); border-radius: 16px; }
.admin-login-box h1 { text-align: center; margin-bottom: 1.5rem; color: var(--primary); }
.form-group { margin-bottom: 1.25rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--text-muted); }
.form-group input { width: 100%; padding: 0.75rem 1rem; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-size: 1rem; }
.form-group input:focus { outline: none; border-color: var(--primary); }
.admin-login-box .btn { width: 100%; justify-content: center; padding: 0.875rem; margin-top: 0.5rem; }
.link-site { display: block; text-align: center; margin-top: 1.5rem; color: var(--text-muted); text-decoration: none; font-size: 0.875rem; }
.link-site:hover { color: var(--primary); }

.admin-layout { display: flex; min-height: 100vh; width: 100%; overflow: hidden; position: relative; }
.admin-sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 90; }
.admin-sidebar { width: 260px; flex-shrink: 0; background: var(--card); border-right: 1px solid var(--border); padding: 1.5rem 0; position: relative; }
.admin-sidebar-close { display: none; position: absolute; top: 1rem; right: 1rem; background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.5rem; }
.admin-sidebar-close svg { width: 24px; height: 24px; }
.admin-sidebar-close:hover { color: var(--text); }
.admin-menu-btn { display: none; background: none; border: none; color: var(--text); cursor: pointer; padding: 0.5rem; margin-right: 0.5rem; }
.admin-menu-btn svg { width: 24px; height: 24px; }
.admin-logo { padding: 0 1.5rem 1.5rem; font-size: 1.5rem; font-weight: 700; color: var(--primary); border-bottom: 1px solid var(--border); margin-bottom: 1rem; }
.nav-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.5rem; color: var(--text-muted); text-decoration: none; transition: all 0.2s; cursor: pointer; border-left: 3px solid transparent; }
.nav-item:hover, .nav-item.active { color: var(--primary); background: rgba(245, 158, 11, 0.08); border-left-color: var(--primary); }
.nav-item svg { width: 20px; height: 20px; flex-shrink: 0; }
.admin-main { flex: 1; min-width: 0; padding: 2rem; overflow-y: auto; overflow-x: hidden; background: var(--bg); }
.admin-section { width: 100%; max-width: 100%; min-width: 0; }
.admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
.admin-header h1 { font-size: 1.5rem; font-weight: 600; }
.user-badge { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: var(--card); border-radius: 8px; border: 1px solid var(--border); }
.user-badge .dot { width: 8px; height: 8px; background: var(--success); border-radius: 50%; }
.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
.card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; }
.card-label { font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.25rem; }
.card-value { font-size: 1.5rem; font-weight: 700; color: var(--primary); }
.card-value.green { color: var(--success); }
.card-value.red { color: var(--danger); }
.table-wrap { background: var(--card); border: 1px solid var(--border); border-radius: 12px; overflow-x: auto; overflow-y: visible; }
table { width: 100%; min-width: 560px; border-collapse: collapse; table-layout: auto; }
th, td { padding: 1rem 1.25rem; text-align: left; }
th { background: rgba(0,0,0,0.2); font-weight: 600; font-size: 0.875rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
tr { border-bottom: 1px solid var(--border); }
tr:last-child { border-bottom: none; }
tr:hover { background: rgba(255,255,255,0.02); }
.badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
.badge-success { background: rgba(16, 185, 129, 0.2); color: var(--success); }
.badge-pending { background: rgba(245, 158, 11, 0.2); color: var(--primary); }
.badge-danger { background: rgba(239, 68, 68, 0.2); color: var(--danger); }
.btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 500; cursor: pointer; border: none; font-size: 0.875rem; transition: all 0.2s; }
.btn-primary { background: var(--primary); color: #000; }
.btn-primary:hover { background: var(--primary-hover); }
.btn-ghost { background: transparent; color: var(--text-muted); }
.btn-ghost:hover { background: var(--card); color: var(--text); }
.btn-danger { color: var(--danger); }
.btn-danger:hover { color: var(--danger); }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; width: 100%; max-width: 420px; max-height: 90vh; overflow-y: auto; }
.modal-tema { max-width: 520px; }
.modal h3 { margin-bottom: 1.25rem; font-size: 1.125rem; }
.form-row { display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
.form-row.colors { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-row .form-group { flex: 1; min-width: 120px; }
.radio-group { margin-bottom: 1rem; }
.radio-group label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; margin-bottom: 0.5rem; }
.radio-group input[type="radio"] { accent-color: var(--primary); }
.modal-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.25rem; }
.temas-grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
.tema-card { position: relative; }
.tema-badge { position: absolute; top: 0.75rem; right: 0.75rem; }
.tema-preview { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; }
.tema-preview > div { width: 40px; height: 40px; border-radius: 8px; }
.tema-actions { display: flex; gap: 0.5rem; margin-top: 0.75rem; flex-wrap: wrap; }
.tema-iframe { width: 100%; height: 400px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); }
.midia-grid { grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
.preview-box { width: 80px; height: 80px; border-radius: 12px; background: var(--card); border: 1px solid var(--border); margin-bottom: 1rem; overflow: hidden; display: flex; align-items: center; justify-content: center; }
.preview-box.banner-preview { width: 100%; max-height: 120px; }
.preview-box img { max-width: 100%; max-height: 100%; object-fit: contain; }
.placeholder { color: var(--text-muted); font-size: 0.75rem; }
.padrao-msg { margin-top: 0.75rem; font-size: 0.875rem; color: var(--success); }
.upload-msg { margin-top: 0.75rem; font-size: 0.875rem; }
.upload-msg.error { color: var(--danger); }

/* API de Jogos */
.api-jogos-card { margin-bottom: 1.5rem; }
.api-jogos-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; }
.api-jogos-header h3 { margin: 0; font-size: 1.125rem; }
.api-jogos-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.25rem; }
.api-jogos-item { display: flex; flex-direction: column; gap: 0.5rem; }
.api-jogos-label { font-size: 0.8rem; color: var(--text-muted); }
.api-jogos-value { font-size: 1.25rem; font-weight: 700; color: var(--primary); }
.api-jogos-rtp-row { display: flex; align-items: center; gap: 0.5rem; }
.api-jogos-add-row { display: flex; gap: 0.5rem; align-items: center; }
.api-jogos-input { width: 120px; padding: 0.5rem 0.75rem; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-size: 0.9rem; }
.api-jogos-config { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border); }
.api-jogos-check { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0; cursor: pointer; font-size: 0.875rem; color: var(--text-muted); }
.api-jogos-check input { accent-color: var(--primary); }
.api-jogos-save-row { display: flex; align-items: center; gap: 1rem; margin-top: 1rem; flex-wrap: wrap; }
.api-jogos-save-msg { font-size: 0.875rem; color: var(--success, #10b981); }
.api-jogos-save-msg.error { color: var(--danger, #ef4444); }
.btn-sm { padding: 0.35rem 0.5rem; font-size: 0.8rem; }
.api-guide-card { margin-bottom: 1.5rem; }
.api-guide-title { margin: 0 0 0.5rem 0; cursor: pointer; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem; }
.api-guide-arrow { font-size: 0.75rem; color: var(--text-muted); }
.api-guide-content { padding-top: 0.5rem; }
.api-guide-content p { margin: 0 0 0.5rem 0; font-size: 0.875rem; color: var(--text-muted); }
.api-guide-content code { background: rgba(0,0,0,0.3); padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; }
.api-slot-card { margin-bottom: 1.5rem; }
.api-slot-card h4 { margin: 0 0 0.5rem 0; font-size: 1rem; }
.api-slot-grid { display: flex; flex-direction: column; gap: 1rem; }
.api-slot-item { display: flex; flex-direction: column; gap: 0.5rem; }
.api-slot-label { font-size: 0.8rem; color: var(--text-muted); }
.api-slot-row { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
.api-slot-input { width: 70px; padding: 0.5rem 0.75rem; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-size: 0.9rem; }
.api-slot-input.wide { flex: 1; min-width: 140px; }
.api-slot-sep { color: var(--text-muted); font-weight: 600; }
.api-slot-msg { font-size: 0.875rem; margin-top: 0.5rem; color: var(--success); }
.api-slot-msg.error { color: var(--danger); }
.api-list-card h4 { margin: 0 0 1rem 0; font-size: 1rem; }
.api-list-table { display: flex; flex-direction: column; gap: 0.25rem; }
.api-list-row { display: grid; grid-template-columns: 180px 1fr; gap: 1rem; padding: 0.5rem 0; border-bottom: 1px solid var(--border); font-size: 0.85rem; }
.api-list-row.header { font-weight: 600; color: var(--text-muted); }
.api-list-row code { font-size: 0.8rem; color: var(--primary); }

/* Provedores e Jogos */
.api-games-card { margin-bottom: 1.5rem; }
.api-games-card h4 { margin: 0 0 0.5rem 0; }
.api-games-actions { display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; margin-bottom: 1rem; }
.api-games-select-wrap { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
.api-games-select { padding: 0.5rem 1rem; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-size: 0.9rem; min-width: 180px; }
.api-games-error { color: var(--danger); font-size: 0.9rem; margin-bottom: 1rem; padding: 0.75rem; background: rgba(239,68,68,0.1); border-radius: 8px; }
.api-games-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 1rem; margin-top: 1rem; }
.api-game-card { background: var(--bg); border-radius: 12px; overflow: hidden; border: 1px solid var(--border); }
.api-game-banner { aspect-ratio: 1; overflow: hidden; background: rgba(0,0,0,0.3); }
.api-game-banner img { width: 100%; height: 100%; object-fit: cover; display: block; }
.api-game-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--primary) 0%, var(--card) 100%); color: #000; font-weight: 700; font-size: 1.5rem; }
.api-game-info { padding: 0.5rem 0.75rem; display: flex; flex-direction: column; gap: 0.25rem; }
.api-game-name { font-size: 0.85rem; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.api-game-code { font-size: 0.7rem; color: var(--text-muted); }

/* Responsivo - Admin */
@media (max-width: 768px) {
  .admin-sidebar-overlay { display: block; }
  .admin-sidebar {
    position: fixed; left: 0; top: 0; bottom: 0; z-index: 100;
    transform: translateX(-100%); transition: transform 0.25s ease;
    box-shadow: none;
  }
  .admin-sidebar.open { transform: translateX(0); box-shadow: 4px 0 20px rgba(0,0,0,0.3); }
  .admin-sidebar-close { display: block; }
  .admin-menu-btn { display: block; }
  .admin-main { padding: 1rem; }
  .admin-header { margin-bottom: 1.25rem; }
  .admin-header h1 { font-size: 1.25rem; }
  .cards { grid-template-columns: 1fr; gap: 1rem; margin-bottom: 1.5rem; }
  .card { padding: 1rem; }
  .table-wrap { border-radius: 8px; margin: 0 -0.5rem; }
  table { min-width: 400px; }
  th, td { padding: 0.75rem 1rem; font-size: 0.85rem; }
  .form-row.colors { grid-template-columns: 1fr; }
  .api-jogos-config { grid-template-columns: 1fr; }
  .api-jogos-grid { grid-template-columns: 1fr; }
  .api-jogos-add-row { flex-wrap: wrap; }
  .api-list-row { grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.8rem; }
  .api-games-grid { grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 0.75rem; }
  .temas-grid { grid-template-columns: 1fr; }
  .midia-grid { grid-template-columns: 1fr; }
  .modal { margin: 1rem; max-width: calc(100% - 2rem); }
  .admin-login-box { margin: 1rem; padding: 1.5rem; }
}

@media (max-width: 480px) {
  .admin-main { padding: 0.75rem; }
  .user-badge span:not(.dot) { display: none; }
  .btn { padding: 0.5rem 0.75rem; font-size: 0.8rem; }
  table { min-width: 320px; }
}
</style>
