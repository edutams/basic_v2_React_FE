import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { memo, useState, useContext } from 'react';
import { CustomizerContext, CustomizerContextProvider } from './CustomizerContext';

const renderSpy = vi.fn();

const Consumer = memo(function Consumer() {
  const { activeMode } = useContext(CustomizerContext);
  renderSpy();
  return <div>{activeMode}</div>;
});

function Harness() {
  const [count, setCount] = useState(0);
  return (
    <CustomizerContextProvider>
      <button onClick={() => setCount((c) => c + 1)}>bump {count}</button>
      <Consumer />
    </CustomizerContextProvider>
  );
}

describe('CustomizerContextProvider', () => {
  it('does not re-render memoized consumers when an unrelated ancestor re-renders', () => {
    renderSpy.mockClear();
    render(<Harness />);
    expect(renderSpy).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText(/bump/));

    // The context value must be the same object reference across this
    // re-render for the memoized consumer to skip re-rendering.
    expect(renderSpy).toHaveBeenCalledTimes(1);
  });
});
