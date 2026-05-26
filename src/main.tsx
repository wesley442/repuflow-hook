import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  AlertTriangle,
  ArrowRightLeft,
  BadgeCheck,
  Bell,
  BookOpen,
  CheckCircle2,
  Circle,
  Code2,
  History,
  ListChecks,
  Network,
  Rocket,
  Settings,
  Shield,
  Terminal,
  User,
  Wallet
} from "lucide-react";
import "./styles.css";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

type FlowQuality = "Helpful" | "Neutral" | "Toxic";
type Direction = "Buy" | "Sell";
type ActiveSection = "terminal" | "profiles" | "reputation" | "deployment" | "evidence";

type TraderProfile = {
  id: string;
  label: string;
  shortLabel: string;
  address: string;
  score: number;
  amount: number;
  imbalanceBps: number;
  description: string;
  signal: string;
};

type FeeQuote = {
  quality: FlowQuality;
  baseFee: number;
  flowAdjustment: number;
  reputationDiscount: number;
  finalFee: number;
  surcharge: number;
};

const profiles: TraderProfile[] = [
  {
    id: "good-agent",
    label: "Good Agent",
    shortLabel: "Trusted",
    address: "0xA91b...GOOD",
    score: 90,
    amount: 1,
    imbalanceBps: 300,
    description: "Clean historical execution and balance-improving flow.",
    signal: "Low slippage, recurring execution"
  },
  {
    id: "normal-trader",
    label: "Normal Trader",
    shortLabel: "Neutral",
    address: "0x51A8...BASE",
    score: 50,
    amount: 1,
    imbalanceBps: 100,
    description: "Default reputation and neutral trade impact.",
    signal: "Retail sized standard flow"
  },
  {
    id: "toxic-flow",
    label: "Toxic Flow",
    shortLabel: "Risky",
    address: "0xD15c...RISK",
    score: 20,
    amount: 20,
    imbalanceBps: 100,
    description: "Large one-sided flow that pays a surcharge to protect LPs.",
    signal: "High-impact one-sided pressure"
  }
];

const evidenceItems = [
  ["7 local tests", "PASSED"],
  ["v4 beforeSwap override", "VALIDATED"],
  ["v4 afterSwap settlement", "VALIDATED"],
  ["Frontend demo", "READY"],
  ["Demo pool", "DEPLOYED"],
  ["X Layer deployment", "LIVE"]
];

const deploymentFacts = [
  ["Network", "X Layer"],
  ["Chain ID", "196"],
  ["PoolManager", "0x360e...fb32"],
  ["Hook", "0xCA3F...80C0"],
  ["PoolId", "0x0d13...1631"],
  ["LP Protection", "80 bps"]
];

