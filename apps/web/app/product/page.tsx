import Link from 'next/link';
import { boundaryItems, capabilities, pipelineNodes, productStatus } from '../../lib/product-data';
import { PageHeader, PublicLayout, SectionLabel, TraceMark } from '../components/public';

export default function ProductPage() {
  return (
    <PublicLayout>
      <main id="main-content" className="public-container public-page">
        {/* =================================================================
            Page Header (Tightened Vertical Rhythm)
            ================================================================= */}
        <PageHeader
          eyebrow="Product Architecture"
          title="A calm system for understanding software change."
          body="TRACE connects change intent to implementation, evidence, impact, decisions, risks, conflicts, and remaining work — keeping intelligence portable across teams and AI agents."
        />

        {/* =================================================================
            System Architecture Diagram Flow (Reasoning Pipeline)
            ================================================================= */}
        <section className="product-architecture-flow" aria-label="TRACE System Architecture Flow">
          <div className="architecture-flow__title">
            <div className="architecture-flow__title-left">
              <TraceMark size={14} />
              <span>System Architecture Flow</span>
            </div>
            <span>Reasoning Pipeline</span>
          </div>

          <div className="architecture-flow__nodes" role="list">
            {pipelineNodes.map((node) => (
              <div
                key={node.step}
                className={`arch-node ${node.active ? 'arch-node--active' : ''}`}
                role="listitem"
              >
                <div className="arch-node__header">
                  <span className="arch-node__step">{node.step}</span>
                  <span className="arch-node__stage">{node.stage}</span>
                </div>
                <strong className="arch-node__label">{node.label}</strong>
                <span className="arch-node__desc">{node.description}</span>
              </div>
            ))}
          </div>
        </section>

        {/* =================================================================
            Layered Core Capabilities (Mapped to Pipeline Stages)
            ================================================================= */}
        <section className="product-capability-stack" aria-label="Core Product Capabilities">
          <div className="section-header-compact" style={{ marginBottom: '16px' }}>
            <SectionLabel>Core Capabilities</SectionLabel>
            <h2>Layered intelligence across the change lifecycle.</h2>
            <p>Each capability maps directly to a verified stage of the reasoning pipeline.</p>
          </div>

          {capabilities.map((cap) => (
            <article className="capability-layer" key={cap.index}>
              <div className="capability-layer__content">
                <div className="capability-layer__stage-badge">
                  <span className="capability-layer__index">{cap.index}</span>
                  <span className="capability-layer__stage-text">{cap.pipelineStage}</span>
                </div>
                <h2>{cap.title}</h2>
                <p>{cap.value}</p>
                <div className="capability-layer__status-note">{cap.statusNote}</div>
              </div>

              <div className="capability-layer__mock" aria-label={`UI fragment for ${cap.title}`}>
                <div className="capability-layer__mock-header">
                  <span>{cap.mock.header}</span>
                  <span className="trace-badge trace-badge--info">{cap.mock.badge}</span>
                </div>
                <div className="capability-layer__mock-body">
                  <strong>{cap.mock.body}</strong>
                </div>
                <div className="capability-layer__mock-evidence">
                  <code>{cap.mock.evidence}</code>
                </div>
                <div className="capability-layer__mock-footer">
                  <span>{cap.mock.footer}</span>
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* =================================================================
            Local-First Boundary & Privacy Guarantees
            ================================================================= */}
        <section className="product-boundary-section" aria-labelledby="boundary-heading">
          <div className="section-header-compact">
            <SectionLabel>Privacy & architectural boundary</SectionLabel>
            <h2 id="boundary-heading">Strict local-first boundaries by design.</h2>
            <p>Verification occurs where your code lives. Raw source code never leaves your perimeter.</p>
          </div>

          <div className="product-boundary-grid">
            {boundaryItems.map((item) => (
              <div className="boundary-card" key={item.title}>
                <div className="boundary-card__header">
                  <span className="boundary-card__tag">{item.tag}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* =================================================================
            Current Implementation Truth Disclosure
            ================================================================= */}
        <section className="product-status-band" aria-labelledby="status-heading">
          <div className="product-status-band__header">
            <div className="product-status-band__header-title">
              <TraceMark size={14} />
              <h3 id="status-heading">Current implementation truth</h3>
            </div>
            <span className="trace-badge trace-badge--info">Phase 05 Verified Universe</span>
          </div>

          <div className="product-status-band__grid">
            <div className="status-column">
              <h4>What exists and works now</h4>
              <ul>
                {productStatus.exists.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>

            <div className="status-column status-column--planned">
              <h4>What is planned for future phases</h4>
              <ul>
                {productStatus.planned.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="product-status-band__footer">
            <Link className="inline-link" href="/specification">
              Read the .trace artifact specification →
            </Link>
            <span className="status-footer-divider">·</span>
            <Link className="inline-link" href="/security">
              Review security & privacy architecture →
            </Link>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
