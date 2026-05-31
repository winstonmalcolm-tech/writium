<template>
  <div class="mockup-wrap">
    <div class="mockup mockup-float">

      <!-- Titlebar -->
      <div class="m-titlebar">
        <div class="m-tb-left">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FB923C"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <span class="m-tb-name">Writium</span>
        </div>
        <span class="m-tb-title">Research Paper.docx</span>
        <div class="m-tb-controls">
          <span /><span /><span class="cls" />
        </div>
      </div>
      <div class="m-accent-bar" />

      <!-- Body -->
      <div class="m-body">

        <!-- Sidebar -->
        <div class="m-sidebar">
          <div class="m-sb-brand">W</div>
          <div class="m-sb-items">
            <div class="m-sb-item active">
              <span class="m-dot orange" /><div class="m-line" />
            </div>
            <div class="m-sb-item">
              <span class="m-dot" /><div class="m-line dim" />
            </div>
            <div class="m-sb-item">
              <span class="m-dot" /><div class="m-line dim short" />
            </div>
          </div>
          <div class="m-sb-divider" />
          <div class="m-sb-label">REFS</div>
          <div class="m-sb-items">
            <div class="m-sb-item">
              <span class="m-dot orange" /><div class="m-line dim" />
            </div>
            <div class="m-sb-item">
              <span class="m-dot" /><div class="m-line dim short" />
            </div>
          </div>
        </div>

        <!-- Editor -->
        <div class="m-editor">
          <div class="m-toolbar">
            <div class="m-tb-btn" /><div class="m-tb-btn" /><div class="m-tb-btn" />
            <div class="m-tb-sep" />
            <div class="m-tb-btn wide" /><div class="m-tb-btn wide" />
            <div class="m-tb-sep" />
            <span class="m-tb-ai">✦</span>
          </div>

          <div class="m-canvas">
            <div class="m-page">
              <div class="m-line heading" />
              <div class="m-line full" /><div class="m-line full" />
              <div class="m-line three-q" />
              <div class="m-gap" />
              <div class="m-line full" />
              <div class="m-cite-row">
                <div class="m-line half-w" />
                <span class="m-cite-badge">[Smith, 2023]</span>
              </div>
              <div class="m-line two-q" />
            </div>

            <!-- /ai floating palette -->
            <div class="m-palette">
              <div class="m-pal-head">
                <span class="m-pal-spark">✦</span>
                <span class="m-pal-cmd">/ai</span>
              </div>
              <div class="m-pal-item active">Suggest</div>
              <div class="m-pal-item">Rephrase</div>
              <div class="m-pal-item">Humanize</div>
            </div>
          </div>
        </div>

        <!-- Right panel -->
        <div class="m-panel">
          <div class="m-panel-tabs">
            <div class="m-panel-tab active">AI</div>
            <div class="m-panel-tab">Refs</div>
          </div>
          <div class="m-panel-body">
            <div class="m-p-line" /><div class="m-p-line short" />
            <div class="m-p-chip" />
            <div class="m-p-line" /><div class="m-p-line short" />
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.mockup-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.mockup {
  width: 100%;
  max-width: 520px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow:
    0 2px 4px rgba(0,0,0,0.14),
    0 10px 30px rgba(0,0,0,0.22),
    0 36px 88px rgba(0,0,0,0.26),
    0 0 0 1px rgba(255,255,255,0.04);
}