const navItems: Array<{ id: ActiveSection; label: string; icon: React.ReactNode }> = [
  { id: "terminal", label: "Terminal", icon: <Terminal size={19} /> },
  { id: "profiles", label: "Profiles", icon: <ListChecks size={19} /> },
  { id: "reputation", label: "Reputation", icon: <BadgeCheck size={19} /> },
  { id: "deployment", label: "Deployment", icon: <Network size={19} /> },
  { id: "evidence", label: "Evidence", icon: <History size={19} /> }
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function classifyFlow(profile: TraderProfile, direction: Direction): FlowQuality {
  if (profile.amount >= 10 || profile.imbalanceBps >= 700) return "Toxic";
  if (direction === "Sell" && profile.imbalanceBps >= 200) return "Helpful";
  return "Neutral";
}

function reputationDiscount(score: number) {
  if (score >= 90) return 10;
  if (score >= 80) return 8;
  if (score >= 70) return 5;
  return 0;
}

function quoteFee(profile: TraderProfile, direction: Direction): FeeQuote {
  const quality = classifyFlow(profile, direction);
  const flowAdjustment = quality === "Helpful" ? -10 : quality === "Toxic" ? 80 : 0;
  const discount = reputationDiscount(profile.score);
  const finalFee = clamp(30 + flowAdjustment - discount, 5, 150);

  return {
    quality,
    baseFee: 30,
    flowAdjustment,
    reputationDiscount: discount,
    finalFee,
    surcharge: Math.max(finalFee - 30, 0)
  };
}

function scoreDeltaFor(quality: FlowQuality) {
  if (quality === "Helpful") return "+2";
  if (quality === "Toxic") return "-8";
  return "+1";
}

function formatPercentFromBps(value: number) {
  return `${(value / 100).toFixed(2)}%`;
}

function profileIcon(id: string) {
  if (id === "good-agent") return <BadgeCheck size={18} />;
  if (id === "toxic-flow") return <AlertTriangle size={18} />;
  return <User size={18} />;
}

function App() {
  const [selectedId, setSelectedId] = useState(profiles[0].id);
  const [direction, setDirection] = useState<Direction>("Sell");
  const [protectionValue, setProtectionValue] = useState(80);
  const [lastAction, setLastAction] = useState("Ready to preview a RepuFlow swap.");
  const [walletAddress, setWalletAddress] = useState("");
  const [walletStatus, setWalletStatus] = useState("Not connected");
  const [notice, setNotice] = useState("X Layer deployment is live. Hook, pool, and demo swaps are recorded.");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<ActiveSection>("terminal");
  const [eventLog, setEventLog] = useState<string[]>([
    "Toxic flow swap recorded on X Layer",
    "RepuFlowV4Hook deployed with CREATE2",
    "Demo pool initialized on X Layer"
  ]);
  const selected = profiles.find((profile) => profile.id === selectedId) ?? profiles[0];
  const quote = useMemo(() => quoteFee(selected, direction), [selected, direction]);
  const scoreDelta = scoreDeltaFor(quote.quality);

  async function connectWallet() {
    if (!window.ethereum) {
      setWalletStatus("No injected wallet found. Install OKX Wallet or MetaMask.");
      return;
    }

    try {
      setWalletStatus("Connecting...");
      const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
      const account = accounts[0] ?? "";
      setWalletAddress(account);
      setWalletStatus(account ? "Connected" : "No account returned");
      setNotice(account ? "Wallet connected. Demo remains available without signing transactions." : "No account returned.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Wallet connection rejected.";
      setWalletStatus(message);
      setNotice(message);
    }
  }

  function runDemoSwap() {
    setProtectionValue((value) => value + quote.surcharge);
    const message = `${selected.label} settled at ${quote.finalFee} bps. Reputation ${scoreDelta}.`;
    setLastAction(message);
    setNotice("Demo swap settled. Fee, reputation, and LP protection state updated.");
    setEventLog((items) => [message, ...items].slice(0, 5));
  }

  function toggleDirection() {
    setDirection((current) => {
      const next = current === "Buy" ? "Sell" : "Buy";
      setNotice(`Swap direction changed to ${next}. Fee quote recalculated.`);
      return next;
    });
  }

  function showNotifications() {
    setNotice("Notifications: Day 3 deployment is live; prepare X post with screenshot.");
  }

  function toggleSettings() {
    setSettingsOpen((open) => !open);
    setNotice("Settings panel toggled. Demo mode uses deterministic local profile inputs.");
  }

  function openDeployReadiness() {
    goToSection("deployment");
    setNotice("Deployment details opened. Hook, PoolId, and LP protection evidence are ready for submission.");
  }

  function openDocs() {
    setDocsOpen((open) => !open);
    setNotice("Docs panel toggled. Showing formatted X Layer deployment steps.");
  }

  async function copyPoolManager() {
    await navigator.clipboard?.writeText("0x360e68faccca8ca495c1b759fd9eee466db9fb32");
    setNotice("PoolManager address copied.");
  }

  function goToSection(section: ActiveSection) {
    setActiveSection(section);
    document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="app-shell">
      <header className="top-nav">
        <div className="brand-zone">
          <strong className="brand">RepuFlow Hook</strong>
          <nav className="desktop-tabs" aria-label="Primary">
            <button
              className={activeSection === "terminal" ? "active-tab" : ""}
              type="button"
              onClick={() => goToSection("terminal")}
            >
              Dashboard
            </button>
            <button
              className={activeSection === "deployment" ? "active-tab" : ""}
              type="button"
              onClick={() => goToSection("deployment")}
            >
              Deployment
            </button>
            <button
              className={activeSection === "evidence" ? "active-tab" : ""}
              type="button"
              onClick={() => goToSection("evidence")}
            >
              Evidence
            </button>
          </nav>
        </div>
        <div className="top-actions">
          <span className="status-badge">X Layer</span>
          <span className="status-badge mint">Uniswap v4 Hook</span>
          <button className="icon-button" type="button" aria-label="Notifications" onClick={showNotifications}>
            <Bell size={18} />
          </button>
          <button className="icon-button" type="button" aria-label="Settings" onClick={toggleSettings}>
            <Settings size={18} />
          </button>
          <button type="button" className="connect-button" onClick={connectWallet}>
            <Wallet size={16} />
            {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Connect Wallet"}
          </button>
        </div>
      </header>

      <aside className="side-nav">
        <div className="protocol-chip">
          <span className="live-dot" />
          <div>
            <strong>v4-MAINNET</strong>
            <span>Protocol active</span>
          </div>
        </div>
        <nav aria-label="Dashboard sections">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`side-link ${activeSection === item.id ? "active" : ""}`}
              type="button"
              onClick={() => goToSection(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="side-footer">
          <button className="deploy-button" type="button" onClick={openDeployReadiness}>
            <Rocket size={16} />
            Deploy Hook
          </button>
          <button className="side-link muted docs-button" type="button" onClick={openDocs}>
            <BookOpen size={18} />
            <span>Docs</span>
          </button>
        </div>
      </aside>

      <main className="main-canvas">
        <section className="page-heading">
          <div>
            <p className="eyebrow">Reputation-aware dynamic fees</p>
            <h1>Execution Quality Terminal</h1>
            <p>Good agents get cheaper execution. Toxic flow pays more to LPs.</p>
          </div>
          <div className="wallet-readout">
            <span>{walletAddress ? "CONNECTED" : "WALLET"}</span>
            <strong>{walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : walletStatus}</strong>
          </div>
        </section>

        <section className="notice-strip" aria-live="polite">
          <Activity size={16} />
          <span>{notice}</span>
        </section>

        <section className="dashboard-grid" id="terminal">
          <section className="panel profile-panel" id="profiles">
            <div className="panel-header">
              <h2>Trader Profiles</h2>
              <span className="mini-badge">SIM_V1</span>
            </div>
            <p className="panel-copy">
              Select a trader profile to simulate how the Hook adjusts fees from flow quality and reputation.
            </p>
            <div className="profile-list">
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  type="button"
                  className={`profile-row ${profile.id === selected.id ? "selected" : ""} ${profile.id}`}
                  onClick={() => setSelectedId(profile.id)}
                >
                  <span className="profile-icon">{profileIcon(profile.id)}</span>
                  <span className="profile-main">
                    <strong>{profile.label}</strong>
                    <small>{profile.signal}</small>
                  </span>
                  <span className="profile-score">
                    <small>REP</small>
                    <strong>{profile.score}</strong>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="panel swap-panel">
            <div className="panel-header">
              <div className="pool-title">
                <div className="token-stack">
                  <span>X</span>
                  <span>U</span>
                </div>
                <div>
                  <h2>xOKB / xUSD</h2>
                  <small><Circle size={8} fill="currentColor" /> Hook active</small>
                </div>
              </div>
              <span className={`quality-tag ${quote.quality.toLowerCase()}`}>{quote.quality}</span>
            </div>

            <div className="swap-boxes">
              <div className="swap-box">
                <div>
                  <span>You pay</span>
                  <small>Bal: 12,450.00</small>
                </div>
                <strong>{selected.amount.toFixed(2)}</strong>
                <em>xOKB</em>
              </div>
              <button className="swap-direction" type="button" aria-label="Swap direction" onClick={toggleDirection}>
                <ArrowRightLeft size={18} />
              </button>
              <div className="swap-box">
                <div>
                  <span>You receive</span>
                  <small>Estimated</small>
                </div>
                <strong>{direction === "Sell" ? "3,142.25" : "3,088.40"}</strong>
                <em>xUSD</em>
              </div>
            </div>
            <div className="direction-readout">
              <span>Direction</span>
              <strong>{direction} xOKB</strong>
            </div>

            <button type="button" className="run-swap-button" onClick={runDemoSwap}>
              <Activity size={18} />
              Run Demo Swap
            </button>

            <div className="fee-panel">
              <div className="panel-header compact">
                <h3>Fee Calculation</h3>
                <span className="code-badge">v4.Hook_FeeManager</span>
              </div>
              <div className="formula">finalFee = baseFee + flowAdjustment - reputationDiscount</div>
              <div className="fee-layout">
                <div className="fee-lines">
                  <div>
                    <span>Base Fee</span>
                    <strong>{quote.baseFee} bps</strong>
                  </div>
                  <div>
                    <span>Flow Adjustment</span>
                    <strong className={quote.flowAdjustment > 0 ? "warn-value" : "mint-value"}>
                      {quote.flowAdjustment > 0 ? "+" : ""}{quote.flowAdjustment} bps
                    </strong>
                  </div>
                  <div>
                    <span>Reputation Discount</span>
                    <strong className="mint-value">-{quote.reputationDiscount} bps</strong>
                  </div>
                  <div>
                    <span>LP Surcharge</span>
                    <strong className={quote.surcharge > 0 ? "amber-value" : ""}>{quote.surcharge} bps</strong>
                  </div>
                </div>
                <div className={`final-fee ${quote.quality.toLowerCase()}`}>
                  <span>Final Dynamic Fee</span>
                  <strong>{formatPercentFromBps(quote.finalFee)}</strong>
                  <small>{quote.finalFee} bps</small>
                </div>
              </div>
            </div>
          </section>

          <section className="panel reputation-panel" id="reputation">
            <div className="panel-header">
              <h2>Reputation Index</h2>
              <span className={`mini-badge ${quote.quality.toLowerCase()}`}>{selected.shortLabel}</span>
            </div>
            <div className="score-meter">
              <div style={{ width: `${selected.score}%` }} />
            </div>
            <div className="score-labels">
              <span>Risky</span>
              <span>Normal</span>
              <span>Trusted</span>
            </div>
            <div className="protection-readout">
              <span>LP Protection</span>
              <strong>{protectionValue} bps</strong>
              <small>{quote.surcharge > 0 ? "+ surcharge armed" : "no surcharge"}</small>
            </div>
            <div className="settlement-log">
              <h3>Last Settlement</h3>
              <div>
                <CheckCircle2 size={18} />
                <span>{lastAction}</span>
              </div>
              <div>
                <Shield size={18} />
                <span>{selected.description}</span>
              </div>
            </div>
            <div className="strategy-note">
              <strong>Hook Strategy</strong>
              <p>Dynamic LP fee override rewards clean execution and routes toxic-flow surcharge into LP protection.</p>
            </div>
          </section>

          <section className="panel deployment-panel" id="deployment">
            <div className="panel-header">
              <div>
                <h2>Deployment Details</h2>
                <p>X Layer v4 Hook deployed</p>
              </div>
              <span className="mini-badge mint">LIVE ONCHAIN</span>
            </div>
            <div className="deployment-grid">
              {deploymentFacts.map(([label, value]) => (
                <button
                  key={label}
                  className="data-row data-button"
                  type="button"
                  onClick={label === "PoolManager" ? copyPoolManager : () => setNotice(`${label}: ${value}`)}
                >
                  <span>{label}</span>
                  <strong>{value}</strong>
                </button>
              ))}
            </div>
            <div className="mining-status">
              <Code2 size={18} />
              <div>
                <span>CREATE2 hook mining</span>
                <strong>SALT 0x1173</strong>
              </div>
            </div>
          </section>

          <section className="panel evidence-panel" id="evidence">
            <div className="panel-header">
              <h2>Submission Evidence</h2>
              <span className="mini-badge">DAY_3</span>
            </div>
            <div className="evidence-list">
              {evidenceItems.map(([label, status]) => (
                <button
                  key={label}
                  className="evidence-row evidence-button"
                  type="button"
                  onClick={() => setNotice(`${label}: ${status}`)}
                >
                  <span>{label}</span>
                  <strong className={status === "PENDING" ? "amber-value" : "mint-value"}>{status}</strong>
                </button>
              ))}
            </div>
          </section>
        </section>

        {settingsOpen && (
          <section className="panel settings-panel">
            <div className="panel-header">
              <h2>Demo Settings</h2>
              <span className="mini-badge">LOCAL MODE</span>
            </div>
            <div className="settings-grid">
              <div>
                <span>Fee model</span>
                <strong>base + flow - reputation</strong>
              </div>
              <div>
                <span>Profile source</span>
                <strong>deterministic fixtures</strong>
              </div>
              <div>
                <span>Network target</span>
                <strong>X Layer 196</strong>
              </div>
            </div>
          </section>
        )}

        {docsOpen && (
          <section className="panel docs-panel" id="docs">
            <div className="panel-header">
              <div>
                <h2>X Layer Deployment Docs</h2>
                <p>Formatted quick reference for the local deployment guide.</p>
              </div>
              <span className="mini-badge">DOCS</span>
            </div>
            <div className="docs-grid">
              <div>
                <h3>1. Configure environment</h3>
                <code>cp .env.example .env</code>
                <p>Set RPC, chain ID, PoolManager, and deployer private key.</p>
              </div>
              <div>
                <h3>2. Deploy base contracts</h3>
                <code>pnpm deploy:xlayer</code>
                <p>Deploy Registry, Vault, demo facade, and mock tokens.</p>
              </div>
              <div>
                <h3>3. Mine Hook address</h3>
                <code>pnpm mine:hook</code>
                <p>Use real Registry and Vault addresses before mining production salt.</p>
              </div>
              <div>
                <h3>4. Create dynamic-fee pool</h3>
                <code>fee = 0x800000</code>
                <p>Uniswap v4 fee override only works on dynamic-fee pools.</p>
              </div>
            </div>
            <p className="docs-path">
              Source: <code>docs/xlayer-deployment.md</code>
            </p>
          </section>
        )}

        <section className="panel event-panel">
          <div className="panel-header">
            <h2>Interaction Log</h2>
            <span className="mini-badge">LIVE</span>
          </div>
          <div className="event-list">
            {eventLog.map((item) => (
              <div key={item}>
                <CheckCircle2 size={15} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
