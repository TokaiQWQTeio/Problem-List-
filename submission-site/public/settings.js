const $ = (selector, root = document) => root.querySelector(selector);
const state = { session: null, config: null };

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

function message(text, kind = "success") {
  const element = $("#settings-message");
  element.textContent = text;
  element.className = `message ${kind}`;
  element.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

async function api(path, method = "GET", body) {
  const response = await fetch(path, {
    method,
    headers: { ...(method === "GET" ? {} : { "x-csrf-token": state.session.csrf }), ...(body ? { "content-type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || `请求失败：HTTP ${response.status}`);
  return result;
}

async function refresh() {
  state.config = await api("/api/admin/ai");
  renderProviders();
  renderModels();
  renderDefault();
}

function renderProviders() {
  const { providers, models } = state.config;
  $("#provider-list").innerHTML = providers.map((provider) => {
    const options = models.filter((model) => model.provider === provider.id)
      .map((model) => `<option value="${escapeHtml(model.id)}">${escapeHtml(model.label)} · ${escapeHtml(model.id)}</option>`).join("");
    const status = provider.configured ? "已配置" : "未配置";
    const source = provider.source === "environment" ? "（原有部署配置）" : "";
    return `<article class="provider-card" data-provider="${provider.id}">
      <div class="provider-card-head"><h3>${escapeHtml(provider.name)}</h3><span class="key-status ${provider.configured ? "ready" : ""}">${status}${source}</span></div>
      <label>API 密钥<input class="provider-key" type="password" maxlength="512" autocomplete="new-password" spellcheck="false" placeholder="粘贴新的密钥；保存后不再显示"></label>
      <div class="provider-actions"><button type="button" class="primary-button" data-action="save-key">保存或更换</button><button type="button" class="secondary-button" data-action="delete-key" ${provider.configured ? "" : "disabled"}>删除密钥</button></div>
      <div class="provider-test"><select aria-label="测试 ${escapeHtml(provider.name)} 模型" class="test-model">${options || '<option value="">先添加模型</option>'}</select><button type="button" class="secondary-button" data-action="test-key" ${provider.configured && options ? "" : "disabled"}>测试连接</button></div>
    </article>`;
  }).join("");
}

function renderModels() {
  $("#model-list").innerHTML = state.config.models.map((model) => `<div class="model-row" data-provider="${model.provider}" data-model-id="${escapeHtml(model.id)}">
    <span class="model-id">${escapeHtml(model.provider)} / ${escapeHtml(model.id)}</span>
    <input class="model-label" aria-label="${escapeHtml(model.id)} 的显示名称" maxlength="80" value="${escapeHtml(model.label)}">
    <label class="model-toggle"><input class="model-enabled" type="checkbox" ${model.enabled ? "checked" : ""}><span>开放</span></label>
    <button type="button" class="secondary-button" data-action="save-model">保存</button>
    ${model.built_in ? "" : '<button type="button" class="text-button" data-action="delete-model">删除</button>'}
    ${model.configured ? "" : '<small class="model-unavailable">密钥未配置</small>'}
  </div>`).join("");
}

function renderDefault() {
  const enabled = state.config.models.filter((model) => model.enabled && model.configured);
  $("#default-model").innerHTML = enabled.length
    ? enabled.map((model) => `<option value="${escapeHtml(`${model.provider}:${model.id}`)}" ${`${model.provider}:${model.id}` === state.config.default_model ? "selected" : ""}>${escapeHtml(model.label)} · ${escapeHtml(model.id)}</option>`).join("")
    : '<option value="">先保存密钥并开放模型</option>';
  $("#save-default").disabled = !enabled.length;
}

async function onProviderAction(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const card = button.closest("[data-provider]");
  const provider = card.dataset.provider;
  const action = button.dataset.action;
  try {
    button.disabled = true;
    if (action === "save-key") {
      const keyInput = $(".provider-key", card);
      const key = keyInput.value.trim();
      if (!key) throw new Error("请先填写新的 API 密钥。");
      await api(`/api/admin/ai/keys/${provider}`, "PUT", { key });
      keyInput.value = "";
      message(`${provider} 密钥已保存。可点击“测试连接”验证。`);
    } else if (action === "delete-key") {
      if (!confirm(`确定删除 ${provider} 的密钥吗？该服务商的模型会立即停止出现在录题页。`)) return;
      await api(`/api/admin/ai/keys/${provider}`, "DELETE");
      message(`${provider} 密钥已删除。`);
    } else if (action === "test-key") {
      const modelId = $(".test-model", card).value;
      if (!modelId) throw new Error("请先选择一个模型。");
      await api(`/api/admin/ai/keys/${provider}/test`, "POST", { model_id: modelId });
      message(`${provider} / ${modelId} 连接成功。测试调用可能产生少量费用。`);
    }
    await refresh();
  } catch (error) { message(error.message, "error"); }
  finally { button.disabled = false; }
}

async function onModelAction(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const row = button.closest(".model-row");
  const { provider, modelId: id } = row.dataset;
  try {
    button.disabled = true;
    if (button.dataset.action === "save-model") {
      await api("/api/admin/ai/models", "PUT", { provider, id, label: $(".model-label", row).value.trim(), enabled: $(".model-enabled", row).checked });
      message(`${id} 设置已保存。`);
    } else if (button.dataset.action === "delete-model") {
      if (!confirm(`确定从模型列表删除 ${id} 吗？`)) return;
      await api(`/api/admin/ai/models/${provider}/${id}`, "DELETE");
      message(`${id} 已从模型列表删除。`);
    }
    await refresh();
  } catch (error) { message(error.message, "error"); }
  finally { button.disabled = false; }
}

async function addModel(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  try {
    await api("/api/admin/ai/models", "PUT", { provider: data.get("provider"), id: String(data.get("id")).trim(), label: String(data.get("label")).trim(), enabled: data.has("enabled") });
    message(`${data.get("id")} 已添加。`);
    form.reset();
    await refresh();
  } catch (error) { message(error.message, "error"); }
}

async function saveDefault() {
  const [provider, id] = $("#default-model").value.split(":");
  try { await api("/api/admin/ai/default", "PUT", { provider, id }); message("默认模型已保存。"); await refresh(); }
  catch (error) { message(error.message, "error"); }
}

async function initialize() {
  try {
    const response = await fetch("/api/session");
    state.session = await response.json();
    if (!state.session.authenticated || !state.session.is_ai_admin) throw new Error("只有题库管理员能管理模型设置。");
    await refresh();
    $("#provider-list").addEventListener("click", onProviderAction);
    $("#model-list").addEventListener("click", onModelAction);
    $("#add-model").addEventListener("submit", addModel);
    $("#save-default").addEventListener("click", saveDefault);
  } catch (error) { $("#provider-list").textContent = "无法读取模型设置。"; message(error.message, "error"); }
}

initialize();