/* ── Titlebar ── */
.m-titlebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 38px;
  padding: 0 12px;
  background: #1A1109;
  position: relative;
}
.m-tb-left { display: flex; align-items: center; gap: 6px; }
.m-tb-name { font-size: 10px; font-weight: 800; color: #FB923C; letter-spacing: 0.06em; }
.m-tb-title {
  position: absolute; left: 50%; transform: translateX(-50%);
  font-size: 10px; color: #4A3828; font-family: 'Lato', sans-serif;
}
.m-tb-controls { display: flex; gap: 6px; align-items: center; }
.m-tb-controls span { width: 10px; height: 10px; border-radius: 50%; background: #2C1E10; }
.m-tb-controls span.cls { background: rgba(234,88,12,0.45); }

.m-accent-bar { height: 2px; background: linear-gradient(90deg, #EA580C, #F97316, #FBBF24); }

/* ── Body ── */
.m-body { display: flex; height: 340px; }

/* ── Sidebar ── */
.m-sidebar {
  width: 56px;
  background: #1A1109;
  border-right: 1px solid #2C1E10;
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}
.m-sb-brand {
  width: 28px; height: 28px; border-radius: 7px;
  background: rgba(234,88,12,0.15); color: #FB923C;
  font-size: 11px; font-weight: 900;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 14px; font-family: 'Lato', sans-serif;
}
.m-sb-items { width: 100%; padding: 0 8px; display: flex; flex-direction: column; gap: 4px; }
.m-sb-item { display: flex; align-items: center; gap: 5px; padding: 3px 0; }
.m-dot { width: 5px; height: 5px; border-radius: 50%; background: #2C1E10; flex-shrink: 0; }
.m-dot.orange { background: #EA580C; }
.m-line { height: 4px; border-radius: 2px; background: #2C1E10; flex: 1; }
.m-line.dim { opacity: 0.55; }
.m-line.short { width: 60%; flex: unset; }
.m-sb-divider { width: 32px; height: 1px; background: #2C1E10; margin: 8px 0; }
.m-sb-label { font-size: 7px; font-weight: 700; color: #3C2E1E; letter-spacing: 0.08em; margin-bottom: 6px; font-family: 'Lato', sans-serif; }

/* ── Editor ── */
.m-editor { flex: 1; display: flex; flex-direction: column; background: #F5EFE6; min-width: 0; }
.m-toolbar {
  display: flex; align-items: center; gap: 4px;
  padding: 6px 10px;
  background: #FFFFFF;
  border-bottom: 1px solid #EDE8DF;
  flex-shrink: 0;
}
.m-tb-btn { width: 16px; height: 13px; border-radius: 3px; background: #E8E0D5; flex-shrink: 0; }
.m-tb-btn.wide { width: 22px; }
.m-tb-sep { width: 1px; height: 13px; background: #EDE8DF; margin: 0 2px; flex-shrink: 0; }
.m-tb-ai { font-size: 10px; color: #EA580C; font-weight: 700; margin-left: 2px; }

.m-canvas { flex: 1; padding: 12px; display: flex; justify-content: center; position: relative; overflow: hidden; }
.m-page {
  background: #FFFFFF;
  width: 100%; max-width: 260px;
  border-radius: 3px; padding: 14px 16px;
  box-shadow: 0 2px 8px rgba(120,70,20,0.09);
  display: flex; flex-direction: column; gap: 5px;
  align-self: flex-start;
}
.m-line { height: 5px; border-radius: 2px; background: #E8E0D5; }
.m-line.heading { height: 9px; width: 70%; background: #C4AD96; margin-bottom: 4px; }
.m-line.full { width: 100%; }
.m-line.three-q { width: 75%; }
.m-line.half-w { width: 42%; }
.m-line.two-q { width: 58%; }
.m-gap { height: 7px; }
.m-cite-row { display: flex; align-items: center; gap: 6px; }
.m-cite-badge {
  font-size: 6px; font-weight: 700;
  color: #EA580C;
  background: rgba(234,88,12,0.1);
  border: 0.5px solid rgba(234,88,12,0.3);
  padding: 1px 4px; border-radius: 3px;
  white-space: nowrap; flex-shrink: 0;
  font-family: 'Lato', sans-serif;
}

/* /ai palette */
.m-palette {
  position: absolute; right: 14px; bottom: 20px;
  background: #FFFFFF;
  border: 1px solid #E8E0D5; border-radius: 8px;
  box-shadow: 0 6px 24px rgba(80,40,10,0.18);
  width: 88px; overflow: hidden;
}
.m-pal-head {
  display: flex; align-items: center; gap: 4px;
  padding: 6px 8px; border-bottom: 1px solid #F0EAE0;
}
.m-pal-spark { font-size: 9px; color: #EA580C; }
.m-pal-cmd { font-size: 9px; font-weight: 700; color: #1C1410; font-family: 'Lato', sans-serif; }
.m-pal-item {
  font-size: 9px; padding: 5px 8px;
  color: #5C4F42; font-family: 'Lato', sans-serif;
}
.m-pal-item.active { background: rgba(234,88,12,0.09); color: #EA580C; font-weight: 700; }

/* ── Right panel ── */
.m-panel {
  width: 72px; background: #FBF7F2;
  border-left: 1px solid #EDE8DF;
  flex-shrink: 0; display: flex; flex-direction: column;
}
.m-panel-tabs { display: flex; border-bottom: 1px solid #EDE8DF; }
.m-panel-tab {
  flex: 1; padding: 5px 4px;
  font-size: 7px; font-weight: 700;
  color: #A0907E; text-align: center;
  font-family: 'Lato', sans-serif;
}
.m-panel-tab.active { color: #EA580C; border-bottom: 1.5px solid #EA580C; }
.m-panel-body { padding: 8px 6px; display: flex; flex-direction: column; gap: 5px; }
.m-p-line { height: 5px; border-radius: 2px; background: #E8E0D5; }
.m-p-line.short { width: 60%; }
.m-p-chip {
  height: 16px; border-radius: 4px;
  background: rgba(234,88,12,0.1);
  border: 0.5px solid rgba(234,88,12,0.2);
}
</style>
