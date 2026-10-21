/**
 * Mini live preview of Header and Footer
 */

import React, { useRef, useState, useLayoutEffect, useCallback } from 'react';
import { Block, EbookSettings, PageLayout } from '../types/ebook';
import {
  getDocumentStyles,
  getDocumentDataAttributes,
  PageView,
  ContentBlockView,
} from './PageRenderer';

const A4_WIDTH_PX = 794;

interface MiniPreviewProps {
  s: EbookSettings;
  blocks: Block[];
  layout: PageLayout[] | null;
}

export const MiniPreview: React.FC<MiniPreviewProps> = ({ s, blocks, layout }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.45);

  const updateScale = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const w = el.clientWidth;
    if (w > 0) {
      setScale(Math.min(1, (w - 20) / A4_WIDTH_PX));
    }
  }, []);

  useLayoutEffect(() => {
    updateScale();
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateScale);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateScale]);

  const firstPage = layout?.[0];
  const firstCol = firstPage?.columns[0] || [];

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden rounded-2xl border border-dashed border-line bg-canvas p-2.5"
      aria-label="Live Header/Footer Mini Preview"
    >
      <div
        className="doc flex justify-center"
        style={{
          ...getDocumentStyles(s),
          zoom: scale,
        }}
        {...getDocumentDataAttributes(s)}
      >
        <PageView
          s={s}
          no={1}
          section={firstPage?.section || s.title.split('—')[0]}
          hf={s.hf}
          mini={true}
          columns={[
            <div key="col0">
              {firstCol.slice(0, 4).map((ref, idx) => {
                const b = blocks[ref.i];
                if (!b) return null;
                return (
                  <div key={idx} className="blk">
                    <ContentBlockView b={b} r0={ref.r0} r1={ref.r1} subText={ref.subText} />
                  </div>
                );
              })}
            </div>,
          ]}
        />
      </div>
    </div>
  );
};
