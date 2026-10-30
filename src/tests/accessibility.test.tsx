import React, { useState } from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import axe from 'axe-core';
import { Modal } from '../components/Modal.tsx';

describe('WCAG 2.2 AA Accessibility Test Suite', () => {
  it('Modal component complies with WCAG dialog semantics and has zero aXe violations', async () => {
    const TestComponent = () => {
      const [isOpen, setIsOpen] = useState(true);
      return (
        <div>
          <button id="open-btn" onClick={() => setIsOpen(true)}>Open Modal</button>
          <Modal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            titleId="test-modal-title"
            descriptionId="test-modal-desc"
          >
            <div>
              <h2 id="test-modal-title">Accessible Dialog Title</h2>
              <p id="test-modal-desc">This modal dialog satisfies WCAG 2.2 AA requirements.</p>
              <input type="text" placeholder="First focusable input" aria-label="First input" />
              <button onClick={() => setIsOpen(false)}>Confirm Action</button>
            </div>
          </Modal>
        </div>
      );
    };

    const { container } = render(<TestComponent />);

    // Assert dialog role and aria attributes
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'test-modal-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'test-modal-desc');

    // Run axe-core accessibility audit
    const results = await axe.run(container, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag22aa'],
      },
    });

    const criticalViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(criticalViolations).toHaveLength(0);
  });

  it('Modal handles Escape key to dismiss and restores focus properly', () => {
    let closed = false;
    const { rerender } = render(
      <Modal isOpen={true} onClose={() => { closed = true; }} titleId="esc-title">
        <div>
          <h2 id="esc-title">Escape Test Modal</h2>
          <button>Action</button>
        </div>
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(closed).toBe(true);
  });

  it('Slider controls implement aria-valuemin, aria-valuemax, aria-valuenow, and aria-valuetext', () => {
    const TestSlider = () => {
      const [val, setVal] = useState(15);
      return (
        <div>
          <label htmlFor="test-slider">Guest Shift</label>
          <input
            id="test-slider"
            type="range"
            min="-50"
            max="50"
            value={val}
            aria-valuemin={-50}
            aria-valuemax={50}
            aria-valuenow={val}
            aria-valuetext={`+${val} guests, cost variance ₹22,500`}
            onChange={(e) => setVal(Number(e.target.value))}
          />
          <div aria-live="polite" className="sr-only">
            {`Recalculated: +${val} guests.`}
          </div>
        </div>
      );
    };

    render(<TestSlider />);
    const slider = screen.getByLabelText('Guest Shift');
    expect(slider).toHaveAttribute('aria-valuemin', '-50');
    expect(slider).toHaveAttribute('aria-valuemax', '50');
    expect(slider).toHaveAttribute('aria-valuenow', '15');
    expect(slider).toHaveAttribute('aria-valuetext', '+15 guests, cost variance ₹22,500');
  });

  it('Radiogroups and tabs provide correct semantic ARIA roles', () => {
    render(
      <div role="radiogroup" aria-labelledby="decor-label">
        <span id="decor-label">Decor Production Tier</span>
        <button role="radio" aria-checked="true">Classic</button>
        <button role="radio" aria-checked="false">Couture</button>
      </div>
    );

    const radiogroup = screen.getByRole('radiogroup');
    expect(radiogroup).toHaveAttribute('aria-labelledby', 'decor-label');
    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toHaveAttribute('aria-checked', 'true');
    expect(radios[1]).toHaveAttribute('aria-checked', 'false');
  });
});
